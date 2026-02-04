const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json()); // نبقي هذا لاستلام طلباتنا، لكن نرسل للبنك Form

const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// بيانات القاصة (تأكدنا منها)
const CLIENT_ID = "public_test";
const CLIENT_SECRET = "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0";

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        // 1. التغيير السحري: تحويل البيانات إلى "Form Data"
        // هذه الطريقة يفهمها سيرفر البنك فوراً
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('amount', parseFloat(amount));
        params.append('currency', 'IQD');
        params.append('order_id', orderId || `ORD-${Date.now()}`);
        params.append('description', 'Insurance Premium');
        params.append('transaction_type', 'Retail');
        params.append('redirect_url', 'https://ahmeddiab.github.io/iic/payment_status.html');

        console.log("Sending Form Data to Al Qaseh...");

        // 2. الإرسال مع تحديد نوع المحتوى الصحيح
        const response = await axios.post(API_URL, params, {
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        res.json({
            success: true,
            token: response.data.token,
            payment_id: response.data.payment_id
        });

    } catch (error) {
        console.error("Error Message:", error.message);
        const errorData = error.response ? error.response.data : "No Response Data";
        console.error("Server Response:", JSON.stringify(errorData, null, 2));
        
        res.status(500).json({ success: false, error: errorData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
