const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../util/catchAsync');
const filterObj = require('../util/objects/filterObject');
const axios = require('axios');

exports.createPaymentSheet = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'price', 'currency');

  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: '2023-10-16' });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: filteredBody.price * 100,
    currency: filteredBody.currency,
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

exports.webhookCheckout = (req, res, next) => {
  let event = req.body;

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  res.send();
};

exports.createCharge = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'description', 'price', 'currency');

  const headers = {
    'Content-Type': 'application/json',
    'X-CC-Api-Key': process.env.COINBASE_API_KEY,
    'X-CC-Version': '2018-03-22',
  };

  const response = await axios.post(
    'https://api.commerce.coinbase.com/charges/',
    {
      name: filteredBody.name,
      description: filteredBody.description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: filteredBody.price,
        currency: filteredBody.currency,
      },
    },
    { headers }
  );

  res.status(200).json({
    status: 'success',
    data: {
      url: response.data.data.hosted_url,
    },
  });
});
