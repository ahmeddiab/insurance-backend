const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// هذا هو التغيير المهم: السماح للجميع بالاتصال
app.use(cors());
app.use(express.json());

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
            redirect_url: "https://ahmeddiab.github.io/iic/payment_status.html" 
            // ملاحظة: تأكد أن رابط الرجوع هذا صحيح أو رجعه لرابطك السابق اذا تحب
        };

        console.log("Sending request to Al Qaseh:", payload);

        const response = await axios.post(API_URL, payload, {
            headers: { "Content-Type": "application/json" }
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
