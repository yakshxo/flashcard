require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const verifyDeveloperAccounts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const developerEmails = ['yakshthakar24@gmail.com', 'harshilv3034@gmail.com'];

        for (const email of developerEmails) {
            const user = await User.findOne({ email: email.toLowerCase() });
            
            if (user) {
                if (!user.isVerified) {
                    user.isVerified = true;
                    user.otp = undefined;
                    user.otpExpiry = undefined;
                    await user.save();
                    console.log(`✅ Verified developer account: ${email}`);
                } else {
                    console.log(`ℹ️  Developer account already verified: ${email}`);
                }
                
                console.log(`   - Name: ${user.name}`);
                console.log(`   - Credits: ${user.flashcardCredits}`);
                console.log(`   - Is Developer: ${user.isDeveloper}`);
                console.log(`   - Has Unlimited Credits: ${user.hasUnlimitedCredits}`);
                console.log(`   - Is Verified: ${user.isVerified}`);
            } else {
                console.log(`⚠️  Developer account not found: ${email}`);
                console.log('   Please register this account first through the frontend.');
            }
            console.log('');
        }

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

console.log('🔧 Verifying developer accounts...\n');
verifyDeveloperAccounts();