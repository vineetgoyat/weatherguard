# WeatherGuard Architecture

## System Overview

WeatherGuard is a **three-tier, cloud-native weather alert platform** designed for scalability, security, and maintainability. The system employs a service-oriented architecture with clear separation of concerns between frontend, backend, and external integrations.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│                   React Admin Dashboard                         │
│              (Vite + TypeScript + Tailwind CSS)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     API Gateway / Load Balancer                 │
│                    (Railway / Vercel Edge)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      Business Logic Layer                       │
│              NestJS Backend with Microservices                  │
│                                                                  │
│  ┌──────────┐ ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐  │
│  │  Auth    │ │ Users  │ │ Admin  │ │ Weather │ │ Alerts   │  │
│  │ Service  │ │Service │ │Service │ │ Service │ │ Service  │  │
│  └──────────┘ └────────┘ └────────┘ └─────────┘ └──────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Telegram Service (Bot & Notifications)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼───────┐
│  MongoDB     │  │ Telegram    │  │ OpenWeather │
│  (Database)  │  │ Bot API     │  │ API         │
└──────────────┘  └─────────────┘  └─────────────┘
        │
   ┌────▼─────────┐
   │  OAuth       │
   │  (Google/    │
   │   GitHub)    │
   └──────────────┘
```

---

## Technology Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18+ | UI library with hooks & context API |
| Build Tool | Vite | Lightning-fast bundler & dev server |
| Language | TypeScript | Type-safe JavaScript |
| Styling | Tailwind CSS | Utility-first CSS framework |
| HTTP Client | Axios | REST API requests with interceptors |
| State | React Context + useAuth | Global authentication state |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | NestJS | Progressive Node.js framework with dependency injection |
| Language | TypeScript | Enterprise-grade type safety |
| Database | MongoDB | NoSQL document store (Atlas) |
| Authentication | Passport.js | Multi-strategy OAuth + JWT |
| Task Scheduling | node-cron | Scheduled alerts (8 AM, 6 PM) |
| External APIs | Axios | HTTP client for Telegram & OpenWeatherMap |
| ORM | Mongoose | MongoDB ODM with validation |

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Backend Deployment | Railway | NestJS API hosting |
| Frontend Deployment | Vercel | React app CDN & deployment |
| Database | MongoDB Atlas | Managed MongoDB cloud |
| Real-time Messaging | Telegram Bot API | User notifications |
| Weather Data | OpenWeatherMap API | Real-time weather data |
| Authentication | OAuth 2.0 | Google & GitHub sign-in |

---

## Core Architecture Patterns

### 1. Module-Based Organization (NestJS)

Each feature is a self-contained module with clear responsibilities:

```
src/
├── auth/              # Authentication & Authorization
│   ├── strategies/    # Passport strategies (Google, GitHub, JWT)
│   ├── guards/        # Route authorization (JwtAuthGuard, AdminGuard)
│   ├── auth.service   # Token generation, validation
│   ├── auth.controller # OAuth callback routes
│   └── auth.module    # Module definition
│
├── users/             # User Management
│   ├── schemas/       # Mongoose schemas
│   ├── users.service  # CRUD operations
│   ├── users.controller # REST endpoints
│   └── users.module   # Module definition
│
├── admin/             # Admin Operations
│   ├── admin.service  # Approve/reject/alert logic
│   ├── admin.controller # Admin endpoints
│   └── admin.module   # Module definition
│
├── weather/           # External Weather API
│   ├── weather.service # OpenWeatherMap integration
│   └── weather.module  # Module definition
│
├── telegram/          # Telegram Bot Integration
│   ├── telegram.service # Bot polling & messages
│   ├── telegram.controller # Webhook endpoints
│   └── telegram.module # Module definition
│
├── alerts/            # Background Jobs
│   ├── alerts.service # Scheduled notifications
│   └── alerts.module  # Module definition
│
└── app.module         # Root module (ties everything together)
```

### 2. Service-Oriented Architecture

Each module follows the **service pattern**:
- **Controller**: HTTP request handling, input validation, response formatting
- **Service**: Business logic, data transformations, external API calls
- **Schema**: Data structure definition and validation

### 3. Guard-Based Authorization

Three-layer authorization strategy:

```
1. JwtAuthGuard       → Validates JWT token exists and is valid
2. AdminGuard         → Checks if user.isAdmin === true
3. Route Guard        → Optional: specific resource ownership checks
```

Example flow:
```
DELETE /admin/users/:id
  ↓
JwtAuthGuard (is user logged in?)
  ↓
AdminGuard (is user an admin?)
  ↓
