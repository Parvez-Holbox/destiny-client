import React, { useEffect, useState } from 'react';
import { useStripe, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = ({ amount = 0.01, productId, product_title }) => {

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
          const { data } = await axios.post('https://destiny-server-nhyk.onrender.com/create-payment-intent', {
            amount: amount, // Pass the amount in cents
            currency: 'usd',
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
          } else {
            event.complete('success');
            setMessage('Payment successful! Thank you for your purchase.');
            setSuccess(true);
            // Additional actions on success
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
            // Request shipping options from the backend
            const response = await axios.post(
              'https://destiny-server-nhyk.onrender.com/calculateShipping',
              {
                shippingAddress: ev.shippingAddress,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
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

      // Handle shipping option changes
      // pr.on('shippingoptionchange', (event) => {
      //   const selectedShippingOption = event.shippingOption.id;

      //   // if (selectedShippingOption === 'express-shipping') {
      //   //   newTotal += 1500; // Add express shipping cost
      //   // }

      //   event.updateWith({
      //     status: 'success',
      //     total: {
      //       label: 'Total',
      //       amount: amount * 100,
      //     },
      //     displayItems: [
      //       {
      //         label: product_title,
      //         amount: amount * 100
      //       }
      //     ],
      //   });

      // });

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