# GigShield - Setup & Installation Guide

## Prerequisites

| Tool | Version | Required For |
|------|---------|--------------|
| Node.js | 18+ | Frontend, API Gateway |
| npm | 9+ | Package management |
| Python | 3.10+ | Trigger Engine, Fraud Engine, ML Models |
| pip | 23+ | Python package management |
| PostgreSQL | 14+ | Database (or use Supabase free tier) |
| Redis | 7+ | Job queues, caching (Trigger Engine) |
| Git | 2.30+ | Version control |

### Optional
| Tool | Purpose |
|------|---------|
| Jupyter Notebook | Running ML model notebooks interactively |
| psql CLI | Running database migrations |
| Docker | Alternative local setup |

---

## Quick Start

### Windows
```cmd
scripts\setup.bat
scripts\train-models.bat
scripts\start-all.bat
```

### Linux / Mac / Git Bash
```bash
bash scripts/setup.sh
bash scripts/train-models.sh
bash scripts/start-all.sh
```

### Using npm (any platform)
```bash
npm run setup
npm run train
npm run start
```

---

## Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/kusmithasalveru/gigshield-devtrails-2026.git
cd gigshield-devtrails-2026
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Install Backend Dependencies
```bash
cd backend/api-gateway
cp .env.example .env    # Create environment file
npm install
cd ../..
```

### 4. Install Python Dependencies
```bash
cd backend/trigger-engine
pip install -r requirements.txt
cd ../fraud-engine
pip install -r requirements.txt
cd ../..
```

### 5. Install ML Dependencies
```bash
pip install numpy pandas scikit-learn xgboost matplotlib seaborn joblib shap jupyter
```

### 6. Train ML Models
```bash
cd ml-model
mkdir -p models
# Option A: Run the training script
bash ../scripts/train-models.sh

# Option B: Run notebooks interactively
jupyter notebook
# Open fraud_model.ipynb and pricing_model.ipynb, run all cells
```

### 7. Set Up Database

#### Option A: Local PostgreSQL
```bash
createdb gigshield
psql gigshield -f docs/db-schema.sql
```

#### Option B: Supabase (Free Hosted)
1. Go to https://supabase.com and create a project
2. Open SQL Editor
3. Paste contents of `docs/db-schema.sql` and run
4. Copy the connection string to `backend/api-gateway/.env`

### 8. Configure Environment Variables
Edit `backend/api-gateway/.env`:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/gigshield
JWT_SECRET=your-secure-secret-key
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-test-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
FRAUD_ENGINE_URL=http://localhost:8000
```

### 9. Start All Services
```bash
bash scripts/start-all.sh
```

---

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React PWA |
| API Gateway | http://localhost:3000 | Express REST API |
| API Health Check | http://localhost:3000/health | Server status |
| Fraud Engine | http://localhost:8000 | FastAPI ML service |
| Fraud Engine Docs | http://localhost:8000/docs | Swagger UI |

---

## Troubleshooting

### "Module not found" errors in Python
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### PostgreSQL connection refused
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env matches your setup

### Redis connection refused (Trigger Engine)
- Install Redis: `sudo apt install redis-server` (Linux) or download from https://redis.io
- Start Redis: `redis-server`
- Or use a free Redis cloud instance (Redis Cloud, Upstash)

### Frontend build fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### ML model .pkl files not found
```bash
bash scripts/train-models.sh
# Models saved to ml-model/models/
```
