# MacFiesta Pro — Complete Production Deployment Guide

This guide provides end-to-end instructions to deploy **MacFiesta Pro** to any Ubuntu / Debian Linux server (AWS EC2, DigitalOcean, Hetzner, Linode, or any private VPS) with:
- **Python 3.10+ / Django 5.2 backend**
- **SQLite database (`db.sqlite3`) by default**
- **Static file collection (`collectstatic`) via WhiteNoise & Nginx**
- **React 19 + Vite frontend build**
- **Gunicorn application server managed by systemd**
- **Nginx reverse proxy with gzip and security headers**
- **Free automated SSL certificates via Let's Encrypt (Certbot)**

---

## Quick Reference: 1-Command Automated Deploy

If you have a fresh Ubuntu 22.04 / 24.04 LTS server:

```bash
# 1. Clone your repository to the server
git clone https://github.com/JoelSajanThomas/MACFIESTAPRO.git /var/www/macfiesta
cd /var/www/macfiesta

# 2. Run the automated deployment script (replace example.com with your domain or IP)
sudo bash scripts/deploy_server.sh example.com
```

The script automatically:
1. Installs Python, venv, pip, build tools, Node.js 20, and Nginx.
2. Creates the Python virtual environment and installs `requirements.txt`.
3. Sets up `.env` configured with **SQLite (`db.sqlite3`) by default**.
4. Runs database migrations (`python manage.py migrate`).
5. Collects all static files (`python manage.py collectstatic --noinput`).
6. Syncs all 23 official school and college events.
7. Installs frontend dependencies and builds the production bundle (`npm run build`).
8. Configures and starts the `macfiesta.service` systemd daemon.
9. Configures, tests, and enables the Nginx reverse proxy.

---

## Step-by-Step Manual Deployment Guide

If you prefer to configure the server step-by-step manually, follow these instructions:

### Step 1: Install Server Dependencies

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y python3 python3-pip python3-venv python3-dev build-essential \
                        libjpeg-dev zlib1g-dev nginx git curl ufw

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Clone Repository & Create Required Folders

```bash
sudo mkdir -p /var/www/macfiesta /var/log/macfiesta
sudo chown -R $USER:$USER /var/www/macfiesta
git clone https://github.com/JoelSajanThomas/MACFIESTAPRO.git /var/www/macfiesta
cd /var/www/macfiesta
```

### Step 3: Backend Setup & Requirements

```bash
cd /var/www/macfiesta/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip and install Python requirements
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### Step 4: Configure `.env` (SQLite Default)

Create `/var/www/macfiesta/backend/.env`:

```bash
cp .env.example .env
nano .env
```

Ensure the following values are set:

```ini
DEBUG=False
SECRET_KEY=generate-a-secure-random-64-character-string
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,127.0.0.1,localhost

# SQLite is used by default: leave DATABASE_URL commented out
# DATABASE_URL is NOT required when using SQLite (db.sqlite3)

CORS_ALLOW_ALL_ORIGINS=True
CSRF_TRUSTED_ORIGINS=https://your-domain.com,http://your-domain.com
FRONTEND_BASE_URL=https://your-domain.com

SERVE_MEDIA=True
SECURE_SSL_REDIRECT=False  # Set to True once SSL is installed

PAYMENT_ACCOUNT_NAME=MANAGER MAR ATHANASIOS COLLEGE FOR ADVANCED STUDIES TIRUVALLA
PAYMENT_UPI_ID=macfast12230qr@fbl
FOOD_PACKAGE_FEE=170.00
ACCOMMODATION_FEE_PER_PERSON=350.00
TRANSPORT_ASSIST_FEE=100.00
```

> **Tip to generate a strong `SECRET_KEY`**:
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(50))"
> ```

### Step 5: Database Migrations & Collect Static

```bash
# Apply database migrations to SQLite (creates backend/db.sqlite3)
python manage.py migrate --noinput

# Collect all static files (copies to backend/staticfiles)
python manage.py collectstatic --noinput

# Sync official school & college events
python manage.py sync_macfiesta_2026_events

# Create Django admin superuser
python manage.py createsuperuser
```

