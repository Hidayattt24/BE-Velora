#!/bin/bash

# Velora Backend Deployment Script
echo "🚀 Deploying Velora Backend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables (you need to run this once)
echo "📝 Setting up environment variables..."
echo "Please make sure to set these environment variables in Vercel dashboard:"
echo "- SUPABASE_URL"
echo "- SUPABASE_ANON_KEY" 
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- JWT_SECRET"
echo "- ALLOWED_ORIGINS"
echo "- ML_API_URL (optional)"
echo "- SMTP_HOST (optional)"
echo "- SMTP_PORT (optional)"
echo "- SMTP_USER (optional)"
echo "- SMTP_PASS (optional)"

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your API will be available at the URL shown above"
echo "📊 Check logs with: vercel logs --app=[your-app-name]"
