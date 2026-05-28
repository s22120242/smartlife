#!/bin/bash
set -e

echo "=== Aplicando migraciones ==="
npx prisma migrate deploy

echo "=== Sembrando datos (seed idempotente) ==="
npx prisma db seed

echo "=== Iniciando servidor ==="
node dist/server.js
