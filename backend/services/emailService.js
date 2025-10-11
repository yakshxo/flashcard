const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Send OTP email
const sendOTPEmail = async (email, otp, name, isLogin = false) => {
    try {
        const transporter = createTransporter();
        
        const actionType = isLogin ? 'login' : 'account verification';
        const subject = isLogin ? 'SnapStudy - Login Verification Code' : 'SnapStudy - Email Verification Code';
        
        const mailOptions = {
            from: `"SnapStudy" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            margin: 0;
                            padding: 0;
                            background-color: #f8fafc;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 30px;
                            text-align: center;
                            color: white;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 600;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #334155;
                            margin-bottom: 20px;
                        }
                        .otp-container {
                            background: #f1f5f9;
                            border: 2px dashed #cbd5e1;
                            border-radius: 8px;
                            padding: 30px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .otp-label {
                            font-size: 14px;
                            color: #64748b;
                            margin-bottom: 10px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            font-weight: 600;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: 700;
                            color: #1e293b;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .expiry-info {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px 20px;
                            margin: 25px 0;
                            border-radius: 0 8px 8px 0;
                        }
                        .expiry-info p {
                            margin: 0;
                            color: #92400e;
                            font-weight: 500;
                        }
                        .instructions {
                            color: #475569;
                            font-size: 16px;
                            line-height: 1.7;
                        }
                        .footer {
                            background: #f8fafc;
                            padding: 30px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer p {
                            margin: 0;
                            color: #64748b;
                            font-size: 14px;
                        }
                        .security-note {
                            background: #fee2e2;
                            border-left: 4px solid #ef4444;
                            padding: 15px 20px;
                            margin: 25px 0;
                            border-radius: 0 8px 8px 0;
                        }
                        .security-note p {
                            margin: 0;
                            color: #dc2626;
                            font-weight: 500;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>SnapStudy</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Hi ${name},</p>
                            
                            <p class="instructions">
                                We received a request for ${actionType} for your SnapStudy account. 
                                Please use the following verification code to complete the process:
                            </p>
                            
                            <div class="otp-container">
                                <div class="otp-label">Verification Code</div>
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <div class="expiry-info">
                                <p>⏰ This code will expire in 10 minutes for security reasons.</p>
                            </div>
                            
                            <p class="instructions">
                                Enter this code in the verification screen to proceed. If you didn't request this verification, 
                                please ignore this email or contact our support team.
                            </p>
                            
                            <div class="security-note">
                                <p>🔒 Never share this code with anyone. SnapStudy team will never ask for your verification code.</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} SnapStudy. All rights reserved.</p>
                            <p>Developed by Harshil Lotwala and Yaksh Thakar</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hi ${name},
                
                Your ${actionType} verification code for SnapStudy is: ${otp}
                
                This code will expire in 10 minutes.
                
                If you didn't request this verification, please ignore this email.
                
                Best regards,
                SnapStudy Team
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"SnapStudy Team" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Welcome to SnapStudy! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to SnapStudy</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            margin: 0;
                            padding: 0;
                            background-color: #f8fafc;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 30px;
                            text-align: center;
                            color: white;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 600;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .welcome-message {
                            font-size: 18px;
                            color: #334155;
                            margin-bottom: 30px;
                        }
                        .features {
                            background: #f8fafc;
                            border-radius: 8px;
                            padding: 25px;
                            margin: 30px 0;
                        }
                        .feature-item {
                            margin: 15px 0;
                            color: #475569;
                        }
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            margin: 20px 0;
                        }
                        .footer {
                            background: #f8fafc;
                            padding: 30px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer p {
                            margin: 5px 0;
                            color: #64748b;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to SnapStudy!</h1>
                        </div>
                        <div class="content">
                            <p class="welcome-message">Hi ${name},</p>
                            
                            <p>🎉 Congratulations! Your email has been successfully verified and your SnapStudy account is now active.</p>
                            
                            <div class="features">
                                <h3>What you can do now:</h3>
                                <div class="feature-item">✅ Generate AI-powered flashcards from your study materials</div>
                                <div class="feature-item">✅ Upload PDFs, text files, or enter content directly</div>
                                <div class="feature-item">✅ Purchase credit packages for unlimited learning</div>
                                <div class="feature-item">✅ Track your study progress and performance</div>
                            </div>
                            
                            <p>Ready to transform your learning experience?</p>
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">Start Creating Flashcards</a>
                            </div>
                            
                            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
                            
                            <p>Happy studying!</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} SnapStudy. All rights reserved.</p>
                            <p>Developed by Harshil Lotwala and Yaksh Thakar</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Welcome to SnapStudy, ${name}!
                
                Your email has been successfully verified and your account is now active.
                
                You can now:
                - Generate AI-powered flashcards
                - Upload study materials
                - Purchase credit packages
                - Track your progress
                
                Visit ${process.env.FRONTEND_URL}/dashboard to get started!
                
                Happy studying!
                SnapStudy Team
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

// Test email connection
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email service is ready to send emails');
        return { success: true, message: 'Email service is ready' };
    } catch (error) {
        console.error('❌ Email service error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail,
    testEmailConnection
};
