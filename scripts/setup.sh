#!/bin/bash
# ============================================================
# GigShield - Full Project Setup Script
# Installs all dependencies for frontend, backend, and ML
# ============================================================

set -e
echo "=========================================="
echo "  GigShield - Project Setup"
echo "=========================================="

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# --- 1. Frontend ---
echo -e "\n${BLUE}[1/4] Setting up Frontend...${NC}"
cd "$ROOT_DIR/frontend"
if command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ npm not found. Install Node.js first.${NC}"
fi

# --- 2. Backend API Gateway ---
echo -e "\n${BLUE}[2/4] Setting up Backend API Gateway...${NC}"
cd "$ROOT_DIR/backend/api-gateway"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}  Created .env from .env.example — update with your credentials${NC}"
fi
npm install
echo -e "${GREEN}✓ API Gateway dependencies installed${NC}"

# --- 3. Trigger Engine (Python) ---
echo -e "\n${BLUE}[3/4] Setting up Trigger Engine...${NC}"
cd "$ROOT_DIR/backend/trigger-engine"
if command -v pip &> /dev/null; then
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Trigger Engine dependencies installed${NC}"
elif command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
    echo -e "${GREEN}✓ Trigger Engine dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ pip not found. Install Python first.${NC}"
fi

# --- 4. Fraud Engine (Python) ---
echo -e "\n${BLUE}[4/4] Setting up Fraud Engine...${NC}"
cd "$ROOT_DIR/backend/fraud-engine"
if command -v pip &> /dev/null; then
    pip install -r requirements.txt
elif command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
fi
echo -e "${GREEN}✓ Fraud Engine dependencies installed${NC}"

# --- 5. ML Dependencies (optional) ---
echo -e "\n${BLUE}[Bonus] Installing ML dependencies...${NC}"
cd "$ROOT_DIR/ml-model"
pip install numpy pandas scikit-learn xgboost matplotlib seaborn joblib shap jupyter 2>/dev/null || \
pip3 install numpy pandas scikit-learn xgboost matplotlib seaborn joblib shap jupyter 2>/dev/null || \
echo -e "${YELLOW}⚠ Could not install ML dependencies${NC}"

# --- 6. Create ML models directory ---
mkdir -p "$ROOT_DIR/ml-model/models"

echo -e "\n${GREEN}=========================================="
echo "  Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Update backend/api-gateway/.env with your credentials"
echo "  2. Run: bash scripts/start-all.sh"
echo "  3. Or run individual services with scripts in scripts/"
