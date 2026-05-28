#!/bin/bash
set -e

echo "=== Build Frontend ==="
cd frontend
npm install --include=dev
npm run build
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

echo "=== Build Backend ==="
cd ../backend
npm install --include=dev
npm run build

echo "=== Build completo ==="
