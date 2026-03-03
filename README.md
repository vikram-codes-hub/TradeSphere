
# TradeSphere 📈
### AI-Powered Stock Exchange Simulator

<div align="center">

![TradeSphere Banner](https://img.shields.io/badge/TradeSphere-Stock%20Exchange%20Simulator-2d7ef7?style=for-the-badge)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)

> A real-time stock exchange simulator with a custom order matching engine, Redis-backed order book, BullMQ background jobs, and an ML prediction microservice — built to simulate how real exchanges like NSE and NASDAQ operate under the hood.

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [ML Pipeline](#-ml-pipeline)
- [Socket Events](#-socket-events)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🎯 Overview

TradeSphere is a **full-stack, three-service microservice system** that simulates a real stock exchange. It is not a CRUD application — it implements actual financial system concepts:

- A **custom order matching engine** that pairs buy and sell orders when price conditions are met
- A **Redis-backed order book** using sorted sets for O(log n) order insertion and retrieval
- **BullMQ background workers** so heavy tasks never block the Express API
- A **separate Flask ML microservice** that trains on real OHLCV data and predicts next-day stock prices
- **Socket.IO rooms** per stock symbol so clients only receive updates for stocks they are watching

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│              (Vite + Tailwind CSS + Chart.js)                   │
│         HTTP via Axios  │  WebSocket via Socket.IO              │
└─────────────┬───────────┴──────────────┬───────────────────────┘
              │                          │
              ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Node.js Backend                             │
│                  (Express + Socket.IO)                          │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│   │ MongoDB  │  │  Redis   │  │   BullMQ   │  │  JWT Auth  │  │
│   │ (Mongoose│  │(Order Bk)│  │  (Queues)  │  │  (3 roles) │  │
│   └──────────┘  └──────────┘  └─────┬──────┘  └────────────┘  │
└─────────────────────────────────────┼───────────────────────────┘
                                      │ BullMQ Worker
                                      ▼
              ┌───────────────────────────────────────┐
              │         Flask ML Microservice          │
              │    (scikit-learn + Pandas + NumPy)    │
              │                                       │
              │  DataCleaner → FeatureEngineer →      │
              │  ModelSelector (LR vs RF) →           │
              │  TrendClassifier → ConfidenceScorer   │
              │                                       │
              │         Alpha Vantage API             │
              └───────────────────────────────────────┘
```

### Request Flow — Order Matching
```
User Places Order → Node API → Redis Order Book → Matching Engine
→ Trade Recorded (MongoDB) → Portfolios Updated → Socket.IO Broadcast
→ All watching clients receive live update
```

### Request Flow — ML Prediction
```
Premium User clicks Predict → Node API → BullMQ Queue
→ Worker calls Flask /predict → Model trains on real OHLCV data
→ Result stored in MongoDB → Socket.IO emits to user
→ PredictionChart.jsx renders Actual vs Predicted graph
```

---

## ✨ Features

### 🔐 Authentication System
- Register / Login with JWT
- Three roles: **User**, **Premium**, **Admin**
- Role-based route protection on both backend and frontend
- Password hashing with bcryptjs
- JWT blacklist on logout via Redis

### 📊 Virtual Stock Market
- Admin creates stocks with symbol, initial price, and volatility factor
- Each stock tracks current price, volume, market cap, and full price history
- Live price ticker scrolling across the top of the UI

### ⚡ Trading System
- **Market Orders** — execute instantly at the best available price
- **Limit Orders** — sit in the order book until a matching order arrives
- Partial fills supported — if quantities don't match exactly, the remainder stays in the book
- Cancel pending limit orders

### 📖 Order Book (Redis)
- Buy orders sorted descending, sell orders sorted ascending
- Stored in Redis sorted sets (`orderbook:BUY:TECHX`)
- Top 10 bids and asks displayed live, updating via Socket.IO

### 🔧 Matching Engine
The core of TradeSphere. When `highest buy price ≥ lowest sell price`:
1. Calculate executed price
2. Reduce quantities on both orders
3. Record Trade document in MongoDB
4. Update both users' portfolios and cash balances
5. Update stock's current price
6. Emit Socket.IO events to all watching clients

### 🔴 Circuit Breaker
If a stock price moves more than **10% in 60 seconds**:
- Trading is automatically halted for 2 minutes
- All new orders for that symbol are rejected
- `market:halted` event broadcast to all clients
- Mirrors real exchange halting logic (NSE, NYSE)

### 🤖 ML Predictions (Premium)
- Next-day closing price prediction
- Bullish / Bearish / Neutral trend classification
- Confidence percentage (40–95%)
- Actual vs Predicted graph
- Auto-selects best model (Linear Regression vs Random Forest) by RMSE

### 📈 Portfolio System
- Cash balance per user (default ₹1,00,000 virtual)
- Stock holdings with average buy price
- Unrealized P&L (live, updates with price)
- Realized P&L (locked in after sell)
- Full transaction history

### 🏆 Leaderboard
- Top traders by total profit
- Weekly ranking
- Win rate percentage
- Recalculated every 60 seconds via BullMQ scheduled job

### 🌐 Market Simulation
- Every 5 seconds, stock prices fluctuate slightly based on volatility factor
- Simulates real market movement even when no trades are happening
- Handled by BullMQ repeatable job (never blocks the API)

---

## 🗂️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Charts | Chart.js | Candlestick + prediction graphs |
| State | Redux Toolkit / Zustand | Global state management |
| Real-time (FE) | Socket.IO Client | Live order book + trades |
| HTTP Client | Axios | API calls |
| Backend | Node.js + Express | REST API |
| Real-time (BE) | Socket.IO | WebSocket server |
| Database | MongoDB + Mongoose | Persistent storage |
| Cache / Queue | Redis (ioredis) | Order book + price cache |
| Job Queue | BullMQ | Background workers |
| Auth | JWT + bcryptjs | Authentication |
| ML Service | Python + Flask | Prediction microservice |
| ML Models | scikit-learn | Linear Regression + Random Forest |
| Data Processing | Pandas + NumPy | Feature engineering |
| Market Data | Alpha Vantage API | Real OHLCV training data |
| Deployment (FE) | Vercel | Frontend hosting |
| Deployment (BE) | Railway | Backend + Redis + MongoDB |
| Deployment (ML) | Render | ML microservice |

---

## 📁 Project Structure

```
tradesphere/
├── tradesphere-frontend/        # React app
│   ├── src/
│   │   ├── pages/               # Route-level components
│   │   ├── components/          # Feature components
│   │   │   ├── market/          # Stock cards, ticker, charts
│   │   │   ├── trading/         # Order form, order book, trade feed
│   │   │   ├── portfolio/       # Holdings, P&L, balance
│   │   │   ├── prediction/      # ML prediction UI (Premium)
│   │   │   ├── admin/           # Admin panel
│   │   │   └── ui/              # Reusable UI primitives
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # Auth, Socket, Theme contexts
│   │   ├── services/            # Axios API calls
│   │   ├── store/               # Redux/Zustand slices
│   │   └── utils/               # Formatters, helpers
│   └── ...
│
├── tradesphere-backend/         # Node.js API
│   ├── config/                  # DB, Redis, BullMQ setup
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express route definitions
│   ├── controllers/             # Route handlers
│   ├── middleware/              # Auth, role, rate limit
│   ├── services/                # Matching engine, order book, ML bridge
│   ├── queues/                  # BullMQ queue definitions
│   ├── workers/                 # BullMQ worker processors
│   └── utils/                   # JWT, logger, constants
│
└── tradesphere-ml/              # Flask ML microservice
    ├── routes/                  # /predict, /train, /health
    ├── models/                  # LinearModel, RandomForestModel, ModelSelector
    ├── preprocessing/           # DataCleaner, FeatureEngineer, Scaler
    ├── services/                # PredictionService, TrendClassifier, ConfidenceScorer
    ├── training/                # Train from Alpha Vantage, Evaluate
    ├── tests/                   # pytest test suite
    ├── saved_models/            # .pkl files (git-ignored)
    └── data/                    # CSV cache from Alpha Vantage (git-ignored)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Redis (local or Railway)
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co/support/#api-key))

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/tradesphere.git
cd tradesphere
```

### 2. Start the ML Service

```bash
cd tradesphere-ml
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # add your Alpha Vantage key
python app.py
# Running on http://localhost:5001
```

### 3. Start the Backend

```bash
cd tradesphere-backend
npm install
cp .env.example .env            # fill in MongoDB URI, Redis URL, JWT secret
npm run dev
# Running on http://localhost:3000
```

### 4. Start the Frontend

```bash
cd tradesphere-frontend
npm install
cp .env.example .env            # set VITE_API_URL and VITE_SOCKET_URL
npm run dev
# Running on http://localhost:5173
```

### 5. Seed stock data (optional but recommended)

```bash
# Train ML models with real Alpha Vantage data
curl -X POST http://localhost:5001/train/AAPL
curl -X POST http://localhost:5001/train/TSLA
curl -X POST http://localhost:5001/train/MSFT
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### ML Service `.env`
```env
PORT=5001
FLASK_DEBUG=false
ALPHA_VANTAGE_API_KEY=your_key_here
BACKEND_URL=http://localhost:3000
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |

### Stocks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/stocks` | Auth | Get all stocks |
| GET | `/api/stocks/:symbol` | Auth | Get single stock |
| POST | `/api/stocks` | Admin | Create stock |
| PATCH | `/api/stocks/:symbol` | Admin | Update stock |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Auth | Place market or limit order |
| GET | `/api/orders/my` | Auth | Get user's orders |
| DELETE | `/api/orders/:id` | Auth | Cancel limit order |

### Portfolio & Trades
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/portfolio` | Auth | Get user portfolio |
| GET | `/api/trades/:symbol` | Auth | Trade history for stock |
| GET | `/api/trades/my` | Auth | User's trade history |

### Predictions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/predictions/request` | Premium | Queue ML prediction job |
| GET | `/api/predictions/my` | Premium | User's prediction history |

### Leaderboard & Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/leaderboard` | Auth | Top traders |
| GET | `/api/admin/users` | Admin | All users |
| PATCH | `/api/admin/users/:id` | Admin | Upgrade to premium / ban |

---

## 🤖 ML Pipeline

```
Raw Price History (from Node backend)
        ↓
DataCleaner       — removes nulls, sorts by timestamp, clips outliers
        ↓
FeatureEngineer   — computes SMA7, SMA21, RSI14, Bollinger Bands,
                    momentum, daily return, volume change %
        ↓
FeatureScaler     — MinMaxScaler (0–1), saved per stock symbol
        ↓
ModelSelector     — trains LinearRegression + RandomForest,
                    picks lower RMSE on 20% held-out test set
        ↓
TrendClassifier   — predicted > current + 1% → Bullish
                    predicted < current - 1% → Bearish
        ↓
ConfidenceScorer  — RMSE / currentPrice → confidence % (clamped 40–95%)
        ↓
JSON Response     — predictedPrice, trend, confidence, modelUsed, rmse, r2
```

---

## 🔌 Socket Events

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `price:update` | `{ symbol, price, change% }` | Stock price changed |
| `orderbook:update` | `{ symbol, bids, asks }` | Order book changed |
| `trade:executed` | `{ symbol, price, quantity, timestamp }` | Trade matched |
| `portfolio:update` | `{ userId, holdings, cashBalance }` | Portfolio changed |
| `prediction:ready` | `{ userId, symbol, predictedPrice, trend, confidence }` | ML result ready |
| `market:halted` | `{ symbol, reason, resumeAt }` | Circuit breaker triggered |
| `market:resumed` | `{ symbol }` | Trading resumed |

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `subscribe:stock` | `{ symbol }` | Join stock's Socket.IO room |
| `unsubscribe:stock` | `{ symbol }` | Leave stock's room |

---

## 🚢 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [tradesphere.vercel.app](#) |
| Backend | Railway | [tradesphere-api.railway.app](#) |
| ML Service | Render | [tradesphere-ml.onrender.com](#) |

### Deploy Frontend to Vercel
```bash
npm i -g vercel
cd tradesphere-frontend
vercel --prod
```

### Deploy Backend to Railway
1. Push to GitHub
2. New Project on Railway → Deploy from GitHub repo
3. Add MongoDB and Redis plugins
4. Set environment variables

### Deploy ML Service to Render
1. Push to GitHub
2. New Web Service on Render → select `tradesphere-ml` folder
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn --bind 0.0.0.0:$PORT "app:create_app()"`
5. Add `ALPHA_VANTAGE_API_KEY` environment variable

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- Email: your@email.com

---

## ⭐ If you found this project useful, please give it a star!

---

<div align="center">
Built with ❤️ to simulate real financial systems
</div>