AdminService.rejectUser(id)
```

---

## Data Model & Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,                    // From OAuth provider
  email: String (unique, indexed),
  avatar: String,                  // Provider profile picture
  provider: "google" | "github",
  providerId: String,              // Provider's user ID
  status: "pending" | "approved" | "rejected",
  isAdmin: Boolean,
  telegramChatId: String (indexed), // Null until Telegram linked
  city: String,                    // Indexed for weather lookups
  requestMessage: String,
  createdAt: Date (indexed),
  updatedAt: Date,
  __v: Number
}
```

**Indexes:**
- `email` — O(1) lookup during OAuth
- `telegramChatId` — Fast alert recipient queries
- `city` — Efficient batch weather fetches
- `createdAt` — Dashboard sorting

---

## Authentication & Authorization Flow

### OAuth Login Flow

```
1. User clicks "Continue with Google/GitHub"
   ↓
2. Frontend redirects to backend OAuth endpoint
   ↓
3. NestJS Passport strategy handles OAuth callback
   ↓
4. Strategy retrieves user profile from provider
   ↓
5. Backend creates/updates user in MongoDB
   ↓
6. JWT token generated (7-day expiry)
   ↓
7. Redirect to frontend with token in URL
   ↓
8. Frontend stores token in localStorage
   ↓
9. Axios interceptor adds JWT to all subsequent requests
```

### JWT Token Structure

```json
{
  "sub": "<userId>",
  "email": "user@example.com",
  "isAdmin": false,
  "iat": 1719615600,
  "exp": 1720220400
}
```

### Protected Route Flow

```
GET /users/profile
Header: Authorization: Bearer <JWT>
  ↓
JwtAuthGuard validates signature & expiry
  ↓
Request continues with decoded user in request.user
  ↓
UsersService returns user profile
```

### Admin Route Flow

```
PATCH /admin/users/:id/approve
Header: Authorization: Bearer <JWT>
  ↓
JwtAuthGuard validates JWT
  ↓
AdminGuard checks request.user.isAdmin === true
  ↓
AdminService updates user status to "approved"
  ↓
AlertsService sends Telegram notification
```

---

## Alert System Architecture

### Scheduled Alert Pipeline

```
node-cron (8 AM & 6 PM UTC)
  ↓
AlertsService.sendWeatherAlerts()
  ↓
Query: { status: "approved", telegramChatId: { $exists: true } }
  ↓
For each user:
  ├─ WeatherService.getWeather(city)
  ├─ TelegramService.sendMessage(chatId, weatherData)
  └─ Log delivery status
```

### Telegram Bot Integration

```
User: /start or direct message
  ↓
TelegramService receives update via polling
  ↓
Extract userId from message
  ↓
TelegramService.linkUserTelegram(userId, chatId)
  ↓
Update User document: telegramChatId = chatId
  ↓
Send confirmation message to Telegram
```

### Manual Alert (Admin Testing)

```
Admin clicks "Send Alert" in dashboard
  ↓
POST /admin/alerts/:userId
  ↓
WeatherService.getWeather(user.city)
  ↓
TelegramService.sendMessage(user.telegramChatId, weatherData)
  ↓
Response: { success: true, message: "Alert sent" }
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiates Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/github` | Initiates GitHub OAuth |
| GET | `/auth/github/callback` | GitHub OAuth callback |

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | JWT | Get current user |
| PUT | `/users/profile` | JWT | Update city/request message |
| GET | `/users/:id` | JWT | Get specific user |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | JWT + Admin | List all users |
| PATCH | `/admin/users/:id/approve` | JWT + Admin | Approve user |
| PATCH | `/admin/users/:id/reject` | JWT + Admin | Reject user |
| POST | `/admin/alerts/:userId` | JWT + Admin | Send test alert |

### Telegram Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/telegram/webhook` | Telegram bot updates |

---

## Security Architecture

### Authentication

- **OAuth 2.0** — No passwords stored, delegated to Google/GitHub
- **JWT Tokens** — 7-day expiry, signed with `JWT_SECRET`
- **HttpOnly Cookies** (optional) — Could replace localStorage

### Authorization

- **Role-Based Access Control (RBAC)** — `isAdmin` flag in JWT
- **Guards** — Multi-layer authorization at route level
- **Scope Validation** — Users can only modify their own profiles

### Data Protection

- **CORS** — Restricted to `FRONTEND_URL`
- **Environment Variables** — All secrets stored securely (never committed)
- **MongoDB Validation** — Mongoose schema validation before database

### API Rate Limiting (Future Enhancement)

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
```

---

## Data Flow Examples

### Complete User Journey

```
1. User lands on frontend
   ├─ AuthContext checks for token in localStorage
   ├─ If found, validating against /users/profile
   └─ Renders appropriate page (Login vs Dashboard)

2. User clicks "Continue with Google"
   ├─ Frontend redirects to backend OAuth endpoint
   ├─ Backend redirects to Google
   ├─ User grants permission
   └─ Google redirects back to backend

3. Backend OAuth callback
   ├─ Extracts profile from Google
   ├─ Checks if user exists by email
   ├─ Creates new user or updates existing
   ├─ Generates JWT token
   └─ Redirects frontend to callback page with token

