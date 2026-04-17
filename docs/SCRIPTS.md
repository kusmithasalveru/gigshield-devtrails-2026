# GigShield - Scripts Reference

All scripts are in the `scripts/` folder with both `.sh` (Linux/Mac/Git Bash) and `.bat` (Windows) versions.

---

## Quick Reference

| Script | Command (Windows) | Command (Linux/Mac) | Purpose |
|--------|-------------------|---------------------|---------|
| Setup | `scripts\setup.bat` | `bash scripts/setup.sh` | Install all dependencies |
| Start All | `scripts\start-all.bat` | `bash scripts/start-all.sh` | Launch all 4 services |
| Train Models | `scripts\train-models.bat` | `bash scripts/train-models.sh` | Train ML models, save .pkl |
| DB Migrate | `scripts\db-migrate.bat` | `bash scripts/db-migrate.sh` | Run PostgreSQL schema |

**Individual service scripts (Linux/Mac only):**
| Script | Purpose |
|--------|---------|
| `scripts/start-frontend.sh` | Frontend only (port 5173) |
| `scripts/start-api-gateway.sh` | API Gateway only (port 3000) |
| `scripts/start-fraud-engine.sh` | Fraud Engine only (port 8000) |
| `scripts/start-trigger-engine.sh` | Trigger Engine only (Celery) |

**npm shortcuts (any platform):**
```bash
npm run setup          # Install all dependencies
npm run start          # Start all services
npm run train          # Train ML models
npm run db:migrate     # Run database migration
npm run start:frontend # Start frontend only
npm run start:api      # Start API gateway only
npm run start:fraud    # Start fraud engine only
npm run start:trigger  # Start trigger engine only
npm run install:all    # Install npm packages for frontend + API gateway
```

---

## Script Details

### setup (.sh / .bat)

**What it does:**
1. Installs frontend npm dependencies (`frontend/`)
2. Installs API gateway npm dependencies (`backend/api-gateway/`)
3. Creates `.env` from `.env.example` if not exists
4. Installs trigger engine pip dependencies (`backend/trigger-engine/`)
5. Installs fraud engine pip dependencies (`backend/fraud-engine/`)
6. Installs ML dependencies (numpy, pandas, scikit-learn, xgboost, etc.)
7. Creates `ml-model/models/` directory

**Prerequisites:** Node.js, npm, Python, pip

**Run once after cloning the repository.**

---

### start-all (.sh / .bat)

**What it does:**

*Linux/Mac (.sh):*
- Launches all 4 services as background processes in the same terminal
- Stores PIDs for cleanup
- `Ctrl+C` stops all services gracefully via trap handler

*Windows (.bat):*
- Opens each service in a **separate terminal window**
- Close individual terminal windows to stop services

**Services started:**
| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| API Gateway (Express) | 3000 | http://localhost:3000 |
| Fraud Engine (FastAPI) | 8000 | http://localhost:8000 |
| Trigger Engine (Celery) | — | Background worker |

**Prerequisites:** All dependencies installed (`setup` script), Redis running (for Trigger Engine)

---

### train-models (.sh / .bat)

**What it does:**
1. **Fraud Model:** Generates 1,500 synthetic claims → trains Isolation Forest → saves `fraud_isolation_forest.pkl` + `fraud_scaler.pkl`
2. **Pricing Model:** Generates 2,600 zone-week records → trains XGBoost → saves `pricing_xgboost.pkl` + `pricing_encoders.pkl`

**Output:** 4 files in `ml-model/models/`

**Prerequisites:** Python, scikit-learn, xgboost

**Typical runtime:** 10-30 seconds

---

### db-migrate (.sh / .bat)

**What it does:**
1. Loads `DATABASE_URL` from `backend/api-gateway/.env`
2. If not found, prompts for connection string (defaults to localhost)
3. Runs `docs/db-schema.sql` against the database using `psql`
4. Creates all tables, indexes, enums, and seed data

**Prerequisites:** PostgreSQL, `psql` CLI tool

**Alternative:** Copy-paste `docs/db-schema.sql` into Supabase SQL Editor or pgAdmin

---

## First-Time Setup Flow

```
1. Clone repo
   git clone https://github.com/kusmithasalveru/gigshield-devtrails-2026.git
   cd gigshield-devtrails-2026

2. Install dependencies
   scripts\setup.bat           (Windows)
   bash scripts/setup.sh       (Linux/Mac)

3. Configure environment
   Edit backend\api-gateway\.env with your:
   - DATABASE_URL (Supabase or local PostgreSQL)
   - JWT_SECRET (any random string)
   - Optional: Razorpay, Twilio, NewsData API keys

4. Set up database
   scripts\db-migrate.bat      (Windows)
   bash scripts/db-migrate.sh  (Linux/Mac)

5. Train ML models
   scripts\train-models.bat    (Windows)
   bash scripts/train-models.sh (Linux/Mac)

6. Start all services
   scripts\start-all.bat       (Windows)
   bash scripts/start-all.sh   (Linux/Mac)

7. Open browser
   http://localhost:5173
```
