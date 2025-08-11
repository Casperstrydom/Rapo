import React, { useState } from 'react';
import axios from 'axios';

const Payment = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '', // Added email field for PayFast
    cardNumber: '',
    expiry: '',
    cvv: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [amountError, setAmountError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      const amountValue = parseFloat(value);
      if (amountValue < 200) {
        setAmountError('Minimum payment amount is R200');
      } else {
        setAmountError('');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount before submission
    if (parseFloat(formData.amount) < 200) {
      setAmountError('Minimum payment amount is R200');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASEURL}/api/payment/init-payment`, {
        amount: formData.amount,
        name: formData.name,
        email: formData.email || 'customer@example.com' // Default email if not provided
      });

      // Redirect to PayFast payment page
      window.location.href = response.data.paymentUrl;
      
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <h2 style={{ color: '#fff', textAlign: 'center' }}>Payment Details</h2>
      
      {error && <div style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</div>}
      {success && <div style={{ color: '#4caf50', textAlign: 'center' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="label">
          <span className="title">Cardholder Name</span>
          <input
            className="input-field"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder=""
            required
            title="Enter the name as it appears on your card"
          />
        </div>

        <div className="label">
          <span className="title">Email</span>
          <input
            className="input-field"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            title="Enter your email for payment receipt"
          />
        </div>

        {/* Card fields (PayFast doesn't need these but you might want to keep them) */}
        <div className="label">
          <span className="title">Card Number</span>
          <input
            className="input-field"
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder=""
            title="Card information is not stored or processed by us"
          />
        </div>

        <div className="split">
          <div className="label">
            <span className="title">Expiry Date</span>
            <input
              className="input-field"
              type="text"
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              title="Card information is not stored or processed by us"
            />
          </div>

          <div className="label">
            <span className="title">CVV</span>
            <input
              className="input-field"
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              placeholder=""
              title="Card information is not stored or processed by us"
            />
          </div>
        </div>

        <div className="label">
          <span className="title">Amount (ZAR)</span>
          <input
            className="input-field"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="200.00"
            min="200"
            step="0.01"
            required
            title="Minimum payment amount is R200"
          />
          {amountError && (
            <div style={{ 
              color: '#02ddffff', 
              fontSize: '12px', 
              marginTop: '5px'
            }}>
              {amountError}
            </div>
          )}
        </div>

        <button 
          className="checkout-btn" 
          type="submit" 
          disabled={loading || amountError}
          style={{
            opacity: amountError ? 0.7 : 1,
            cursor: amountError ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Pay via PayFast'}
        </button>
      </form>
    </div>
  );
};

export default Payment;