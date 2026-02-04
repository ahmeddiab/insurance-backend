const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// تأكدنا من الرابط v1
const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// بيانات التيست (من الصورة اللي دزيتها)
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0";

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        // 1. تجهيز "Basic Auth"
        // هذه الخطوة تدمج الاسم والرمز وتشفرهم، وهي مفتاح الدخول للبوابة
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        // 2. تجهيز البيانات JSON (حسب الدوكيومنت بالضبط)
        const payload = {
            amount: parseFloat(amount),
            currency: "IQD",          // Required
            order_id: orderId || `ORD-${Date.now()}`, // Required
            description: "Insurance Premium Payment", // Required
            transaction_type: "Retail", // Required (مهم جداً: هذا كان ناقصنا)
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html" // Required
        };

        console.log("Sending JSON Payload:", JSON.stringify(payload));

        // 3. الإرسال (Header + JSON Body)
        const response = await axios.post(API_URL, payload, {
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}` // الهوية المشفرة هنا
            }
        });

        console.log("✅ Success:", response.data);

        res.json({
            success: true,
            token: response.data.token, 
            payment_id: response.data.payment_id
        });

    } catch (error) {
        // طباعة تفاصيل الخطأ من سيرفر القاصة مباشرة
        // هذا راح يكشفلنا السبب الحقيقي اذا صار اي خطأ
        console.error("❌ Error Status:", error.response?.status);
        console.error("❌ Error Data:", JSON.stringify(error.response?.data, null, 2));
        
        const errorData = error.response ? error.response.data : error.message;
        res.status(500).json({ success: false, error: errorData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
