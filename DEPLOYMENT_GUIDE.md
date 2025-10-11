# Deployment Guide

## Step 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `yakshxo/flashcard` repository
5. Railway will auto-detect it's a Node.js project

### Environment Variables to Add in Railway:

Copy these from your local `backend/.env` file:

```
MONGODB_URI=mongodb+srv://harshilv3034_db_user:vvip5305@flashcard.plgldcl.mongodb.net/?retryWrites=true&w=majority&appName=Flashcard
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-netlify-site.netlify.app
JWT_SECRET=2eff47029ba3f4da7f29a9fe2c6d93bf3e62b7078a3c546a411bde07a4210053481d8bbcb5d3ae8c19936e0fb11f580aaae6f21adf3571ab3ba04433deb0a2fc
JWT_EXPIRE=7d
OPENAI_API_KEY=[your_openai_key_from_local_env]
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Copy the OPENAI_API_KEY from your local file as I can't display it here for security.

6. After deployment, Railway will give you a URL like `https://your-app-name.railway.app`
7. Copy this URL for the next step

## Step 2: Update Frontend Environment Variable

Once you get your Railway backend URL, update the frontend production environment:

1. Edit `/frontend/.env.production`
2. Replace the URL with your actual Railway URL:
   ```
   REACT_APP_API_URL=https://your-actual-railway-url.railway.app
   ```

## Step 3: Deploy Frontend to Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Sign in with your GitHub account
3. Click "New site from Git" → GitHub → `yakshxo/flashcard`
4. Build settings (should auto-fill from netlify.toml):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

### Environment Variables in Netlify:

Add this in Netlify's environment variables:
```
REACT_APP_API_URL=https://your-actual-railway-url.railway.app
```

## Step 4: Test the Deployment

1. Your frontend will be available at `https://your-site-name.netlify.app`
2. Test login/register functionality
3. Test profile management features
4. Test flashcard generation

## Troubleshooting

- **CORS Issues**: Make sure your Railway backend allows the Netlify frontend URL
- **API Not Found**: Double-check the REACT_APP_API_URL in Netlify environment variables
- **Database Connection**: Ensure MongoDB URI is correct in Railway environment variables