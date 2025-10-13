# SnapStudy

SnapStudy is a modern, AI-powered flashcard generation platform that transforms your study materials into interactive flashcards using advanced language models.

**Developed by**: Harshil Lotwala and Yaksh Thakar

## Features

### Core Functionality
- **AI-Powered Flashcard Generation**: Automatically create flashcards from uploaded text, PDFs, or manual input
- **Multiple Input Methods**: Support for text files, PDF documents, and direct text input
- **Smart Content Processing**: AI analyzes your content and generates relevant question-answer pairs
- **Interactive Study Mode**: Clean, intuitive interface for reviewing flashcards
- **Progress Tracking**: Monitor your study progress and performance

### User Management
- **Secure Authentication**: User registration and login with JWT-based authentication
- **Credit-Based System**: Purchase credits to generate flashcard sets
- **Account Dashboard**: View credit balance, study history, and account information

### Payment Integration
- **Stripe Checkout**: Secure payment processing for credit purchases
- **Multiple Credit Packages**: Various pricing tiers to suit different needs
- **Instant Credit Addition**: Credits are added immediately after successful payment

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **Hugging Face AI** integration for flashcard generation using Llama 3.1 model
- **Stripe** for payment processing
- **JWT** for authentication
- **Multer** for file upload handling
- **PDF parsing** capabilities

