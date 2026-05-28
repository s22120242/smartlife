#!/bin/bash
set -e

echo "=== Aplicando migraciones ==="
npx prisma migrate deploy

echo "=== Verificando si hay datos ==="
HAS_DATA=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(c => { console.log(c); p.\$disconnect(); });
")

if [ "$HAS_DATA" = "0" ]; then
  echo "=== Sembrando datos iniciales ==="
  npx prisma db seed
else
  echo "=== Base con datos, omitiendo seed ==="
fi

echo "=== Iniciando servidor ==="
node dist/server.js