4. Frontend captures token from URL
   ├─ Stores in localStorage
   ├─ Redirects to Dashboard
   ├─ AuthContext trigger re-render
   └─ User sees dashboard

5. User submits city + request message
   ├─ Frontend calls PUT /users/profile
   ├─ Axios interceptor adds JWT
   ├─ Backend validates JWT and user
   ├─ UsersService updates database
   └─ Frontend shows "Pending Review"

6. Admin logs in (email in ADMIN_EMAILS)
   ├─ Goes through same OAuth flow
   ├─ Backend sets isAdmin = true based on email
   ├─ Admin sees Admin Panel in sidebar
   └─ AdminPage loads pending users

7. Admin clicks approve
   ├─ Frontend POST /admin/users/:id/approve
   ├─ Backend checks JWT + AdminGuard
   ├─ AdminService updates user.status = "approved"
   ├─ TelegramService sends notification
   └─ Frontend refreshes user list

8. User connects Telegram
   ├─ Frontend shows t.me/bot?start=userId link
   ├─ User clicks → opens Telegram
   ├─ Bot receives /start with userId
   ├─ TelegramService links chatId to user
   └─ User ready for alerts

9. Scheduled alert runs (8 AM)
   ├─ node-cron triggers AlertsService
   ├─ Queries approved users with Telegram
   ├─ WeatherService fetches data for each city
   ├─ TelegramService sends messages
   └─ Logs recorded for monitoring
```

---

## Scalability Considerations

### Current Architecture (Single Instance)

✓ Works well for < 10K users  
✓ Simple deployment and maintenance  
✓ Minimal operational overhead

### Scaling Strategies

#### Horizontal Scaling (Multiple Backend Instances)

```
Load Balancer
├─ API Instance 1 (NestJS)
├─ API Instance 2 (NestJS)
└─ API Instance 3 (NestJS)
   ↓
Single MongoDB Database
```

**Considerations:**
- Alerts service needs coordination (prevent duplicate sends)
- Use MongoDB session locking or Redis for distributed coordination
- JWT-based stateless authentication (already scales)

#### Database Optimization

```javascript
// Partition strategies for large collections
db.users.createIndex({ status: 1, telegramChatId: 1 })
db.users.createIndex({ city: 1, status: 1 })
db.users.createIndex({ createdAt: -1 })
```

#### Telegram Bot Scaling

- Current: Polling (simple, works for < 100K users)
- Scaled: Webhook mode (higher throughput, requires public IP)

#### Weather API Caching

```typescript
// Cache weather data per city for 30 minutes
const cache = new Map<string, CachedWeather>();
```

---

## Deployment Architecture

### Development Environment

```
localhost:3001   → Backend (npm run start:dev)
localhost:5173   → Frontend (npm run dev)
```

### Production Environment

#### Backend (Railway)

```
source: GitHub repository
build: npm install && npm run build
start: npm run start:prod
environment: Production env vars
databases: MongoDB Atlas connection
```

#### Frontend (Vercel)

```
source: GitHub repository
build: npm run build
runtime: Node.js (for server-side functionality)
environment: VITE_API_URL = railway-api-url
CDN: Automatic global distribution
```

#### External Services

```
MongoDB Atlas    → Managed database
Telegram Bot API → Message delivery
OpenWeatherMap   → Weather data
Google OAuth     → User authentication
GitHub OAuth     → User authentication
```

---

## Monitoring & Observability

### Logging Strategy

```typescript
// Per module
Logger.log('User approved', { userId, adminId })
Logger.warn('Telegram delivery failed', { chatId, error })
Logger.error('Weather API down', { error })
```

### Metrics to Track

- Login success/failure rate
- Admin approval rate
- Telegram delivery success rate
- Alert send duration
- API response times
- OAuth callback latency

### Error Handling

```typescript
// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log to monitoring service
    // Return proper error response
  }
}
```

---

## Future Enhancements

### Phase 2

- [ ] Multiple cities per user
- [ ] Weather alert thresholds (e.g., only notify on rain)
- [ ] SMS/Email notifications
- [ ] User invite system (referral)

### Phase 3

- [ ] Real-time notifications (WebSocket)
- [ ] Weather history & analytics
- [ ] Mobile app (React Native)
- [ ] Admin audit logs

### Phase 4

- [ ] Machine learning for weather patterns
- [ ] Personalized recommendations
- [ ] Multi-language support
- [ ] Enterprise dashboard

---

## Conclusion

WeatherGuard is designed as a **scalable, secure, and maintainable** weather alert platform. The modular NestJS architecture allows easy feature additions, while the separation of concerns between services ensures code remains testable and decoupled. OAuth-based authentication eliminates password management complexity, and the alert system's cron-based approach provides reliable, scheduled notifications at scale.
