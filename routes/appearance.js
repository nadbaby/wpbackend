const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '../appearance_settings.json');

const defaultSettings = {
    brandColor: "#25D366",
    secondaryColor: "#128C7E",
    outColor: "#DCF8C6",
    inColor: "#FFFFFF",
    outTextColor: "#111827",
    inTextColor: "#111827",
    font: "Inter",
    bubbleStyle: "Rounded",
    widgetPos: "Right",
    companyName: "WhatsApi Support",
    subtitle: "Typically replies instantly",
    welcomeMsg: "Hi! How can we help you today? 👋",
    buttonText: "Chat with us",
    buttonStyle: "pill",
    showBranding: true,
    showUnreadBadge: true,
    radius: 12,
    spacing: 8,
    bgType: "pattern",
    customBgColor: "#ECE5DD",
    logoUrl: null,
    quickReplies: ["Pricing info 💳", "Product features 🚀", "Talk to an agent 👤"],
};

// Helper to read settings
const getSettings = () => {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf8');
            return { ...defaultSettings, ...JSON.parse(data) };
        }
    } catch (e) {
        console.error('Error reading appearance settings:', e);
    }
    return defaultSettings;
};

// Helper to save settings
const saveSettings = (settings) => {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(settings, null, 2), 'utf8');
    } catch (e) {
        console.error('Error saving appearance settings:', e);
    }
};

// GET current appearance settings
router.get('/', (req, res) => {
    const settings = getSettings();
    res.json({
        success: true,
        data: settings,
    });
});

// POST update appearance settings
router.post('/', (req, res) => {
    const current = getSettings();
    const updated = { ...current, ...req.body };
    saveSettings(updated);
    res.json({
        success: true,
        message: 'Appearance settings saved successfully',
        data: updated,
    });
});

// POST reset to defaults
router.post('/reset', (req, res) => {
    saveSettings(defaultSettings);
    res.json({
        success: true,
        message: 'Appearance reset to default settings',
        data: defaultSettings,
    });
});

module.exports = router;
