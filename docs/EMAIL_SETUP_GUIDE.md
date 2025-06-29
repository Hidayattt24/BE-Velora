# 📧 Email Configuration Guide

## Masalah

Email reset password tidak terkirim karena konfigurasi SMTP belum diatur.

## Solusi - Gmail SMTP Setup

### 1. Persiapan Gmail Account

1. Login ke Gmail account Anda
2. Buka **Google Account Settings** → **Security**
3. Aktifkan **2-Step Verification** (jika belum)
4. Generate **App Password**:
   - Search "App passwords" di settings
   - Select "Mail" untuk app type
   - Generate password (16 karakter)

### 2. Update .env File

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your-16-digit-app-password
FROM_EMAIL=youremail@gmail.com
```

### 3. Alternative - Mailtrap (Testing)

Untuk development/testing, gunakan Mailtrap:

```bash
# Mailtrap Configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
FROM_EMAIL=noreply@velora.com
```

### 4. Alternative - Ethereal Email (Free Testing)

Untuk quick testing tanpa setup:

```bash
# Ethereal Email (Auto-generated for testing)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=auto-generated
SMTP_PASS=auto-generated
FROM_EMAIL=test@ethereal.email
```

## Quick Test Setup

Saya akan setup Ethereal Email untuk testing langsung.
