const express = require('express');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs'); // مكتبة مهمة لتحويل البيانات

const app = express();
app.use(cors()); // السماح للكل
app.use(express.json());

// رابط التيست (v1)
const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// بيانات التيست الصحيحة (تأكدنا منها من الصور)
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0";

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        console.log("🚀 Starting Payment Request...");
        
        // 1. طريقة Basic Auth (تشفير الهوية)
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

        // 2. تجهيز البيانات (Payload)
        const payload = {
            amount: parseFloat(amount),
            currency: "IQD",
            order_id: orderId || `ORD-${Date.now()}`,
            description: "Insurance Premium Payment",
            transaction_type: "Retail", // هذا الحقل ضروري
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html"
        };

        // --- محاولة رقم 1: إرسال JSON (حسب الدوكيومنت) ---
        try {
            console.log("🔄 Attempt 1: Sending JSON...");
            const response = await axios.post(API_URL, payload, {
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${auth}`
                }
            });
            console.log("✅ Success (JSON)!");
            return res.json({ success: true, token: response.data.token, payment_id: response.data.payment_id });
        } catch (jsonError) {
            console.warn("⚠️ JSON attempt failed, trying Form Data...");
        }

        // --- محاولة رقم 2: إرسال Form Data (الحل البديل القوي) ---
        // بعض السيرفرات تفضل استلام البيانات كـ Form حتى لو الدوكيومنت يكول JSON
        const formData = qs.stringify({
            ...payload,
            client_id: CLIENT_ID,      // نرسل الهوية داخل الفورم ايضاً للاحتياط
            client_secret: CLIENT_SECRET
        });

        const responseForm = await axios.post(API_URL, formData, {
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded"
                // هنا ما نحط Authorization header، نعتمد على البيانات داخل الفورم
            }
        });

        console.log("✅ Success (Form Data)!");
        res.json({
            success: true,
            token: responseForm.data.token,
            payment_id: responseForm.data.payment_id
        });

    } catch (error) {
        // طباعة الخطأ النهائي بالتفصيل الممل
        console.error("❌ FINAL FAILURE:", error.message);
        if (error.response) {
            console.error("❌ Server Response Data:", JSON.stringify(error.response.data, null, 2));
            res.status(500).json({ success: false, error: error.response.data });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
