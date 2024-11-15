import React, { useEffect, useState } from 'react';
import { useStripe, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { SERVER_URL } from '../../helper/constants';

const CheckoutForm = ({ amount = 0.01, productId, product_title, quantity = 1, variant_id = 46075169931421 }) => {

  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [isPaymentRequestAvailable, setIsPaymentRequestAvailable] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {

    if (stripe) {

      // Set up the payment request with Stripe
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Total',
          amount: amount * 100, // Default amount in cents, update as needed
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
      });

      // Check if Payment Request is available
      pr.canMakePayment().then((result) => {
        if (result) {
          setIsPaymentRequestAvailable(true);
          setPaymentRequest(pr);
        }
      });

      // Handle payment method event
      pr.on('paymentmethod', async (event) => {
        try {
          // Call backend to create PaymentIntent and get clientSecret
          const { data } = await SERVER_URL.post('/create-payment-intent', {
            amount: amount,       // Amount in cents
            currency: 'usd',
            variantId:variant_id,
            productTitles: product_title,
            quantity,
          });
          // Confirm payment using clientSecret from the backend
          const { error } = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: event.paymentMethod.id,
          });
          if (error) {
            event.complete('fail');
            setMessage(error || 'Payment failed. Please try again.');
            setSuccess(false);
            console.error('Payment failed:', error);
            alert("Payment Failed");
            alert(error);
          } else {
            event.complete('success');
            setMessage('Payment successful! Thank you for your purchase.');
            setSuccess(true);
            alert("Payment SuccessFull");
            // Additional actions on success
            // Collect additional customer and payment details
            const customerEmail = event.payerEmail;
            const customerName = event.payerName;
            const shippingAddress = event.shippingAddress;
            const billingAddress = event.paymentMethod.billing_details.address;

            await SERVER_URL.post('/create-shopify-order', {
              variant_id,
              quantity,
              customerEmail,
              customerName,
              shippingAddress,
              billingAddress,
              event
            });
          }
        } catch (error) {
          console.error('Error creating PaymentIntent or confirming payment:', error);
          event.complete('fail');
        }
      });

      // Handle shipping address change event
      pr.on('shippingaddresschange', async (ev) => {

        if (ev.shippingAddress.country !== 'US') {

          ev.updateWith({ status: 'invalid_shipping_address' });

        } else {

          try {

            const reqBody = { shippingAddress: ev.shippingAddress };
            const headers = { headers: { 'Content-Type': 'application/json' } }
            // Request shipping options from the backend
            const response = await SERVER_URL.post('/calculateShipping', reqBody, headers);
            const result = response.data;

            ev.updateWith({
              status: 'success',
              shippingOptions: result.supportedShippingOptions,
            });

          } catch (error) {

            console.error('Error fetching shipping options:', error);
            ev.updateWith({ status: 'fail' });

          }
          
        }

      });

    }

  }, [stripe, amount]);

  return (
    <div>
      {isPaymentRequestAvailable && paymentRequest && (
        <PaymentRequestButtonElement
          options={{ paymentRequest }}
          style={{ paymentRequestButton: { theme: 'dark', height: '44px' } }}
        />
      )}
      {message && (
        <div style={{ marginTop: '20px', color: success ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );

};

export default CheckoutForm;