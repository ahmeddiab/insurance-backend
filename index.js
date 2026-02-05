const express = require('express');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0";

app.post('/create-payment', async (req, res) => {
    const { amount, orderId } = req.body;
    const logs = [];

    const payload = {
        amount: parseFloat(amount),
        currency: "IQD",
        order_id: orderId || `ORD-${Date.now()}`,
        description: "Insurance Premium",
        transaction_type: "Retail",
        redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html"
    };

    // --- محاولة 1: Basic Auth (JSON) ---
    try {
        console.log("👉 Trying Method 1: Basic Auth...");
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const r1 = await axios.post(API_URL, payload, {
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            }
        });
        console.log("✅ Method 1 Worked!");
        return res.json({ success: true, method: "Basic Auth", ...r1.data });
    } catch (e) {
        console.log("❌ Method 1 Failed:", e.response?.data || e.message);
        logs.push({ method: "Basic Auth", error: e.response?.data });
    }

    // --- محاولة 2: Credentials inside Body (JSON) ---
    try {
        console.log("👉 Trying Method 2: Body Auth (JSON)...");
        const payloadWithAuth = { ...payload, client_id: CLIENT_ID, client_secret: CLIENT_SECRET };
        const r2 = await axios.post(API_URL, payloadWithAuth, {
            headers: { "Content-Type": "application/json" }
        });
        console.log("✅ Method 2 Worked!");
        return res.json({ success: true, method: "Body Auth", ...r2.data });
    } catch (e) {
        console.log("❌ Method 2 Failed:", e.response?.data || e.message);
        logs.push({ method: "Body JSON", error: e.response?.data });
    }

    // --- محاولة 3: Form Data (Legacy) ---
    try {
        console.log("👉 Trying Method 3: Form Data...");
        const formData = qs.stringify({ ...payload, client_id: CLIENT_ID, client_secret: CLIENT_SECRET });
        const r3 = await axios.post(API_URL, formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        console.log("✅ Method 3 Worked!");
        return res.json({ success: true, method: "Form Data", ...r3.data });
    } catch (e) {
        console.log("❌ Method 3 Failed:", e.response?.data || e.message);
        logs.push({ method: "Form Data", error: e.response?.data });
    }

    // اذا وصل هنا يعني فشلت الـ 3 طرق
    console.log("💀 All methods failed.");
    res.status(500).json({ 
        success: false, 
        message: "All authentication methods failed. The credentials might be blocked.",
        debug_logs: logs 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
