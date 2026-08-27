#!/bin/bash
# Run this ON THE VM whenever you need to pull latest code and/or pick up a
# changed .env value (new env var, rotated secret, etc). Safe to run any time —
# if nothing changed it just rebuilds and restarts with current .env.
set -e

cd "$(dirname "$0")/.."
git pull origin main

cd backend
bash deploy.sh
