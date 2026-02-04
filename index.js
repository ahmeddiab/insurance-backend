const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// تأكدنا من الرابط
const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// بيانات التيست
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0";

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        // 1. التشفير الصحيح (Basic Auth)
        // دمجنا اليوزر والباسورد وشفرناهم base64
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        // 2. تجهيز البيانات JSON حسب الدوكيومنت بالضبط
        const payload = {
            amount: parseFloat(amount),
            currency: "IQD", // required
            order_id: orderId || `ORD-${Date.now()}`, // required
            description: "Insurance Premium Payment", // required
            transaction_type: "Retail", // required (من الـ enum)
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html" // required
        };

        console.log("Sending Request to Al Qaseh...");

        // 3. الإرسال (Header + JSON Body)
        const response = await axios.post(API_URL, payload, {
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}` // المفتاح هنا
            }
        });

        console.log("✅ Success:", response.data);

        res.json({
            success: true,
            token: response.data.token, 
            payment_id: response.data.payment_id
        });

    } catch (error) {
        // طباعة سبب الخطأ الحقيقي من سيرفر القاصة
        console.error("❌ Error Detail:", error.response?.data);
        
        const errorData = error.response ? error.response.data : error.message;
        res.status(500).json({ success: false, error: errorData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
