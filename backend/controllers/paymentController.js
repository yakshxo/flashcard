const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// @desc    Create payment intent for credit purchase
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    try {
        const { credits } = req.body;
        
        if (!credits || credits < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credit amount'
            });
        }

        // Credit pricing: $0.50 per credit
        const amount = Math.round(credits * 50); // Amount in cents
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                userId: req.user._id.toString(),
                credits: credits.toString(),
                type: 'credit_purchase'
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                amount,
                credits
            }
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Handle successful payment and add credits
// @route   POST /api/payments/confirm-payment
// @access  Private
const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment Intent ID is required'
            });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: 'Payment has not succeeded'
            });
        }

        // Verify the user matches
        if (paymentIntent.metadata.userId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Payment does not belong to this user'
            });
        }

        const creditsToAdd = parseInt(paymentIntent.metadata.credits);
        
        // Add credits to user account
        await req.user.addCredits(creditsToAdd);

        res.status(200).json({
            success: true,
            message: `Successfully added ${creditsToAdd} credits to your account`,
            data: {
                creditsAdded: creditsToAdd,
                newBalance: req.user.flashcardCredits + creditsToAdd
            }
        });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm payment',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get credit packages and pricing
// @route   GET /api/payments/packages
// @access  Private
const getCreditPackages = async (req, res) => {
    try {
        const packages = [
            {
                id: 'starter',
                name: 'Starter Pack',
                credits: 20,
                price: 10.00,
                pricePerCredit: 0.50,
                popular: false
            },
            {
                id: 'popular',
                name: 'Popular Pack',
                credits: 50,
                price: 20.00,
                pricePerCredit: 0.40,
                popular: true
            },
            {
                id: 'pro',
                name: 'Pro Pack',
                credits: 100,
                price: 35.00,
                pricePerCredit: 0.35,
                popular: false
            },
            {
                id: 'enterprise',
                name: 'Enterprise Pack',
                credits: 250,
                price: 75.00,
                pricePerCredit: 0.30,
                popular: false
            }
        ];

        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error('Get packages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit packages'
        });
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (but secured with webhook signature)
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent.id);
            
            // Additional processing if needed
            if (paymentIntent.metadata.type === 'credit_purchase') {
                try {
                    const user = await User.findById(paymentIntent.metadata.userId);
                    if (user) {
                        const credits = parseInt(paymentIntent.metadata.credits);
                        await user.addCredits(credits);
                        console.log(`Added ${credits} credits to user ${user._id}`);
                    }
                } catch (error) {
                    console.error('Error processing webhook payment:', error);
                }
            }
            break;

        case 'payment_intent.payment_failed':
            console.log('Payment failed:', event.data.object.id);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

module.exports = {
    createPaymentIntent,
    confirmPayment,
    getCreditPackages,
    handleWebhook
};