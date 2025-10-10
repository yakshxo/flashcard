const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// @desc    Create Stripe Checkout session for credit purchase
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const { credits } = req.body;
        
        if (!credits || credits < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credit amount'
            });
        }

        // Get package info to determine price
        const packages = [
            { credits: 5, price: 1.00, name: 'Starter Pack' },
            { credits: 30, price: 5.00, name: 'Basic Pack' },
            { credits: 75, price: 10.00, name: 'Pro Pack' },
            { credits: 175, price: 25.00, name: 'Premium Pack' }
        ];
        
        const selectedPackage = packages.find(pkg => pkg.credits === credits);
        if (!selectedPackage) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package selected'
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: `${selectedPackage.name} - ${credits} Credits`,
                        description: `${credits} flashcard generation credits for SnapStudy`
                    },
                    unit_amount: Math.round(selectedPackage.price * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/buy-credits?payment=cancelled`,
            metadata: {
                userId: req.user._id.toString(),
                credits: credits.toString(),
                type: 'credit_purchase'
            },
            customer_email: req.user.email
        });

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });
    } catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

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

        // Get package info to determine price
        const packages = [
            { credits: 5, price: 1.00 },
            { credits: 30, price: 5.00 },
            { credits: 75, price: 10.00 },
            { credits: 175, price: 25.00 }
        ];
        
        const selectedPackage = packages.find(pkg => pkg.credits === credits);
        const price = selectedPackage ? selectedPackage.price : (credits * 0.20); // Fallback pricing
        const amount = Math.round(price * 100); // Amount in cents
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'cad',
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
                credits: 5,
                price: 1.00,
                pricePerCredit: 0.20,
                baseCredits: 5,
                bonusCredits: 0,
                currency: 'CAD',
                popular: false
            },
            {
                id: 'basic',
                name: 'Basic Pack',
                credits: 30, // 25 + 5 bonus
                price: 5.00,
                pricePerCredit: 0.17,
                baseCredits: 25,
                bonusCredits: 5,
                currency: 'CAD',
                popular: false
            },
            {
                id: 'pro',
                name: 'Pro Pack',
                credits: 75, // 50 + 25 bonus
                price: 10.00,
                pricePerCredit: 0.13,
                baseCredits: 50,
                bonusCredits: 25,
                currency: 'CAD',
                popular: true
            },
            {
                id: 'premium',
                name: 'Premium Pack',
                credits: 175, // 125 + 50 bonus
                price: 25.00,
                pricePerCredit: 0.14,
                baseCredits: 125,
                bonusCredits: 50,
                currency: 'CAD',
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

// @desc    Handle successful checkout session
// @route   POST /api/payments/checkout-success
// @access  Private
const handleCheckoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // Retrieve checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment has not been completed'
            });
        }

        // Verify the user matches
        if (session.metadata.userId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Session does not belong to this user'
            });
        }

        const creditsToAdd = parseInt(session.metadata.credits);
        
        // Add credits to user account
        await req.user.addCredits(creditsToAdd);
        
        // Refresh user data
        await req.user.save();

        res.status(200).json({
            success: true,
            message: `Successfully added ${creditsToAdd} credits to your account`,
            data: {
                creditsAdded: creditsToAdd,
                newBalance: req.user.flashcardCredits
            }
        });
    } catch (error) {
        console.error('Checkout success error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process checkout success',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

module.exports = {
    createCheckoutSession,
    createPaymentIntent,
    confirmPayment,
    getCreditPackages,
    handleWebhook,
    handleCheckoutSuccess
};
