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

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Stripe account for payment processing
- Hugging Face account with API token

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Hugging Face Configuration
HF_TOKEN=your_hugging_face_token

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000` with the backend running on `http://localhost:3001`.

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