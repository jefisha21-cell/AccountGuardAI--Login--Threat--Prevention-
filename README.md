<div align="center">

<img src="https://img.shields.io/badge/AccountGuard-AI-6366f1?style=for-the-badge&logo=shield&logoColor=white" alt="AccountGuard AI" />

# AccountGuard AI

### 🛡️ AI-Powered Identity Threat Detection Platform

**Real-time machine learning security that adapts to every login.**  
Stop credential attacks before they succeed — not after.

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

![Preview](https://via.placeholder.com/900x400/0f172a/6366f1?text=AccountGuard+AI+%E2%80%94+Enterprise+Security+Platform)

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [How It Works](#-how-it-works)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Test Credentials](#-test-credentials)
- [API Reference](#-api-reference)
- [ML Model](#-ml-model)
- [Security](#-security)

---

## 🚨 The Problem

Every day, organisations face a silent crisis.

**Passwords are not enough.** Once stolen — through phishing, data breaches, or social engineering — an attacker has everything they need to walk straight into your systems. Traditional login systems treat every login the same way, with zero intelligence about whether the person logging in is actually who they claim to be.

The consequences are severe:

> 🔓 **61% of data breaches** involve compromised credentials *(Verizon DBIR)*

| Challenge | Impact |
|---|---|
| Credential stuffing attacks | Bots test millions of stolen passwords automatically |
| Account takeover | Attackers login from unknown devices and locations |
| No behavioural analysis | Systems can't tell normal from suspicious logins |
| Delayed incident response | Breaches discovered hours or days after they happen |
| Static authentication | Every user gets the same login regardless of risk |

The result: **accounts are compromised, data is exposed, and the organisation finds out too late.**

---

## 💡 The Solution

**AccountGuard AI** applies machine learning at the point of authentication.

Instead of blindly accepting valid credentials, it analyses **8 real-time signals** from every login and classifies it as Normal, Medium Risk, or High Risk — then responds accordingly. The system adapts to each user's behaviour pattern and flags anything that looks out of place, even when the password is correct.

This is **Zero Trust authentication in practice**: never trust, always verify.

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMPLOYEE LOGS IN                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI COLLECTS 8 LOGIN SIGNALS                        │
│                                                                 │
│  Browser · Device · OS · Location (IP Geo) · Login Hour        │
│  Failed Attempts · New Device · New Location                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│           RANDOM FOREST CLASSIFIER PREDICTS RISK                │
└──────────────┬──────────────────┬──────────────────┬───────────┘
               │                  │                  │
               ▼                  ▼                  ▼
        ┌──────────┐      ┌──────────────┐   ┌─────────────────┐
        │  NORMAL  │      │    MEDIUM    │   │   SUSPICIOUS    │
        │          │      │     RISK     │   │   (HIGH RISK)   │
        │ JWT      │      │              │   │                 │
        │ issued   │      │ OTP sent     │   │ Login BLOCKED   │
        │          │      │ to email     │   │ Alert emails    │
        │ Employee │      │              │   │ sent to         │
        │ enters   │      │ Verify →     │   │ employee +      │
        │ portal   │      │ JWT issued   │   │ admin           │
        └──────────┘      └──────────────┘   └─────────────────┘
```

---

## ✨ Key Features

### 🤖 AI Risk Engine
- Random Forest ML model classifying every login in real time
- 8-feature behavioural analysis per login attempt
- IP geolocation via `ip-api.com` for location anomaly detection
- Safe encoder — gracefully handles unseen values at inference time
- Account lockout after 5 consecutive failed password attempts

### 🔐 Adaptive Authentication
- **Normal** → JWT issued instantly
- **Medium Risk** → 6-digit OTP sent to registered email (5-min expiry)
- **Suspicious** → Login blocked, alerts fired immediately
- New device and new location detection against previous session
- bcrypt password hashing (cost factor 12)
- JWT sessions with configurable expiry

### 📊 Admin Portal
- Real-time dashboard — 6 live security metrics
- Employee management — register, search, unblock accounts
- Login history table with CSV export
- Alerts panel with pulsing unread indicators + mark as read
- 5-chart analytics suite:
  - Risk Distribution (Pie)
  - Browser Stats (Bar)
  - Department Breakdown (Pie)
  - Top Login Locations (Horizontal Bar)
  - Daily Login Trend (Area chart — 30 days)
- Complete audit log of every system action

### 👤 Employee Portal
- Personal security dashboard with latest session details
- Full login history with risk badges
- Profile page
- Change password (with current password verification)
- Mobile-responsive with animated sidebar drawer

### 📧 Email Alerts
| Trigger | Recipients |
|---|---|
| Medium risk login | Employee (OTP) |
| Suspicious login detected | Employee + Admin |
| Account blocked (5 failed attempts) | Employee + Admin |

### 🌙 UI/UX
- Dark / Light mode with system preference detection
- Fully responsive — desktop and mobile
- Animated transitions via Framer Motion
- Toast notifications for all actions

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.111 | REST API framework with automatic OpenAPI docs |
| **MongoDB Atlas** | Cloud | Primary database — employees, logs, alerts, OTPs |
| **PyMongo** | 4.7 | MongoDB Python driver |
| **scikit-learn** | 1.5 | Random Forest Classifier for risk prediction |
| **bcrypt** | 4.1 | Secure password hashing |
| **python-jose** | 3.3 | JWT token creation and validation |
| **user-agents** | 2.2 | Browser, device, OS parsing from User-Agent header |
| **requests** | 2.32 | IP geolocation API calls |
| **pandas** | 2.2 | Data processing for ML inference |
| **joblib** | 1.4 | ML model serialisation and loading |
| **python-dotenv** | 1.0 | Environment variable management |
| **uvicorn** | 0.30 | ASGI server |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | Component-based UI framework |
| **Vite** | 5.4 | Lightning-fast build tool and dev server |
| **Tailwind CSS** | 3 | Utility-first CSS framework |
| **React Router** | 6.23 | Client-side routing with auth guards |
| **Axios** | 1.7 | HTTP client with JWT interceptors |
| **Recharts** | 2.12 | Composable chart library |
| **Framer Motion** | 11.2 | Production-grade animations |
| **Lucide React** | 0.395 | Clean, consistent icon set |
| **react-hot-toast** | 2.4 | Lightweight toast notifications |

---

## 📁 Project Structure

```
accountguard-ai/
│
├── backend/                        # FastAPI application
│   ├── main.py                     # All API routes and business logic
│   ├── auth.py                     # Password hashing + JWT sign/verify
│   ├── middleware.py               # Route guards (Admin / Employee)
│   ├── database.py                 # MongoDB connection + 5 collections
│   ├── predict.py                  # ML model loader + risk prediction
│   ├── model_train.py              # Training script (run to retrain)
│   ├── otp_service.py              # OTP generate, store, verify
│   ├── email_service.py            # All outbound email functions
│   ├── utils.py                    # File logger + audit log writer
│   ├── seed.py                     # Dev database seeder
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Secrets (not committed)
│   │
│   ├── dataset/
│   │   └── login_dataset.csv       # ML training data
│   │
│   ├── models/
│   │   ├── fraud_model.pkl         # Trained Random Forest model
│   │   ├── encoders.pkl            # Feature label encoders
│   │   └── label_encoder.pkl       # Output label encoder
│   │
│   └── logs/
│       └── accountguard.log        # Application log file
│
└── frontend/                       # React + Vite application
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    │
    └── src/
        ├── App.jsx                 # Router + role-based auth guards
        ├── main.jsx                # React entry point
        ├── index.css               # Global styles + Tailwind directives
        │
        ├── context/
        │   ├── AuthContext.jsx     # JWT state, login, logout
        │   └── ThemeContext.jsx    # Dark / light mode
        │
        ├── layouts/
        │   ├── AdminLayout.jsx     # Admin sidebar + mobile drawer
        │   └── EmployeeLayout.jsx  # Employee sidebar + mobile drawer
        │
        ├── pages/
        │   ├── LoginPage.jsx       # Login form with error handling
        │   ├── OTPPage.jsx         # 6-digit OTP input with paste support
        │   │
        │   ├── admin/
        │   │   ├── Dashboard.jsx   # Security overview + stat cards
        │   │   ├── Employees.jsx   # Register + search + unblock
        │   │   ├── LoginHistory.jsx # Full log + CSV export
        │   │   ├── Alerts.jsx      # High-risk alert cards
        │   │   ├── Analytics.jsx   # 5 recharts visualisations
        │   │   └── AuditLogs.jsx   # Searchable audit trail
        │   │
        │   └── employee/
        │       ├── Dashboard.jsx   # Session details + stats
        │       ├── Profile.jsx     # Account info + change password
        │       └── MyLogins.jsx    # Personal login history
        │
        ├── components/ui/
        │   ├── PageHeader.jsx      # Reusable page title component
        │   ├── StatCard.jsx        # Animated metric card
        │   ├── Table.jsx           # Generic sortable table
        │   ├── RiskBadge.jsx       # Normal / Medium / High badge
        │   ├── Spinner.jsx         # Loading indicator
        │   └── ThemeToggle.jsx     # Dark / light toggle button
        │
        └── services/
            └── api.js              # Axios instance + all API functions
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- A Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/accountguard-ai.git
cd accountguard-ai
```

---

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/
MONGO_TLS_ALLOW_INVALID=false

# Auth
JWT_SECRET=your_very_strong_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

# Email (Gmail App Password)
EMAIL_ADDRESS=youremail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
ADMIN_EMAIL=admin@yourdomain.com

# CORS
ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Seed the database with test employees:

```bash
python seed.py
```

Start the backend server:

```bash
uvicorn main:app --reload
```

- API: `http://localhost:8000`
- Interactive Docs: `http://localhost:8000/docs`

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`

For production build:

```bash
npm run build
npm run preview
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@company.com` | `Admin@123` |
| Employee | `john@company.com` | `john123` |
| Employee | `alice@company.com` | `alice123` |
| Employee | `david@company.com` | `david123` |
| Employee | `emma@company.com` | `emma123` |
| Employee | `michael@company.com` | `michael123` |

> **Tip:** To test Medium Risk, clear your browser cookies and log in again — the system will detect a new device and trigger OTP. To test Suspicious, enter the wrong password 3 times before logging in correctly.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | None | Authenticate — returns JWT or OTP trigger |
| `POST` | `/verify-otp` | None | Verify OTP — returns JWT |
| `POST` | `/bootstrap-admin` | None | First-time admin creation |

### Admin Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register-employee` | Register a new employee |
| `GET` | `/employees` | List all employees |
| `PUT` | `/unblock/{employee_id}` | Unblock a locked account |
| `GET` | `/login-history` | All login records |
| `GET` | `/alerts` | All security alerts |
| `PUT` | `/alerts/{employee_id}/mark-read` | Mark alerts as read |
| `GET` | `/audit-logs` | Full audit trail |
| `GET` | `/dashboard` | Live dashboard stats |
| `GET` | `/risk-distribution` | Risk level breakdown |
| `GET` | `/browser-stats` | Browser usage data |
| `GET` | `/location-stats` | Top login locations |
| `GET` | `/department-stats` | Department breakdown |
| `GET` | `/daily-logins` | Daily login trend (30 days) |

### Employee Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile` | Own profile details |
| `GET` | `/my-logins` | Own login history |
| `PUT` | `/change-password` | Update own password |

---

## 🤖 ML Model

| Property | Detail |
|---|---|
| Algorithm | Random Forest Classifier |
| Estimators | 100 trees |
| Input features | 8 (browser, device, OS, location, login_hour, failed_attempts, new_device, new_location) |
| Output labels | `Normal` · `Medium` · `Suspicious` |
| Training data | `dataset/login_dataset.csv` |
| Serialisation | `joblib` `.pkl` files |

**To retrain the model** (e.g. after adding new training data):

```bash
cd backend
python model_train.py
```

> **Note:** If you upgrade scikit-learn, retrain the model. Loading a model trained on a different version may cause warnings or incorrect predictions.

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| Password storage | bcrypt hashing, never stored in plaintext |
| Session management | Signed JWT (HS256), 24-hour expiry |
| OTP security | 6-digit numeric, 5-minute expiry, single-use |
| Transport security | TLS enforced on MongoDB Atlas connection |
| CORS | Restricted to configured `ALLOWED_ORIGINS` only |
| Route protection | Role-based JWT middleware on every protected endpoint |
| Failed attempts | Account locked after 5 wrong passwords |
| Secrets management | All secrets via `.env`, never hardcoded |



---

## 🌐 Why This Project

Identity-based attacks are the **number one cause of enterprise data breaches**. Most existing systems only protect the perimeter — once credentials are stolen, attackers walk straight in. AccountGuard AI shifts security to the point of authentication itself, applying ML-based behavioural analysis on every login attempt.

The core insight is simple: **attackers have your password, but they don't have your behaviour.** A login from an unknown country at 3 AM on a new device looks very different from your usual 9 AM login from your office laptop. AccountGuard AI sees that difference and acts on it — automatically.

This project demonstrates how modern cloud-native technologies (FastAPI, MongoDB Atlas, React) combined with practical machine learning (Random Forest on behavioural signals) can produce a production-quality security system that any organisation could actually deploy.

---

<div align="center">

**Built with** FastAPI · React · MongoDB Atlas · scikit-learn · Tailwind CSS

<br/>

[![Made with Python](https://img.shields.io/badge/Made%20with-Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)

*AccountGuard AI — Enterprise Identity Security, Powered by Machine Learning*

</div>
