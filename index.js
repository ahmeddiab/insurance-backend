const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());

 السماح للموقع مالتك بالاتصال بهذا السيرفر
app.use(cors({ origin true })); 

 رابط القاصة (بيئة الاختبار)
const API_URL = httpsapi-test.alqaseh.comv1egwpaymentscreate;

 نقطة الاتصال اللي راح نطلبها من الموقع
app.post('create-payment', async (req, res) = {
    try {
        const { amount, orderId } = req.body;
        
         تجهيز البيانات حسب طلب القاصة
        const payload = {
            amount parseFloat(amount),
            currency IQD,
            order_id orderId  `ORD-${Date.now()}`,
            description Insurance Premium Payment,
            transaction_type Retail,
             رابط الرجوع لموقعك الأصلي
            redirect_url httpsiraqi-insurance.web.apppayment_status.html
        };

        console.log(Sending request to Al Qaseh, payload);

         الاتصال بالقاصة
        const response = await axios.post(API_URL, payload, {
            headers { Content-Type applicationjson }
        });

         إرجاع النتيجة لموقعك
        res.json({
            success true,
            token response.data.token,
            payment_id response.data.payment_id
        });

    } catch (error) {
        console.error(Error, error.message);
        const errorData = error.response  error.response.data  error.message;
        res.status(500).json({ success false, error errorData });
    }
});

const PORT = process.env.PORT  3000;
app.listen(PORT, () = {
    console.log(`Server is running on port ${PORT}`);
});