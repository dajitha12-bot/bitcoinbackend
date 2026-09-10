# RingFinder – Fraud-Ring Detection in Bitcoin Networks (Backend)

The **RingFinder Backend** is a high-performance REST API built with **Python, Django REST Framework, MySQL, pandas, NetworkX, and scikit-learn**. It provides graph analytical algorithms, circular transaction path identification, machine learning fraud scoring, temporal validation without data leakage, adversarial robustness testing, and role-based user management for the RingFinder React frontend platform.

---

## 🚀 Technology Stack

- **Framework**: Python 3.10+ / Django 4.2+ / Django REST Framework (DRF)
- **Database**: MySQL (with PyMySQL / SQLite fallback mode)
- **Authentication**: JWT (`djangorestframework-simplejwt`)
- **Graph Engine**: NetworkX (`DiGraph` cycle & strongly connected component analysis)
- **Data Analytics & ML**: pandas, numpy, scikit-learn (RandomForest & custom feature extractor)
- **CORS Support**: `django-cors-headers` (`http://localhost:5173`)

---

## 📁 Directory Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── .env
├── README.md
│
├── config/                  # Global Settings, URLs, Exception Handlers, CORS, JWT
├── accounts/                # Custom User Model, Auth APIs, Roles & Analyst Approval Workflow
├── transactions/            # BitcoinTransaction Model & Management APIs
├── datasets/                # Dataset CSV Upload, Parsing & Preview Engine
├── fraud_detection/         # Core Fraud Engine, NetworkX Graph Analysis, Risk Scorer,
│   └── services/            # ring_detector, network_analyzer, temporal_validator, adversarial_detector
├── admin_panel/             # Admin Dashboard, Analysts Approval/Rejection, Activity Logs, System Settings
└── ml_engine/               # Feature engineering, Random Forest Model & Evaluation metrics
```

---

## 🔐 User Roles & Analyst Registration Flow

1. **ADMIN**: Full management access across all modules.
2. **FRAUD_ANALYST**: Standard analyst access.

### Registration & Approval Workflow
```
Analyst Registers via POST /api/auth/register/
          ↓
Status = PENDING (Login DENIED)
          ↓
Admin reviews via GET /api/admin/analysts/pending/
          ↓
Admin APPROVES via POST /api/admin/analysts/{id}/approve/
          ↓
Status = APPROVED (Login ALLOWED via POST /api/auth/login/)
```

---

## 🔑 Demo Accounts

| Role | Email | Password | Status |
|---|---|---|---|
| **Admin** | `admin@ringfinder.com` | `admin123` | `APPROVED` |
| **Fraud Analyst** | `analyst@ringfinder.com` | `analyst123` | `APPROVED` |
| **Pending Analyst** | `pending@ringfinder.com` | `analyst123` | `PENDING` |

---

## ⚙️ Quick Start & Installation

### 1. Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Database & `.env`

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

To configure MySQL, create the database:
```sql
CREATE DATABASE ringfinder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

*Note: If MySQL is not running locally, the backend automatically uses an SQLite fallback database (`db.sqlite3`).*

### 4. Run Migrations & Seed Demo Data

```bash
# Generate database schema
python manage.py makemigrations
python manage.py migrate

# Seed initial accounts, synthetic transactions, fraud rings, and benchmark results
python manage.py seed_demo_data
```

### 5. Run the Server

```bash
python manage.py runserver 8000
```

The backend API will be available at: **`http://localhost:8000/api/`**

---

## 🌐 API Reference

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` - Register new analyst (`PENDING`)
- `POST /api/auth/login/` - Login & obtain JWT tokens (Denied for `PENDING` or `REJECTED`)
- `POST /api/auth/token/refresh/` - Refresh JWT access token
- `POST /api/auth/logout/` - Blacklist refresh token
- `GET /api/auth/me/` - Current user profile

### Dataset Management (`/api/datasets/`)
- `POST /api/datasets/` - Upload CSV dataset (Admin only)
- `GET /api/datasets/` - List uploaded datasets
- `GET /api/datasets/{id}/` - Dataset detail
- `DELETE /api/datasets/{id}/` - Delete dataset (Admin only)
- `POST /api/datasets/{id}/import/` - Parse & populate `BitcoinTransaction` records
- `GET /api/datasets/{id}/preview/` - Preview first 20 rows of dataset

### Fraud Detection & Analytics (`/api/fraud/`)
- `GET /api/fraud/network/` - Network graph nodes and edges for React `NetworkGraph` component
- `POST /api/fraud/analyze/` - Run full pipeline analysis over transactions
- `GET /api/fraud/results/` - Filterable fraud prediction results
- `GET /api/fraud/wallets/` & `GET /api/fraud/wallets/{wallet_address}/` - Detailed wallet risk breakdown
- `GET /api/fraud/rings/` & `GET /api/fraud/rings/{id}/` - Detected fraud rings & circular clusters
- `GET /api/fraud/temporal/` & `POST /api/fraud/temporal/run/` - Non-leaking time-sorted train/test validation (`"temporal_leakage": false`)
- `POST /api/fraud/adversarial/run/` - Robustness testing across modified paths/amounts
- `GET /api/fraud/model-performance/` - Current ML performance metrics (precision, recall, F1, ROC-AUC)

### Admin Panel (`/api/admin/`)
- `GET /api/admin/dashboard/` - High-level system statistics summary
- `GET /api/admin/analysts/pending/` - List pending registration requests
- `POST /api/admin/analysts/{id}/approve/` - Approve analyst registration
- `POST /api/admin/analysts/{id}/reject/` - Reject analyst registration
- `GET /api/admin/analysts/` - List all analysts
- `POST /api/admin/analysts/{id}/activate/` - Activate analyst
- `POST /api/admin/analysts/{id}/deactivate/` - Deactivate analyst
- `GET /api/admin/activity-logs/` - Audit logs of admin & analyst actions
- `GET /api/admin/settings/` & `PUT /api/admin/settings/` - System configuration settings

---

## 🔌 Connecting the React Frontend

1. Ensure the backend is running at `http://localhost:8000`.
2. Ensure your React frontend is running at `http://localhost:5173`.
3. Set the frontend API base URL to `http://localhost:8000/api/`.
4. Include the JWT access token in authorization headers:
   `Authorization: Bearer <access_token>`
