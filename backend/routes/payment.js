const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// PayFast Configuration
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  passphrase: process.env.PAYFAST_PASSPHRASE,
  sandbox: process.env.PAYFAST_ENV === 'sandbox',
  return_url: process.env.PAYFAST_RETURN_URL,
  cancel_url: process.env.PAYFAST_CANCEL_URL,
  notify_url: process.env.PAYFAST_NOTIFY_URL
};

// Generate PayFast signature
const generateSignature = (data) => {
  let signatureString = '';
  
  Object.keys(data).sort().forEach(key => {
    if (data[key] !== '') {
      signatureString += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
    }
  });
  
  signatureString = signatureString.slice(0, -1);
  
  if (PAYFAST_CONFIG.passphrase) {
    signatureString += `&passphrase=${PAYFAST_CONFIG.passphrase}`;
  }
  
  return crypto.createHash("md5").update(signatureString).digest("hex");
};

// Initialize Payment (now for PayFast)
router.post("/init-payment", async (req, res) => {
  try {
    const { email, amount, name } = req.body;

    // Validate minimum amount (R200)
    if (parseFloat(amount) < 200) {
      return res.status(400).json({ 
        error: 'Minimum payment amount is R200' 
      });
    }

    // Prepare PayFast payment data
    const paymentData = {
      merchant_id: PAYFAST_CONFIG.merchant_id,
      merchant_key: PAYFAST_CONFIG.merchant_key,
      return_url: PAYFAST_CONFIG.return_url,
      cancel_url: PAYFAST_CONFIG.cancel_url,
      notify_url: PAYFAST_CONFIG.notify_url,
      name_first: name.split(' ')[0],
      name_last: name.split(' ')[1] || '',
      email_address: email,
      m_payment_id: `order-${Date.now()}`,
      amount: parseFloat(amount).toFixed(2),
      item_name: 'Service Payment',
      item_description: 'Payment for services rendered'
    };

    // Generate signature
    paymentData.signature = generateSignature(paymentData);

    // Determine PayFast URL (sandbox or production)
    const payfastUrl = PAYFAST_CONFIG.sandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    // Return payment URL to frontend
    res.json({
      paymentUrl: `${payfastUrl}?${new URLSearchParams(paymentData).toString()}`,
      paymentData
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// ITN (Instant Transaction Notification) Handler
router.post("/payfast-notify", (req, res) => {
  const data = req.body;
  const signature = generateSignature(data);

  // Verify signature
  if (signature !== data.signature) {
    console.error('Invalid ITN signature');
    return res.status(400).send('Invalid signature');
  }

  // Process payment status
  const paymentStatus = data.payment_status;
  const orderId = data.m_payment_id;
  const amount = data.amount_gross;

  console.log(`Payment Notification for ${orderId}:`, {
    status: paymentStatus,
    amount: amount,
    pf_payment_id: data.pf_payment_id
  });

  // Handle different payment statuses
  switch (paymentStatus) {
    case 'COMPLETE':
      // Update your database here
      console.log(`Payment ${orderId} completed successfully`);
      break;
    case 'FAILED':
      console.log(`Payment ${orderId} failed`);
      break;
    case 'PENDING':
      console.log(`Payment ${orderId} is pending`);
      break;
    default:
      console.log(`Payment ${orderId} has unknown status: ${paymentStatus}`);
  }

  res.status(200).send('OK');
});

// Payment Return Handler
router.get("/payment-return", (req, res) => {
  const status = req.query.payment_status;
  
  if (status === 'COMPLETE') {
    // Successful payment - redirect to success page
    res.redirect('/payment/success');
  } else {
    // Cancelled or failed payment
    res.redirect('/payment/cancel');
  }
});

module.exports = router;