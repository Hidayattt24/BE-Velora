#!/bin/bash

# Script untuk setup environment variables di Vercel
# Jalankan script ini setelah login ke Vercel

echo "🔧 Setting up environment variables for Velora Backend..."

# Function to set environment variable
set_env() {
    local key=$1
    local value=$2
    local environment=${3:-"production,preview,development"}
    
    echo "Setting $key..."
    vercel env add $key $environment <<< "$value"
}

# Prompt user for values
echo "📝 Please provide the following environment variables:"

read -p "SUPABASE_URL: " SUPABASE_URL
read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
read -p "JWT_SECRET (or press Enter for random): " JWT_SECRET
read -p "ALLOWED_ORIGINS (e.g., https://yourapp.vercel.app): " ALLOWED_ORIGINS

# Generate JWT secret if not provided
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT_SECRET: $JWT_SECRET"
fi

# Optional variables
read -p "ML_API_URL (optional): " ML_API_URL
read -p "SMTP_HOST (optional): " SMTP_HOST
read -p "SMTP_PORT (optional): " SMTP_PORT
read -p "SMTP_USER (optional): " SMTP_USER
read -p "SMTP_PASS (optional): " SMTP_PASS

echo "🚀 Setting environment variables..."

# Required variables
set_env "NODE_ENV" "production"
set_env "SUPABASE_URL" "$SUPABASE_URL"
set_env "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
set_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
set_env "JWT_SECRET" "$JWT_SECRET"
set_env "JWT_EXPIRES_IN" "7d"
set_env "ALLOWED_ORIGINS" "$ALLOWED_ORIGINS"
set_env "RATE_LIMIT_WINDOW_MS" "900000"
set_env "RATE_LIMIT_MAX_REQUESTS" "100"
set_env "MAX_FILE_SIZE" "10485760"
set_env "ALLOWED_IMAGE_TYPES" "image/jpeg,image/png,image/webp"
set_env "VERCEL" "1"

# Optional variables
if [ ! -z "$ML_API_URL" ]; then
    set_env "ML_API_URL" "$ML_API_URL"
fi

if [ ! -z "$SMTP_HOST" ]; then
    set_env "SMTP_HOST" "$SMTP_HOST"
    set_env "SMTP_PORT" "$SMTP_PORT"
    set_env "SMTP_USER" "$SMTP_USER"
    set_env "SMTP_PASS" "$SMTP_PASS"
    set_env "FROM_EMAIL" "noreply@velora.app"
fi

echo "✅ Environment variables setup complete!"
echo "🚀 Now you can deploy with: vercel --prod"
