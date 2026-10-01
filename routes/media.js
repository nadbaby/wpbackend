const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { pool } = require('../db');

// We will use memoryStorage so the file buffer is easily uploaded to S3.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB per file

const s3 = new S3Client({ forcePathStyle: true });
const BUCKET = "media";

// Get library
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM media_items ORDER BY created_at DESC');

        // Generate valid presigned URLs for all items so the frontend can securely render them
        const items = await Promise.all(result.rows.map(async (row) => {
            try {
                const url = await getSignedUrl(
                    s3,
                    new GetObjectCommand({ Bucket: BUCKET, Key: row.s3_key }),
                    { expiresIn: 3600 }
                );
                // Format date string for front-end
                const formattedDate = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return { ...row, url, date: formattedDate };
            } catch (e) {
                return { ...row, url: null, date: "Unknown" }; // fallback
            }
        }));

        res.json(items);
    } catch (e) {
        console.error("GET Media Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Upload a single file
router.post('/upload', upload.single('media_file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const key = `uploads/${Date.now()}-${req.file.originalname}`;

        // Upload to Neon Object Storage via Native AWS SDK
        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            })
        );

        const sizeFormat = (req.file.size / (1024 * 1024)).toFixed(1) + " MB";
        const authorName = "Admin"; // Hardcoding for simplicity if no auth is present on the route

        // Detect type purely on mimetype for categorization (image, video, document, audio)
        let type = "document";
        if (req.file.mimetype.startsWith('image/')) type = "image";
        else if (req.file.mimetype.startsWith('video/')) type = "video";
        else if (req.file.mimetype.startsWith('audio/')) type = "audio";

        // Insert metadata into PostgreSQL
        const result = await pool.query(
            'INSERT INTO media_items (name, type, size, s3_key, author) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.file.originalname, type, sizeFormat, key, authorName]
        );

        res.json({ success: true, item: result.rows[0] });
    } catch (e) {
        console.error("Upload Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Delete media
router.delete('/:id', async (req, res) => {
    try {
        const row = await pool.query('SELECT s3_key FROM media_items WHERE id = $1', [req.params.id]);
        if (row.rows.length === 0) return res.status(404).json({ error: "Not found" });

        // Delete from Neon Object Storage
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: row.rows[0].s3_key }));

        // Delete from DB
        await pool.query('DELETE FROM media_items WHERE id = $1', [req.params.id]);

        res.json({ success: true });
    } catch (e) {
        console.error("Delete Media Error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
