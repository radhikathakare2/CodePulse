# ⚡ CodePulse — Competitive Programming Analytics Platform

<div align="center">

![CodePulse Banner](https://img.shields.io/badge/CodePulse-Competitive%20Programming%20Analytics-8B5CF6?style=for-the-badge&logo=lightning&logoColor=white)

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Track your competitive programming journey across LeetCode, Codeforces & GeeksforGeeks — all in one place.**

[Live Demo](#) • [API Docs](#api-documentation) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🚀 Overview

CodePulse is a **production-grade SaaS platform** for competitive programmers who use multiple coding platforms (LeetCode, Codeforces, GeeksforGeeks). It centralizes your progress, gives you AI-powered insights, lets you compete with friends in peer groups, and helps you discover upcoming contests — all in a single stunning dashboard.

### Core Problems Solved

| Problem | Solution |
|---------|----------|
| Progress scattered across platforms | Unified analytics dashboard |
| No personalized study plan | Gemini AI-powered roadmap generation |
| Hard to benchmark against peers | Peer groups + global leaderboards |
| Missing upcoming contests | Contest Hub with live countdowns |
| No subscription management | Razorpay-powered Free/Premium tiers |

---

## ✨ Features

### 🆓 Free Tier
- ✅ Create account with full JWT authentication
- ✅ Connect LeetCode, Codeforces, and GFG profiles
- ✅ View unified analytics dashboard
- ✅ Activity heatmap and submission history
- ✅ Contest Hub — view all upcoming contests
- ✅ Join peer groups and leaderboards
- ✅ Friends system — search, add, compare

### 👑 Premium Tier (₹99/month or ₹799/year)
- ✅ AI Weak Topic Detection (powered by Gemini)
- ✅ Personalized 4-week Study Roadmap
- ✅ Weekly AI Performance Report
- ✅ AI Contest Prediction (rating change estimator)
- ✅ Advanced analytics with PDF export
- ✅ Priority support

### 🛡️ Admin Panel
- ✅ User management (ban/unban)
- ✅ Subscription management
- ✅ Revenue analytics
- ✅ Content management

### 🎯 Resume-Worthy Features
- 📄 Export Analytics as PDF
- 🔗 Public Profile / Coding Portfolio sharing
- 🏆 Achievement Badges system
- 🔥 Streak Tracking with Heatmap Calendar
- 📅 Contest History Timeline

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database with schemas/indexes |
| JWT (Access + Refresh) | Authentication |
| bcryptjs | Password hashing |
| Razorpay | Payment gateway |
| Gemini API | AI insights |
| Nodemailer | Transactional emails |
| Cloudinary | Avatar uploads |
| Helmet + Rate Limiting | Security |
| Morgan | HTTP request logging |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling system |
| Framer Motion | Animations |
| Recharts | Data visualization |
| React Query | Server state management |
| React Router v6 | Client-side routing |
| Lucide React | Icons |
| jsPDF + html2canvas | PDF export |
| React Hot Toast | Notifications |

---

## 📁 Project Structure

```
CodePulse/
├── client/                         # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                 # AI insight components
│   │   │   ├── charts/             # 6 Recharts components
│   │   │   ├── contest/            # Contest cards + countdown
│   │   │   ├── friends/            # Friend cards
│   │   │   ├── groups/             # Group cards
│   │   │   ├── layout/             # Navbar, Sidebar, Layout
│   │   │   ├── leaderboard/        # Leaderboard table
│   │   │   ├── notifications/      # Notification dropdown
│   │   │   ├── platform/           # Per-platform stat cards
│   │   │   └── ui/                 # Shared UI primitives
│   │   ├── context/                # Auth + Notification contexts
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Axios + API functions
│   │   ├── pages/                  # 15+ page components
│   │   └── utils/                  # PDF export, formatters
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                         # Express Backend
│   ├── config/                     # DB, Email, Cloudinary, Razorpay
│   ├── controllers/                # 11 controller files
│   ├── middlewares/                # Auth, Premium, Admin, Error
│   ├── models/                     # 11 Mongoose schemas
│   ├── routes/                     # 11 route files
│   ├── services/                   # Platform fetchers + AI + Payments
│   ├── utils/                      # Tokens, Email, Cache, Response
│   ├── validators/                 # Express-validator chains
│   ├── index.js                    # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js v18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/codepulse.git
cd codepulse
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3. Setup Frontend

```bash
cd client
npm install
npm run dev
```

The app will be running at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/codepulse

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Client
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api/v1`

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create new account | ❌ |
| POST | `/auth/verify-email` | Verify email token | ❌ |
| POST | `/auth/login` | Login with credentials | ❌ |
| POST | `/auth/logout` | Logout, clear tokens | ✅ |
| POST | `/auth/refresh-token` | Get new access token | ❌ |
| POST | `/auth/forgot-password` | Send reset email | ❌ |
| POST | `/auth/reset-password` | Reset with token | ❌ |
| PUT | `/auth/change-password` | Change password | ✅ |

### User Routes (`/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/profile` | Get own profile | ✅ |
| PUT | `/users/profile` | Update profile | ✅ |
| POST | `/users/avatar` | Upload avatar | ✅ |
| DELETE | `/users/account` | Delete account | ✅ |
| GET | `/users/search?q=` | Search users | ✅ |
| GET | `/users/public/:username` | Public portfolio | ❌ |

### Platform Routes (`/platform`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/platform/sync/leetcode` | Sync LeetCode data | ✅ |
| POST | `/platform/sync/codeforces` | Sync Codeforces data | ✅ |
| POST | `/platform/sync/gfg` | Sync GFG data | ✅ |
| GET | `/platform/stats` | All platform stats | ✅ |
| GET | `/platform/calendar` | Heatmap data | ✅ |

### Contest Routes (`/contests`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/contests` | List all upcoming contests | ✅ |
| POST | `/contests/:id/register` | Register interest | ✅ |
| POST | `/contests/:id/reminder` | Set reminder | ✅ |
| GET | `/contests/:id/calendar` | Google Calendar link | ✅ |

### Friends Routes (`/friends`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/friends` | Get friends list | ✅ |
| GET | `/friends/requests` | Pending requests | ✅ |
| POST | `/friends/request/:userId` | Send friend request | ✅ |
| PUT | `/friends/accept/:requestId` | Accept request | ✅ |
| PUT | `/friends/reject/:requestId` | Reject request | ✅ |
| DELETE | `/friends/:friendId` | Remove friend | ✅ |

### Groups Routes (`/groups`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/groups` | Get user's groups | ✅ |
| POST | `/groups` | Create group | ✅ |
| POST | `/groups/join` | Join by invite code | ✅ |
| GET | `/groups/:id` | Group details | ✅ |
| PUT | `/groups/:id` | Update group | ✅ Admin |
| POST | `/groups/:id/invite` | Invite member | ✅ |
| DELETE | `/groups/:id/leave` | Leave group | ✅ |
| GET | `/groups/:id/leaderboard` | Group leaderboard | ✅ |
| GET | `/groups/:id/messages` | Get messages | ✅ |
| POST | `/groups/:id/messages` | Send message | ✅ |

### Leaderboard Routes (`/leaderboard`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/leaderboard/global` | Global leaderboard | ✅ |
| GET | `/leaderboard/weekly` | Weekly leaderboard | ✅ |
| GET | `/leaderboard/monthly` | Monthly leaderboard | ✅ |
| GET | `/leaderboard/friends` | Friends leaderboard | ✅ |

### AI Routes (`/ai`) — 🔒 Premium Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/weak-topics` | Weak topic analysis |
| GET | `/ai/roadmap` | Personalized roadmap |
| GET | `/ai/weekly-report` | Weekly AI review |
| GET | `/ai/contest-prediction` | Rating predictor |
| GET | `/ai/saved-roadmap` | Get saved roadmap |
| GET | `/ai/saved-reports` | Get saved reports |

### Subscription Routes (`/subscription`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/subscription/create-order` | Create Razorpay order | ✅ |
| POST | `/subscription/verify` | Verify payment + activate | ✅ |
| GET | `/subscription/status` | Current plan status | ✅ |

### Admin Routes (`/admin`) — 🔒 Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Dashboard overview |
| GET | `/admin/users` | All users (paginated) |
| PUT | `/admin/users/:id/ban` | Ban user |
| PUT | `/admin/users/:id/unban` | Unban user |
| GET | `/admin/subscriptions` | All subscriptions |
| GET | `/admin/revenue` | Revenue analytics |

---

## 🗄️ Database Schema

### User Model
```
User {
  name, username*, email*, password (hashed)
  profilePhoto { url, public_id }
  bio, college, country, githubUrl
  platformUsernames { leetcode, codeforces, gfg }
  currentRating, rank
  isPremium, premiumPlan, premiumExpiresAt
  isEmailVerified, emailVerificationToken
  resetPasswordToken, refreshToken
  role: 'user' | 'admin'
  isBanned
  friends: [User]
  achievementBadges: [{ name, icon, earnedAt }]
}
```

### PlatformStats Model (TTL: 15 min)
```
PlatformStats {
  userId, platform
  leetcode { totalSolved, easy/medium/hard, contestRating, streak, submissionCalendar }
  codeforces { rating, rank, maxRating, contestHistory[] }
  gfg { totalSolved, codingScore, institutionRank }
  lastUpdated
}
```

---

## 🚢 Deployment

### Frontend — Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client/
cd client
npm run build
vercel --prod
```

**Environment variables to set in Vercel:**
- `VITE_API_URL` → Your Railway/Render backend URL
- `VITE_RAZORPAY_KEY_ID` → Your Razorpay key

### Backend — Railway

1. Create a new Railway project
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. Add all environment variables from `.env.example`
5. Deploy

**Or use Render:**
1. New Web Service → connect repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables

### Database — MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist Railway/Render IP (or allow all: `0.0.0.0/0` for development)
3. Create a database user
4. Copy the connection string to `MONGODB_URI`

---

## 🏆 Achievement Badges

| Badge | Description | Trigger |
|-------|-------------|---------|
| 🔥 First Flame | Solved first problem | First sync |
| ⚡ Speed Coder | 10 problems in a day | Daily streak |
| 🎯 Century Club | 100 total problems | Milestone |
| 🏅 Contest Veteran | 10 contests attended | Contest history |
| 👑 Premium Member | Subscribed to premium | Payment |
| 🌍 Global Ranker | Top 1000 globally | Leaderboard |

---

## 🔮 AI Features (Gemini-Powered)

### Weak Topic Detection
Analyzes your submission history across all platforms and identifies topics where your success rate is lower than average.

**Sample Output:**
> "You excel at Array and String problems (85% success rate) but struggle with Dynamic Programming medium-level questions (42% success rate). Focus on 1D DP patterns this week."

### Personalized Roadmap
Generates a structured week-by-week study plan based on your weak areas and learning pace.

### Weekly Report
Every Sunday, generates a comprehensive review of the past week including problems solved, rating changes, and recommendations.

### Contest Predictor
Based on your performance in similar past contests, predicts your expected rating change and gives preparation tips.

---

## 💳 Payment Plans (Razorpay)

| Plan | Price | Features |
|------|-------|---------|
| **Free** | ₹0 | Basic analytics, contests, groups |
| **Premium Monthly** | ₹99/month | AI features, PDF export, advanced analytics |
| **Premium Yearly** | ₹799/year | Everything + best value (33% savings) |

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend (Vite)              │
│         Tailwind + Framer Motion + Recharts          │
└───────────────────┬─────────────────────────────────┘
                    │ REST API (JSON)
                    │ JWT Auth Token
                    ▼
┌─────────────────────────────────────────────────────┐
│              Express.js REST API Server              │
│         Helmet │ CORS │ Rate Limiter │ Morgan        │
├──────────────────────┬──────────────────────────────┤
│   Controllers        │   Services                   │
│   - auth             │   - leetcode (GraphQL)       │
│   - user             │   - codeforces (API)         │
│   - platform         │   - gfg (scraper)            │
│   - contests         │   - gemini (AI)              │
│   - friends          │   - razorpay (payments)      │
│   - groups           │   - notifications            │
│   - leaderboard      │                              │
│   - ai               │                              │
│   - subscription     │                              │
│   - admin            │                              │
└──────────────────────┴──────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐    ┌────────────────────────┐
│  MongoDB     │    │  External APIs         │
│  Atlas       │    │  - LeetCode GraphQL    │
│              │    │  - Codeforces API      │
│  11 schemas  │    │  - GFG Scraper         │
│  TTL indexes │    │  - Gemini AI           │
│              │    │  - Razorpay            │
│              │    │  - Cloudinary          │
└──────────────┘    └────────────────────────┘
```

---

## 🔒 Security Features

- **JWT Rotation**: Refresh tokens rotated on each use
- **HttpOnly Cookies**: Tokens stored in httpOnly cookies
- **bcrypt Hashing**: Passwords hashed with salt factor 12
- **Rate Limiting**: 100 req/15min global, 20 req/15min for auth
- **Helmet**: Security headers (XSS, CSRF, clickjacking protection)
- **CORS**: Strict origin validation
- **Input Validation**: express-validator on all inputs
- **HMAC Verification**: Razorpay payments verified with crypto

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About

Built as a full-stack portfolio project demonstrating:
- Production MERN stack architecture
- SaaS subscription patterns with Razorpay
- External API integration and data aggregation
- AI-powered personalization with Gemini
- Modern glassmorphic UI design
- JWT authentication with refresh token rotation
- MongoDB schema design with TTL indexes

---

<div align="center">

⭐ **Star this repo if you found it helpful!**

Made with ❤️ for competitive programmers everywhere

</div>
