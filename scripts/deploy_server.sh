#!/usr/bin/env bash
# =============================================================================
# MacFiesta Pro — Complete Automated Production Deployment Script
# Target OS: Ubuntu 22.04 / 24.04 LTS or Debian 11 / 12
# Database: SQLite3 by default (db.sqlite3)
# Usage: sudo bash scripts/deploy_server.sh [your-domain.com]
# =============================================================================

set -e

DOMAIN="${1:-_}"
INSTALL_DIR="/var/www/macfiesta"
LOG_DIR="/var/log/macfiesta"

echo "============================================================"
echo " Starting MacFiesta Pro Production Deployment"
echo " Domain: $DOMAIN"
echo " Install directory: $INSTALL_DIR"
echo " Database: SQLite3 (Default)"
echo "============================================================"

# 1. System Packages & Dependencies
echo "[1/8] Updating system packages & installing core dependencies..."
apt-get update -y
apt-get install -y python3 python3-pip python3-venv python3-dev build-essential \
                   libjpeg-dev zlib1g-dev nginx git curl ufw

# Install Node.js 20 LTS if not present
if ! command -v node >/dev/null 2>&1; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "Python version: $(python3 --version)"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# 2. Directory & Permissions Setup
echo "[2/8] Setting up application directories..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$LOG_DIR"

# If script is run from a cloned repository, copy files into /var/www/macfiesta if not already there
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ "$CURRENT_DIR" != "$INSTALL_DIR" ]; then
    echo "Copying application files from $CURRENT_DIR to $INSTALL_DIR..."
    rsync -av --exclude="venv" --exclude="node_modules" --exclude="dist" --exclude=".git" "$CURRENT_DIR/" "$INSTALL_DIR/"
fi

# Create media and static directories
mkdir -p "$INSTALL_DIR/backend/media"
mkdir -p "$INSTALL_DIR/backend/staticfiles"

# 3. Backend Setup & Virtual Environment
echo "[3/8] Setting up Python virtual environment & installing requirements..."
cd "$INSTALL_DIR/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# 4. Environment Configuration (SQLite by default)
echo "[4/8] Configuring backend environment..."
if [ ! -f ".env" ]; then
    echo "Creating backend .env with secure random SECRET_KEY and SQLite default..."
    RANDOM_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
    
    cat <<EOF > .env
# MacFiesta Pro Production Configuration
DEBUG=False
SECRET_KEY=$RANDOM_SECRET
ALLOWED_HOSTS=$DOMAIN,localhost,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=True
CSRF_TRUSTED_ORIGINS=http://$DOMAIN,https://$DOMAIN,http://localhost:5173,http://127.0.0.1:8000
FRONTEND_BASE_URL=http://$DOMAIN

# DATABASE: SQLite is used by default when DATABASE_URL is not set
# DATABASES engine: django.db.backends.sqlite3 (stored at backend/db.sqlite3)

# Static and media settings
SERVE_MEDIA=True
SECURE_SSL_REDIRECT=False

# Fest payments & fees
PAYMENT_ACCOUNT_NAME=MANAGER MAR ATHANASIOS COLLEGE FOR ADVANCED STUDIES TIRUVALLA
PAYMENT_UPI_ID=macfast12230qr@fbl
HOSTEL_PAYMENT_ACCOUNT_NAME=ST ALPHONSA HOSTEL
HOSTEL_PAYMENT_UPI_ID=stalphonsahostel@iob
FOOD_PACKAGE_FEE=170.00
ACCOMMODATION_FEE_PER_PERSON=350.00
TRANSPORT_ASSIST_FEE=100.00
EOF
fi

# 5. Database Migrations, Event Seed & Collectstatic
echo "[5/8] Running database migrations (SQLite)..."
python manage.py migrate --noinput

echo "Running collectstatic to gather all Django static files..."
python manage.py collectstatic --noinput

echo "Syncing all 23 official school & college events in database..."
python manage.py sync_macfiesta_2026_events || true

# 6. Frontend Build
echo "[6/8] Building frontend production bundle..."
cd "$INSTALL_DIR/frontend"

# Build frontend with relative or domain API URL
if [ "$DOMAIN" != "_" ]; then
    export VITE_API_BASE_URL="http://$DOMAIN/api"
else
    export VITE_API_BASE_URL="/api"
fi

npm install --legacy-peer-deps
npm run build

# 7. Systemd Gunicorn Service Setup
echo "[7/8] Configuring Systemd service (macfiesta.service)..."
cat <<EOF > /etc/systemd/system/macfiesta.service
[Unit]
Description=MacFiesta Pro Gunicorn Daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=$INSTALL_DIR/backend
EnvironmentFile=$INSTALL_DIR/backend/.env
ExecStart=$INSTALL_DIR/backend/venv/bin/gunicorn \\
          --workers 3 \\
          --bind 127.0.0.1:8000 \\
          --timeout 120 \\
          --access-logfile $LOG_DIR/gunicorn-access.log \\
          --error-logfile $LOG_DIR/gunicorn-error.log \\
          config.wsgi:application

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Set proper ownership for www-data
chown -R www-data:www-data "$INSTALL_DIR/backend"
chown -R www-data:www-data "$LOG_DIR"
chmod 664 "$INSTALL_DIR/backend/db.sqlite3" || true
chmod 775 "$INSTALL_DIR/backend"

systemctl daemon-reload
systemctl enable macfiesta
systemctl restart macfiesta

# 8. Nginx Configuration
echo "[8/8] Configuring Nginx reverse proxy..."
cat <<EOF > /etc/nginx/sites-available/macfiesta
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/json application/javascript image/svg+xml;

    # Frontend SPA
    root $INSTALL_DIR/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }

    # Django Static Files
    location /static/ {
        alias $INSTALL_DIR/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    # Media Files (User Uploads)
    location /media/ {
        alias $INSTALL_DIR/backend/media/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
    }

    # Django Admin Proxy
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
    }

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site in Nginx
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/macfiesta /etc/nginx/sites-enabled/macfiesta

# Test and reload Nginx
nginx -t
systemctl reload nginx

echo ""
echo "============================================================"
echo " 🎉 MacFiesta Pro has been successfully deployed!"
echo "============================================================"
echo " - Web Application: http://$DOMAIN"
echo " - API Base: http://$DOMAIN/api/"
echo " - Django Admin: http://$DOMAIN/admin/"
echo " - Database: $INSTALL_DIR/backend/db.sqlite3"
echo " - Static Directory: $INSTALL_DIR/backend/staticfiles"
echo ""
echo "To create a Django superuser:"
echo "   cd $INSTALL_DIR/backend && source venv/bin/activate && python manage.py createsuperuser"
echo ""
echo "To enable Free SSL / HTTPS (Let's Encrypt):"
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN"
echo "============================================================"