### Step 6: Frontend Production Build

```bash
cd /var/www/macfiesta/frontend

# Set API URL (relative '/api' works seamlessly with Nginx reverse proxy)
export VITE_API_BASE_URL="/api"

npm install --legacy-peer-deps
npm run build
```

This compiles optimized production assets into `/var/www/macfiesta/frontend/dist`.

### Step 7: Configure Gunicorn Systemd Service

Copy the provided service template:

```bash
sudo cp /var/www/macfiesta/scripts/macfiesta.service /etc/systemd/system/macfiesta.service
```

Ensure permissions are correct for `www-data`:

```bash
sudo chown -R www-data:www-data /var/www/macfiesta/backend
sudo chown -R www-data:www-data /var/log/macfiesta
sudo chmod 664 /var/www/macfiesta/backend/db.sqlite3
sudo chmod 775 /var/www/macfiesta/backend

# Enable and start the Gunicorn daemon
sudo systemctl daemon-reload
sudo systemctl enable macfiesta
sudo systemctl start macfiesta
sudo systemctl status macfiesta
```

### Step 8: Configure Nginx

Copy the provided Nginx configuration:

```bash
sudo cp /var/www/macfiesta/scripts/nginx-macfiesta.conf /etc/nginx/sites-available/macfiesta
```

Edit the domain name inside `/etc/nginx/sites-available/macfiesta`:

```bash
sudo nano /etc/nginx/sites-available/macfiesta
# Change: server_name your-domain.com www.your-domain.com;
# To: your actual domain or server IP
```

Enable the site and reload Nginx:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/macfiesta /etc/nginx/sites-enabled/macfiesta
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Install Free SSL Certificate (HTTPS)

Once your domain DNS points to your server's public IP:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will automatically configure HTTPS, redirect HTTP to HTTPS, and set up automatic renewal cron jobs.

After enabling SSL, edit `/var/www/macfiesta/backend/.env` and set:
```ini
SECURE_SSL_REDIRECT=True
```
Then restart the backend:
```bash
sudo systemctl restart macfiesta
```

---

## Updating the Server (Ongoing Maintenance)

Whenever you push new changes to GitHub, update your live server in one command:

```bash
sudo bash /var/www/macfiesta/scripts/update_server.sh
```

Or manually:

```bash
cd /var/www/macfiesta
git pull origin master

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Frontend
cd ../frontend
npm install --legacy-peer-deps
npm run build

# Restart services
sudo systemctl restart macfiesta
sudo systemctl reload nginx
```

---

## Database Backup (SQLite)

Because SQLite is a single portable file (`backend/db.sqlite3`), backups are trivial:

```bash
# Create a timestamped backup
sudo cp /var/www/macfiesta/backend/db.sqlite3 /var/backups/macfiesta_$(date +%Y%m%d_%H%M%S).sqlite3
```

To automate daily backups, add a cron job (`sudo crontab -e`):
```cron
0 3 * * * cp /var/www/macfiesta/backend/db.sqlite3 /var/backups/macfiesta_$(date +\%Y\%m\%d).sqlite3
```

---

## Troubleshooting & Useful Commands

| Task | Command |
| :--- | :--- |
| **Check Gunicorn Status** | `sudo systemctl status macfiesta` |
| **View Backend Live Logs** | `sudo journalctl -u macfiesta -f` |
| **View Gunicorn Access Log** | `tail -f /var/log/macfiesta/gunicorn-access.log` |
| **View Gunicorn Error Log** | `tail -f /var/log/macfiesta/gunicorn-error.log` |
| **Test Nginx Configuration** | `sudo nginx -t` |
| **View Nginx Error Log** | `tail -f /var/log/nginx/error.log` |
| **Restart Application Server** | `sudo systemctl restart macfiesta` |
| **Reload Nginx Web Server** | `sudo systemctl reload nginx` |
