#!/bin/bash
# Start GigShield API Gateway (Express.js)
# Port: 3000

cd "$(dirname "$0")/../backend/api-gateway"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example — update with your credentials"
fi

echo "Starting GigShield API Gateway on http://localhost:3000"
npm run dev
