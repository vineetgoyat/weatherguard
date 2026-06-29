# ⛈ WeatherGuard Admin

Welcome to **WeatherGuard** — a smart, secure weather alert service that delivers personalized weather updates right to your Telegram! 

This is an invite-only platform where users can request access, get vetted by admins, and receive daily weather alerts tailored to their location. Built with a React admin dashboard and powered by Telegram bot integration.

---

## 🏗 How It Works

### What's Stored in the Database

Every user in the system is tracked with this information:

```
User {
  _id:             ObjectId          # Unique identifier
  name:            String             # From OAuth provider
  email:           String (unique)    # For admin vetting
  avatar:          String             # Profile picture
  provider:        "google" | "github"# Authentication method
  providerId:      String             # Provider's user ID
  status:          "pending" | "approved" | "rejected"
  isAdmin:         Boolean            # Can this user approve others?
  telegramChatId:  String?            # Telegram link (added when user connects bot)
  city:            String?            # Where they want weather alerts
  requestMessage:  String?            # Why they want access
  createdAt:       Date               # Account creation time
  updatedAt:       Date               # Last change
}
```


---

## 🔄 The User Journey: From Sign-Up to Alerts

Here's how a user goes from zero to receiving daily weather alerts:

1. **Sign Up** — User clicks "Continue with Google" or "Continue with GitHub". No password, no hassle. They get added to the system as **Pending** until an admin reviews them.

