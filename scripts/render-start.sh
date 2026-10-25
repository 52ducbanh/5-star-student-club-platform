#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../server"
node dist/database/migrate.js
unset MIGRATION_DATABASE_URL
exec node dist/main.js
