const express = require('express');
const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const API_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Webhook Verification (Required by Meta)
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.status(400).send("Missing parameters");
    }
});

// Webhook Event Intake (Incoming messages, statuses, etc)
router.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {

            // Loop over all entries and changes
            if (body.entry && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
                const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
                const from = body.entry[0].changes[0].value.messages[0].from;
                const msg_body = body.entry[0].changes[0].value.messages[0].text?.body;

                console.log(`[WhatsApp] Received message from ${from}: ${msg_body}`);
                // TODO: Forward to generic Socket.IO dispatcher or write to Database here
            }

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        console.error("Webhook processing error:", err);
        res.sendStatus(500);
    }
});

// API route to Outbound Send Message easily
router.post('/send', async (req, res) => {
    const { to, message } = req.body;

    if (!API_TOKEN || !PHONE_ID) {
        return res.status(500).json({ error: "WhatsApp Cloud API ENVs are not strictly configured yet." });
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { preview_url: false, body: message }
            })
        });

        const data = await response.json();
        if (response.ok) {
            res.json({ success: true, meta: data });
        } else {
            res.status(400).json({ success: false, error: data });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