2. **Request Access** — User fills in their dashboard with:
   - Which city they want weather updates for
   - An optional message explaining why they need this (so admins know they're legit)

3. **Admin Approval** — An admin logs into the dashboard, sees the pending user, and clicks **Approve** (or rejects if needed).

4. **Connect Telegram** — Once approved, the user opens the Telegram bot link (`t.me/YourBot?start=<userId>`). This tells the bot "link this Telegram account to my WeatherGuard profile".

5. **Daily Alerts** — Every day at **8 AM and 6 PM**, the system automatically sends:
   - Current temperature
   - Weather conditions (sunny, rainy, etc.)
   - City name
   - All via Telegram

### 🛡️ How We Keep It Secure

- Only **approved** users with Telegram connected get alerts
- All admin routes require both a valid JWT token AND admin privileges
- OAuth only — we never touch your password
- CORS is locked down to only accept requests from the frontend

---

## 🚀 Getting Started

### What You'll Need

Before you start, gather these pieces:

- **Node.js 18+** — The JavaScript runtime
- **MongoDB Atlas** — Free database (sign up at mongodb.com)
- **Telegram Bot Token** — Create one via @BotFather on Telegram
- **Google OAuth Credentials** — From Google Cloud Console
- **GitHub OAuth Credentials** — From GitHub Developer Settings
- **OpenWeatherMap API Key** — Free tier at openweathermap.org

### Step 1: Clone & Install

```bash
# Clone the repo
git clone <your-repo>

# Set up the backend (API)
cd api
cp .env.example .env    # Create your env file
npm install             # Install dependencies

# Set up the frontend (Admin Dashboard)
cd ../admin
cp .env.example .env    # Create your env file
npm install             # Install dependencies
```

### Step 2: Configure Your Environment Variables

These files tell the app where to connect and how to authenticate. Copy these into your `.env` files:

**For `api/.env`:**
```env
# Database connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weatherguard

# JWT Secret (make this a long random string!)
JWT_SECRET=your-super-secret-random-string-here

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# GitHub OAuth (get from GitHub Developer Settings)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback

# Frontend location (for CORS)
FRONTEND_URL=http://localhost:5173

# Emails that should be admins (comma-separated)
ADMIN_EMAILS=your@email.com,another@email.com

# Telegram Bot (from @BotFather)
TELEGRAM_BOT_TOKEN=123456789:ABCDefGhIjKlMnOpQrStUvWxYz
TELEGRAM_BOT_USERNAME=YourBotUsername

# Weather API key (from openweathermap.org)
OPENWEATHER_API_KEY=your-api-key-here

# What port to run on
PORT=3001
```

**For `admin/.env`:**
```env
VITE_API_URL=http://localhost:3001
```

### Step 3: Run Both Services

```bash
# Terminal 1 — Start the backend (leave this running)
cd api
npm run start:dev

# Terminal 2 — Start the frontend (leave this running)
cd admin
npm run dev
```

Then visit **`http://localhost:5173`** in your browser!

---

## 🔐 User Sign-Up Experience

Here's what a new user sees and does:

1. **Landing Page** — User clicks "Continue with Google" or "Continue with GitHub"
2. **OAuth Permission** — They log in and grant permission (this is normal and safe)
3. **Dashboard** — After login, they see a form with two fields:
   - **City** (required) — Where they want weather updates
   - **Request Message** (optional) — "I live here and love weather updates!" or whatever they want to say
4. **Submit** — They click "Save" and see **"Pending Review"** status
5. **Wait for Approval** — Admins review their request. Once approved:
   - ✅ User sees status change to **Approved**
   - 🤖 User can now connect their Telegram
   - 📱 They start receiving daily weather alerts

---

## �‍💼 Admin Dashboard Guide

If your email is in `ADMIN_EMAILS`, you get superpowers! Here's how to use the admin panel:

1. **Sign In** — Use your email (the one in `ADMIN_EMAILS` variable) to log in
2. **Navigate to Admin Panel** — Click the admin link in the sidebar
3. **Review Pending Users** — You'll see:
   - User's name and email
   - Which provider they used (Google, GitHub)
   - Their city
   - Their request message
   - A timestamp of when they signed up
4. **Take Action:**
   - ✅ **Approve** — User gets access, Telegram notification sent immediately
   - ❌ **Reject** — User is denied (they'll see rejected status)
5. **Send Test Alerts** — Once a user is approved and has Telegram connected:
   - Select them in the dashboard
   - Click "Send Alert" to immediately send a weather update to their Telegram
   - Great for testing!
6. **View All Users** — Switch to "All Users" tab to see everyone (approved, pending, rejected)

---

## 📱 How Telegram Alerts Work

### Connecting to the Bot

Once an admin approves you, you need to link your Telegram to WeatherGuard:

1. **Click the Link** — Dashboard shows "Open in Telegram" button
2. **Start the Bot** — This takes you to Telegram and starts a conversation with your bot
3. **Bot Confirms** — Bot recognizes you and saves your Telegram chat ID to WeatherGuard
4. **You're Set!** — Now you're ready for daily alerts

### Getting Daily Alerts

- **Every day at 8 AM** — You get a weather update for your city
- **Every day at 6 PM** — Another update
- **What You See:**
  ```
  🌤 NYC Weather Update
  Temperature: 72°F
  Conditions: Partly Cloudy
  ```

### Test It Out Right Now

Don't want to wait until 8 AM? As an admin:
1. Find an approved user with Telegram connected
2. Click "Send Alert" button
3. Check their Telegram — the alert arrives instantly!

---

## 📂 Project Structure Overview

```
weatherguard/
│
├── api/                          # The Backend (NestJS)
│   └── src/
│       ├── auth/                 # Login & Security
│       │   ├── strategies/       # Google, GitHub, JWT login methods
│       │   ├── guards/           # JWT & Admin permission checks
│       │   ├── auth.service.ts   # Business logic for auth
│       │   └── auth.module.ts    # Module configuration
│       │
│       ├── users/                # User Management
│       │   ├── schemas/          # MongoDB data structure for users
│       │   ├── users.service.ts  # Create, read, update user logic
│       │   └── users.controller.ts # HTTP endpoints for users
│       │
│       ├── admin/                # Admin Functionality
│       │   ├── admin.service.ts  # Approve/reject/send alerts logic
│       │   ├── admin.controller.ts # HTTP endpoints for admin actions
│       │   └── admin.module.ts   # Module configuration
│       │
│       ├── telegram/             # Telegram Bot
│       │   ├── telegram.service.ts # Bot polling & message sending
│       │   └── telegram.controller.ts # Webhook endpoints
│       │
│       ├── weather/              # Weather Data
│       │   └── weather.service.ts # Fetches data from OpenWeatherMap API
│       │
│       ├── alerts/               # Alert Scheduling
│       │   └── alerts.service.ts # Runs cron jobs at 8 AM & 6 PM
│       │
│       ├── app.module.ts         # Main app configuration
│       └── main.ts               # Entry point, starts server
│
└── admin/                        # The Frontend (React)
    └── src/
        ├── components/
        │   ├── layout/           # Main layout wrapper with sidebar
        │   └── WeatherBackground.tsx # Background styling
        │
        ├── pages/
        │   ├── LoginPage.tsx     # Sign up with Google/GitHub
        │   ├── AuthCallback.tsx  # Handles OAuth redirect
        │   ├── DashboardPage.tsx # User dashboard (city, status, Telegram link)
        │   └── AdminPage.tsx     # Admin approvals & sending alerts
        │
        ├── context/
        │   └── AuthContext.tsx   # Stores logged-in user state
        │
        ├── services/
        │   └── api.ts            # API calls with JWT authentication
        │
        ├── types/
        │   └── index.ts          # TypeScript interfaces
        │
        └── main.tsx              # Entry point

---

## � Ready to Deploy?

### Deploy the Backend to Render

Render is perfect for hosting NestJS apps:

```bash
# Install Render CLI
npm i -g @render/cli

# Go to your API folder and initialize
cd api
render init
render up

# In the Render dashboard, add all your env variables from .env
```

### Deploy the Frontend to Vercel

Vercel is perfect for React:

```bash
cd admin
npx vercel

# When prompted for env variables, set:
# VITE_API_URL = your-render-api-url.render.app
```

Your app is now live! 🎉

---

## 🔒 Security & Privacy

Here's how we keep your data safe:

- **No Passwords** — We only use OAuth (Google/GitHub). Your password never touches our servers.
- **JWT Tokens** — They expire after 7 days. Users need to log back in after that.
- **Admin Gatekeeper** — Only emails you specify in `ADMIN_EMAILS` can access admin features.
- **Permission Checks** — Every admin request checks: "Is this user logged in?" AND "Is this user an admin?"
- **CORS Protection** — Only requests from your frontend URL are accepted.
- **Approved Users Only** — Alerts are only sent to users who:
  - Have been approved by an admin
  - Have their Telegram connected
  - Have a valid city set
