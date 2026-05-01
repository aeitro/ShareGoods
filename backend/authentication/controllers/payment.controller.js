const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Item = require('../models/item.model');
const Match = require('../models/match.model');

/**
 * Create a payment intent for purchasing an item
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Item not found' });
    }

    if (item.donationType !== 'sell') {
      return res.status(400).json({ status: 'error', message: 'This item is for donation, not for sale' });
    }

    const amount = Math.round(item.price * 100); // Stripe expects amount in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        itemId: item._id.toString(),
        userId: req.user.id
      }
    });

    res.status(200).json({
      status: 'success',
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Verify payment (In a real app, this would be a webhook)
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, itemId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Mark item as matched/sold
      await Item.findByIdAndUpdate(itemId, { status: 'matched' });
      
      // Create a match record
      await Match.create({
        item: itemId,
        recipient: req.user.id,
        donor: paymentIntent.metadata.donorId, // We should pass this in metadata
        status: 'confirmed'
      });

      res.status(200).json({ status: 'success', message: 'Payment confirmed and item reserved' });
    } else {
      res.status(400).json({ status: 'error', message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
