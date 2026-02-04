const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// رابط الـ API (حسب التوثيق)
const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        const payload = {
            amount: parseFloat(amount),
            currency: "IQD",
            order_id: orderId || `ORD-${Date.now()}`,
            description: "Insurance Premium Payment",
            transaction_type: "Retail",
            // رابط الرجوع لموقعك (تأكدنا من السماح له)
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html" 
        };

        console.log("Sending request to Al Qaseh:", payload);

        // هنا التعديل: استخدام Client ID و Client Secret بالهيدر
        const response = await axios.post(API_URL, payload, {
            headers: { 
                "Content-Type": "application/json",
                // البيانات من الصورة اللي دزيتها
                "x-client-id": "public_test", 
                "x-client-secret": "Lr10yWWmm1dXLol7VgXCrQVnlq13c1G0"
            }
        });

        res.json({
            success: true,
            token: response.data.token,
            payment_id: response.data.payment_id
        });

    } catch (error) {
        console.error("Error:", error.message);
        const errorData = error.response ? error.response.data : error.message;
        res.status(500).json({ success: false, error: errorData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
