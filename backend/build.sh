#!/usr/bin/env bash
# Render build script — install deps, collect static files, run migrations.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput
python manage.py sync_macfiesta_2026_events || true
python manage.py seed_cms || true

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser --noinput || true
fi

