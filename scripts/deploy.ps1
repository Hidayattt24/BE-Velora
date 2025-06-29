# Velora Backend Deployment Script for Windows
Write-Host "🚀 Deploying Velora Backend to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Login to Vercel (if not already logged in)
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Yellow
try {
    vercel whoami
} catch {
    vercel login
}

# Set environment variables reminder
Write-Host "📝 Environment Variables Setup" -ForegroundColor Cyan
Write-Host "Please make sure to set these environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "- SUPABASE_URL" -ForegroundColor White
Write-Host "- SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "- SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "- JWT_SECRET" -ForegroundColor White
Write-Host "- ALLOWED_ORIGINS" -ForegroundColor White
Write-Host "- ML_API_URL (optional)" -ForegroundColor Gray
Write-Host "- SMTP_HOST (optional)" -ForegroundColor Gray
Write-Host "- SMTP_PORT (optional)" -ForegroundColor Gray
Write-Host "- SMTP_USER (optional)" -ForegroundColor Gray
Write-Host "- SMTP_PASS (optional)" -ForegroundColor Gray

# Deploy to production
Write-Host "🚀 Deploying to production..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your API will be available at the URL shown above" -ForegroundColor Cyan
Write-Host "📊 Check logs with: vercel logs --app=[your-app-name]" -ForegroundColor Yellow