### Frontend
- **React.js** with modern hooks and functional components
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Tailwind CSS** for styling and responsive design
- **Stripe React components** for payment integration

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas account** (free) - [Sign up here](https://www.mongodb.com/atlas)
- **Stripe account** (for payments) - [Sign up here](https://stripe.com/)
- **Hugging Face account** (for AI) - [Sign up here](https://huggingface.co/)
- **OpenAI account** (optional, for additional AI features) - [Sign up here](https://openai.com/)

## 📦 Installation

### Step 1: Clone the Repository

```bash
# Clone from the development branch
git clone -b development https://github.com/Harshil-Lotwala/flashcard.git
cd flashcard
```

### Step 2: Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
# Create .env file in backend directory
touch .env
```

4. **Configure environment variables:**
Open `backend/.env` and add the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority&appName=Flashcard

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration (Generate a secure secret)
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# OpenAI Configuration (Optional but recommended)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Hugging Face Configuration
HF_TOKEN=hf_your_hugging_face_token_here

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=your_email@gmail.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **Start the backend server:**
```bash
npm run dev
```

You should see: `Server running on port 3001`

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the frontend development server:**
```bash
npm start
```

You should see: `Local: http://localhost:3000`

### Step 4: Verify Installation

1. **Open your browser and navigate to:** `http://localhost:3000`
2. **You should see the SnapStudy homepage**
3. **Try creating an account to test the full functionality**

## 🔧 Detailed Configuration Guide

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create a new cluster** (choose the free M0 tier)
3. **Create a database user:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password
   - Give "Read and write to any database" privileges
4. **Whitelist your IP address:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
5. **Get your connection string:**
   - Go to "Clusters"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string and replace `<password>` with your database user password

### Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com/)
2. **Get your API keys:**
   - Go to Developers → API keys
   - Copy your "Publishable key" (starts with `pk_test_`)
   - Copy your "Secret key" (starts with `sk_test_`)
3. **Set up webhooks (optional for full payment functionality):**
   - Go to Developers → Webhooks
   - Add endpoint: `http://localhost:3001/api/payments/webhook`
   - Select events: `checkout.session.completed`

### Hugging Face Setup

1. **Create a Hugging Face account** at [huggingface.co](https://huggingface.co/)
2. **Generate an access token:**
   - Go to Settings → Access Tokens
   - Create a new token with "Read" permissions
   - Copy the token (starts with `hf_`)

### OpenAI Setup (Optional)

1. **Create an OpenAI account** at [openai.com](https://openai.com/)
2. **Get your API key:**
   - Go to API keys section
   - Create a new API key
   - Copy the key (starts with `sk-`)

### Email Setup (For OTP functionality)

1. **Use Gmail with App Password:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: [support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833)
   - Use your Gmail address as `EMAIL_USERNAME` and `EMAIL_FROM`
   - Use the App Password as `EMAIL_PASSWORD`

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if all environment variables are set correctly
- Ensure MongoDB connection string is valid
- Make sure port 3001 is not in use

**Frontend won't start:**
- Try deleting `node_modules` and running `npm install` again
- Check if port 3000 is available
- Clear your browser cache

**"Module not found" errors:**
```bash
# In the respective directory (backend or frontend)
rm -rf node_modules package-lock.json
npm install
```

**MongoDB connection issues:**
- Verify your connection string format
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your database user has proper permissions

**API calls failing:**
- Check if backend server is running on port 3001
- Verify CORS configuration allows frontend origin
- Check browser console for detailed error messages

## 🔒 Security Notes

- **Never commit your `.env` file to git** - it's already in `.gitignore`
- **Use strong, unique passwords** for all services
- **Rotate API keys regularly** in production
- **Use environment-specific configurations** for different deployment stages

## 📱 Usage

Once the setup is complete:

1. **Register a new account** or **login** with existing credentials
2. **Purchase credits** through the Stripe integration (optional, some free credits may be provided)
3. **Upload documents** (PDF, TXT) or **enter text manually**
4. **Generate flashcards** using AI
5. **Study with the interactive flashcard interface**
6. **Track your progress** and **manage your account**

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Flashcards
- `GET /api/flashcards` - Get user's flashcards
- `POST /api/flashcards/generate` - Generate new flashcard set
- `DELETE /api/flashcards/:id` - Delete flashcard set

### Payments
- `GET /api/payments/packages` - Get available credit packages
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/payments/checkout-success` - Handle successful payment
- `POST /api/payments/webhook` - Stripe webhook handler

### File Upload
- `POST /api/upload` - Upload files for flashcard generation

## Credit System

SnapStudy uses a credit-based system where:
- Each flashcard set generation costs 1 credit
- Credits can be purchased through secure Stripe checkout
- Multiple package options available with volume discounts
- Credits never expire
- Instant credit delivery after successful payment

### Available Packages
- **Starter Pack**: 5 credits for $1.00 CAD
- **Basic Pack**: 30 credits (25 + 5 bonus) for $5.00 CAD
- **Pro Pack**: 75 credits (50 + 25 bonus) for $10.00 CAD
- **Premium Pack**: 175 credits (125 + 50 bonus) for $25.00 CAD

## AI Integration

The application uses Hugging Face's inference API with the Meta Llama 3.1 8B Instruct model for generating flashcards. The AI service:
- Processes uploaded documents and text
- Extracts key concepts and information
- Generates relevant question-answer pairs
- Ensures educational value and clarity

## Security Features

- JWT-based authentication with secure token storage
- Password hashing using bcrypt
- Rate limiting to prevent abuse
- File upload validation and sanitization
- Secure payment processing through Stripe
- Environment variable protection for sensitive data

## File Upload Support

- **Text Files**: .txt format with UTF-8 encoding
- **PDF Documents**: Automatic text extraction and processing
- **Direct Input**: Manual text entry for quick flashcard generation
- **File Size Limit**: 10MB maximum file size
- **Validation**: File type and size validation before processing

## Deployment Considerations

### Environment Variables
Ensure all required environment variables are properly set in production:
- Use strong, unique JWT secrets
- Configure proper MongoDB connection strings
- Set up production Stripe keys
- Configure proper CORS origins

### Security
- Enable HTTPS in production
- Set up proper firewall rules
- Configure MongoDB with authentication
- Set up monitoring and logging
- Regular security updates for dependencies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support, feature requests, or bug reports, please create an issue in the GitHub repository or contact the development team.

## Developers

**Harshil Lotwala** - Lead Developer  
**Yaksh Thakar** - Co-Developer

## Acknowledgments

- Hugging Face for providing the AI inference API
- Stripe for secure payment processing
- MongoDB Atlas for database hosting
- React and Node.js communities for excellent frameworks and libraries