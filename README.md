# ⛈ WeatherGuard Admin

A secure, invite-only weather alert service with a React admin dashboard and Telegram bot integration.

---

## 🏗 System Design

### Database Schema

```
User {
  _id:             ObjectId
  name:            String
  email:           String (unique)
  avatar:          String
  provider:        "google" | "github"
  providerId:      String
  status:          "pending" | "approved" | "rejected"  (default: "pending")
  isAdmin:         Boolean  (default: false)
  telegramChatId:  String?
  city:            String?
  requestMessage:  String?
  createdAt:       Date
  updatedAt:       Date
}
```

---

## 🔄 Data Flow

### How Only Approved Users Receive Alerts

1. **Sign Up** — User authenticates via Google/GitHub OAuth. A `User` document is created with `status: "pending"`.
2. **Request Access** — User fills in their city and an optional request message in the dashboard.
3. **Admin Reviews** — Admin logs into the dashboard and sees all pending users. Admin clicks "Approve".
4. **Telegram Link** — User opens their unique `t.me/Bot?start=<userId>` link. The bot records their `telegramChatId`.
5. **Cron Jobs** — At 8 AM and 6 PM daily, `AlertsService` queries only users where `status === "approved" AND telegramChatId != null`. Weather data is fetched from OpenWeatherMap and sent via Telegram.
6. **Guard Layer** — All admin endpoints are protected by `JwtAuthGuard` (valid token) + `AdminGuard` (isAdmin check). All user endpoints require a valid JWT.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Telegram Bot (via @BotFather)
- Google OAuth credentials
- GitHub OAuth credentials
- OpenWeatherMap API key (free)

### 1. Clone & Install

```bash
git clone <your-repo>

# Backend
cd api
cp .env.example .env
npm install

# Frontend
cd ../admin
cp .env.example .env
npm install
```

### 2. Configure Environment Variables

**`api/.env`:**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
FRONTEND_URL=http://localhost:5173
ADMIN_EMAILS=your@email.com
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=YourBotUsername
OPENWEATHER_API_KEY=...
PORT=3001
```

**`admin/.env`:**
```env
VITE_API_URL=http://localhost:3001
```

### 3. Run

```bash
# Terminal 1 — API
cd api && npm run start:dev

# Terminal 2 — Frontend
cd admin && npm run dev
```

Visit `http://localhost:5173`

---

## 🔐 Social Login & Request Access Flow

1. User visits the app → clicks "Continue with Google" or "Continue with GitHub"
2. OAuth redirect → user grants permission → callback returns JWT token
3. Frontend stores token → user lands on Dashboard
4. User fills in their city and request message → clicks "Save"
5. Status shows **Pending Review** until admin approves

---

## 🛡 Admin Dashboard — Vetting & Approving a User

1. Sign in with an email in `ADMIN_EMAILS` env var
2. Navigate to **Admin Panel** in sidebar
3. See **Pending** tab with all pending users: name, email, provider, request message, city
4. Click **Approve** → user status updates, Telegram notification sent instantly
5. Click **Reject** → user status set to rejected
6. Switch to **All Users** tab to see everyone

---

## 📱 Telegram Bot Notification Flow

1. User goes to Dashboard → clicks **"Open in Telegram"**
2. A link `t.me/YourBot?start=<userId>` opens Telegram
3. User sends `/start <userId>` to the bot → bot saves `telegramChatId`
4. Admin approves the user → bot immediately sends: *"🎉 Access Approved!"*
5. At 8 AM & 6 PM daily → bot sends weather alert with city, temp, conditions

### Simulated Weather Alert

In Admin Panel → find an approved user with Telegram linked → click **"Send Alert"** → real-time weather delivered to their Telegram.

---

## 📂 Project Structure

```
weatherguard/
├── api/                          # NestJS Backend
│   └── src/
│       ├── auth/                 # OAuth + JWT (Google, GitHub, JWT strategies)
│       │   ├── strategies/
│       │   ├── guards/
│       │   ├── auth.service.ts
│       │   └── auth.module.ts
│       ├── users/                # User CRUD
│       │   ├── schemas/          # MongoDB schema
│       │   ├── users.service.ts
│       │   └── users.controller.ts
│       ├── admin/                # Admin endpoints (approve/reject/send alert)
│       ├── telegram/             # Bot polling + notification messages
│       ├── weather/              # OpenWeatherMap API wrapper
│       ├── alerts/               # node-cron scheduled jobs
│       ├── app.module.ts
│       └── main.ts
│
└── admin/                        # React Frontend
    └── src/
        ├── components/layout/    # Sidebar + Layout wrapper
        ├── pages/
        │   ├── LoginPage.tsx     # Google/GitHub OAuth buttons
        │   ├── AuthCallback.tsx  # Captures JWT from redirect
        │   ├── DashboardPage.tsx # User view: status, Telegram link, settings
        │   └── AdminPage.tsx     # Admin: approve/reject/send alerts
        ├── context/AuthContext.tsx
        ├── services/api.ts       # Axios with JWT interceptor
        └── types/index.ts        # TypeScript interfaces
```

---

## 🌐 Deployment

### API → Railway

```bash
npm i -g @railway/cli
cd api && railway init && railway up
# Set all env vars in Railway dashboard
```

### Frontend → Vercel

```bash
cd admin && npx vercel
# Set VITE_API_URL to your Railway API URL
```

---

## 🔒 Security Notes

- JWT tokens expire in 7 days
- Admin access controlled by `ADMIN_EMAILS` env var + `AdminGuard`
- All admin routes: `JwtAuthGuard` + `AdminGuard`
- OAuth only — no passwords stored
- CORS restricted to `FRONTEND_URL`
