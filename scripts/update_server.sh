#!/usr/bin/env bash
# =============================================================================
# MacFiesta Pro — Fast Production Update Script
# Use this script to update the live server whenever you push changes to GitHub.
# Usage: sudo bash scripts/update_server.sh
# =============================================================================

set -e

INSTALL_DIR="/var/www/macfiesta"

# Detect if running inside the repository directory
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
fi

echo "============================================================"
echo " 🚀 Updating MacFiesta Pro Production Server"
echo "============================================================"

echo "[1/5] Pulling latest code from GitHub..."
git pull origin master

echo "[2/5] Updating Python backend dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt

echo "[3/5] Applying database migrations (SQLite)..."
python manage.py migrate --noinput

echo "[4/5] Collecting static files..."
python manage.py collectstatic --noinput

echo "[5/5] Building frontend production bundle..."
cd ../frontend
npm install --legacy-peer-deps
npm run build

echo "Restarting application service..."
systemctl restart macfiesta
systemctl reload nginx

echo ""
echo "============================================================"
echo " ✅ MacFiesta Pro successfully updated & running!"
echo " Service Status: $(systemctl is-active macfiesta)"
echo "============================================================"
