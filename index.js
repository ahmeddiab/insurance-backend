const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// بيانات القاصة (حسب الصورة اللي دزيتها)
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0";

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        // 1. تشفير الهوية (هذه هي الخطوة السحرية)
        // ندمج الاسم والرمز ونحولهم لكود مشفر
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const payload = {
            amount: parseFloat(amount),
            currency: "IQD",
            order_id: orderId || `ORD-${Date.now()}`,
            description: "Insurance Premium Payment",
            transaction_type: "Retail",
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html"
        };

        console.log("Sending request with Basic Auth...");

        const response = await axios.post(API_URL, payload, {
            headers: { 
                "Content-Type": "application/json",
                // 2. إرسال الهوية المشفرة بالهيدر الرسمي
                "Authorization": `Basic ${auth}`
            }
        });

        res.json({
            success: true,
            token: response.data.token,
            payment_id: response.data.payment_id
        });

    } catch (error) {
        console.error("Error Message:", error.message);
        // طباعة تفاصيل الخطأ القادمة من القاصة لمعرفة السبب بدقة
        const errorData = error.response ? error.response.data : "No Response Data";
        console.error("Server Response:", JSON.stringify(errorData, null, 2));
        
        res.status(500).json({ success: false, error: errorData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
