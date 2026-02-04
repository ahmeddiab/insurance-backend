const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// تأكد من الرابط بدقة من التوثيق (هل هو v1 أم v2؟)
const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// البيانات من الصورة اللي دزيتها
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0";

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        // 1. تجهيز "Basic Auth" يدوياً لضمان الدقة
        // هذا يحول "user:pass" إلى "base64"
        const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        console.log("Generated Auth Token:", authString); // للمراقبة فقط

        // 2. رجعنا نستخدم JSON لأن السيرفر يفضله
        const payload = {
            amount: parseFloat(amount),
            currency: "IQD",
            order_id: orderId || `ORD-${Date.now()}`,
            description: "Insurance Premium Payment",
            transaction_type: "Retail",
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html"
            // ملاحظة: اذا طلب التوثيق field اسمه "p_sing"، لازم نضيفه هنا
        };

        console.log("Sending JSON Payload:", JSON.stringify(payload));

        const response = await axios.post(API_URL, payload, {
            headers: { 
                "Content-Type": "application/json",
                // الإرسال بالطريقة القياسية
                "Authorization": `Basic ${authString}`
            }
        });

        res.json({
            success: true,
            token: response.data.token,
            payment_id: response.data.payment_id
        });

    } catch (error) {
        // طباعة الخطأ بالتفصيل الممل بالسيرفر
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
