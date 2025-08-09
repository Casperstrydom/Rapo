const express = require("express");
const router = express.Router();
const Paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);

// Initialize Payment
router.post("/init-payment", async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await Paystack.transaction.initialize({
      email,
      amount: amount * 100, // Paystack uses kobo/cent (e.g., 5000 = ₦50)
      currency: "NGN", // 'GHS', 'USD', 'ZAR' for other countries
      callback_url: "http://localhost:3000/verify-payment", // Frontend callback
    });

    res.json({ paymentUrl: response.data.authorization_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment (Callback)
router.get("/verify-payment/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const response = await Paystack.transaction.verify(reference);

    if (response.data.status === "success") {
      res.json({ success: true, data: response.data });
    } else {
      res.json({ success: false, error: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;