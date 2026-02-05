const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// الرابط الرسمي للتيست
const API_URL = "https://api-test.alqaseh.com/v1/egw/payments/create";

// جرب هذه المفاتيح البديلة (تستخدم في بيئة Sandbox المستقرة)
const CLIENT_ID = "test_user"; 
const CLIENT_SECRET = "test_password"; 

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        // استخدام الطريقة الأكثر ضماناً (Header Authentication)
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

        const payload = {
            amount: parseFloat(amount),
            currency: "IQD",
            order_id: orderId || `ORD-${Date.now()}`,
            description: "Insurance Premium Payment",
            transaction_type: "Retail",
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html"
        };

        const response = await axios.post(API_URL, payload, {
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            }
        });

        res.json({ success: true, token: response.data.token });

    } catch (error) {
        // إذا فشل هذا أيضاً، سنقوم بطباعة "لماذا" بالضبط
        const errorDetail = error.response ? error.response.data : error.message;
        console.error("❌ Detail:", errorDetail);
        res.status(500).json({ success: false, error: errorDetail });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running`));
