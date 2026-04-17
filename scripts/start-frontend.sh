#!/bin/bash
# Start GigShield Frontend (React PWA)
# Port: 5173

cd "$(dirname "$0")/../frontend"
echo "Starting GigShield Frontend on http://localhost:5173"
npm run dev
