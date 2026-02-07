const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// رابط بوابة الدفع (Test Environment)
const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// 🔐 البيانات الصحيحة (تم التحقق منها)
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLoI7VgXCrQVnlq13c1G0"; // (Capital I confirmed)

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        console.log(`🚀 Initiating Payment: ${amount} IQD`);

        const payload = {
            amount: parseFloat(amount),
            currency: "IQD",
            order_id: orderId || `ORD-${Date.now()}`,
            description: "Insurance Premium Payment",
            transaction_type: "Retail", // مطلوب حسب الدوكيومنت
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html"
        };

        // استخدام المصادقة المباشرة (Native Auth) لأنها نجحت في الاختبار
        const response = await axios.post(API_URL, payload, {
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET
            },
            headers: { 
                "Content-Type": "application/json"
            }
        });

        console.log("✅ Payment Created Successfully!");
        console.log("Token:", response.data.token);

        // إرجاع النتيجة للفرونت إند
        res.json({
            success: true,
            token: response.data.token,
            payment_id: response.data.payment_id,
            redirect_url: `https://test-payment-url.com/${response.data.token}` // (مثال، حسب رد البنك)
        });

    } catch (error) {
        console.error("❌ Payment Failed.");
        const errorData = error.response ? error.response.data : error.message;
        console.error("Details:", JSON.stringify(errorData, null, 2));
        
        res.status(500).json({ success: false, error: errorData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
