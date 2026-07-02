# Lunador Deployment Notes

Project path:

```bash
/var/www/lunador.ro
```

Main services:

```bash
lunador-gunicorn   # Django backend on 127.0.0.1:8010
lunador-next       # Next.js frontend on 127.0.0.1:3010
nginx              # public reverse proxy, HTTPS
postgresql         # database
```

Public routes:

```txt
https://lunador.ro/          -> Next.js
https://lunador.ro/api/      -> Django
https://lunador.ro/admin/    -> Django admin
https://lunador.ro/static/   -> Django static files
https://lunador.ro/media/    -> Django media files
```

---

## Normal deployment

From local dev machine:

```bash
git add .
git commit -m "Describe change"
git push
```

Then on VPS:

```bash
cd /var/www/lunador.ro
./deploy.sh
```

The deploy script does:

```txt
git pull
install backend requirements
create pre-migration backup
run migrations
collect static files
install frontend dependencies
build Next.js
restart Django + Next services
run health checks
```

---

## Important production env rule

Django is behind nginx. Nginx handles public HTTPS.

In:

```bash
/var/www/lunador.ro/backend/.env
```

Keep this:

```env
DJANGO_SECURE_SSL_REDIRECT=False
```

Do **not** set it to `True`, because internal server calls use plain HTTP:

```txt
Next.js -> http://127.0.0.1:8010
nginx   -> http://127.0.0.1:8010
```

If Django forces SSL internally, the site becomes slow/broken.

Keep these enabled:

```env
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_SECURE_HSTS_SECONDS=3600
DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=False
DJANGO_SECURE_HSTS_PRELOAD=False
```

---

## API URL pattern

Frontend server-side calls should use:

```env
DJANGO_INTERNAL_API_URL=http://127.0.0.1:8010
```

Browser/client-side calls should use relative URLs:

```ts
fetch("/api/...")
```

Never expose this publicly:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
```

Because in a visitor's browser, `127.0.0.1` means the visitor's own machine.

---

## Services

Check services:

```bash
sudo systemctl status lunador-gunicorn --no-pager
sudo systemctl status lunador-next --no-pager
sudo systemctl status nginx --no-pager
sudo systemctl status postgresql --no-pager
```

Restart services:

```bash
sudo systemctl restart lunador-gunicorn
sudo systemctl restart lunador-next
sudo systemctl reload nginx
```

Restart all app services:

```bash
sudo systemctl restart lunador-gunicorn
sudo systemctl restart lunador-next
```

---

## Ports

Expected internal ports:

```txt
127.0.0.1:8010   Django/Gunicorn
127.0.0.1:3010   Next.js
127.0.0.1:5432   PostgreSQL
0.0.0.0:80       nginx
0.0.0.0:443      nginx
```

Check:

```bash
sudo ss -ltnp | grep -E ':80|:443|:8010|:3010|:5432'
```

Bad:

```txt
0.0.0.0:8010
0.0.0.0:3010
0.0.0.0:5432
```

Those should not be publicly exposed.

---

## Health checks

Local backend:

```bash
curl http://127.0.0.1:8010/api/health/
```

Local frontend:

```bash
curl -I http://127.0.0.1:3010
```

Public backend:

```bash
curl https://lunador.ro/api/health/
```

Public frontend:

```bash
curl -I https://lunador.ro/
```

Timing check:

```bash
curl -sS -o /dev/null -w "local Django: code=%{http_code} time=%{time_total}s redirect=%{redirect_url}\n" http://127.0.0.1:8010/api/health/
curl -sS -o /dev/null -w "public API:   code=%{http_code} time=%{time_total}s redirect=%{redirect_url}\n" https://lunador.ro/api/health/
curl -sS -o /dev/null -w "local Next:   code=%{http_code} time=%{time_total}s\n" http://127.0.0.1:3010/
curl -sS -o /dev/null -w "public site:  code=%{http_code} time=%{time_total}s\n" https://lunador.ro/
```

---

## Logs

### Nginx Lunador logs

```bash
sudo tail -n 100 /var/log/nginx/lunador.error.log
sudo tail -n 100 /var/log/nginx/lunador.access.log
```

Live:

```bash
sudo tail -f /var/log/nginx/lunador.error.log
sudo tail -f /var/log/nginx/lunador.access.log
```

### Django/Gunicorn logs

```bash
sudo journalctl -u lunador-gunicorn -n 100 --no-pager
```

Live:

```bash
sudo journalctl -u lunador-gunicorn -f
```

### Next.js logs

```bash
sudo journalctl -u lunador-next -n 100 --no-pager
```

Live:

```bash
sudo journalctl -u lunador-next -f
```

### Deploy log

```bash
tail -n 100 /var/www/lunador.ro/logs/deploy.log
```

Live:

```bash
tail -f /var/www/lunador.ro/logs/deploy.log
```

### Backup log

```bash
tail -n 100 /var/backups/lunador/backup.log
```

Live:

```bash
tail -f /var/backups/lunador/backup.log
```

---

## 502 Bad Gateway triage

Run this when the site breaks:

```bash
echo "=== SERVICES ==="
sudo systemctl status nginx --no-pager
sudo systemctl status lunador-gunicorn --no-pager
sudo systemctl status lunador-next --no-pager

echo "=== PORTS ==="
sudo ss -ltnp | grep -E ':80|:443|:8010|:3010|:5432'

echo "=== LOCAL CHECKS ==="
curl -I http://127.0.0.1:3010
curl http://127.0.0.1:8010/api/health/

echo "=== PUBLIC CHECKS ==="
curl -I https://lunador.ro/
curl https://lunador.ro/api/health/

echo "=== NGINX ERROR LOG ==="
sudo tail -n 80 /var/log/nginx/lunador.error.log

echo "=== GUNICORN LOG ==="
sudo journalctl -u lunador-gunicorn -n 80 --no-pager

echo "=== NEXT LOG ==="
sudo journalctl -u lunador-next -n 80 --no-pager
```

Interpretation:

```txt
Local Django fails  -> problem is Django/Gunicorn/Postgres
Local Next fails    -> problem is Next.js service
Local works, public fails -> problem is nginx/SSL/proxy routing
```

---

## Backups

Manual backup:

```bash
/var/www/lunador.ro/scripts/backup.sh
```

Backup location:

```bash
/var/backups/lunador/db
/var/backups/lunador/media
```

Verify latest database backup:

```bash
LATEST_DB_BACKUP=$(ls -t /var/backups/lunador/db/lunador_db_*.dump | head -n 1)
echo "$LATEST_DB_BACKUP"
pg_restore --list "$LATEST_DB_BACKUP" | head
```

Cron:

```bash
crontab -l
```

Expected cron entry:

```cron
30 3 * * * /var/www/lunador.ro/scripts/backup.sh >> /var/backups/lunador/backup.log 2>&1
```

Restore database, dangerous, use carefully:

```bash
pg_restore \
  -h localhost \
  -U lunador \
  -d lunador \
  --clean \
  --if-exists \
  /var/backups/lunador/db/lunador_db_YYYY-MM-DD_HHMM.dump
```

Restore media:

```bash
tar -xzf /var/backups/lunador/media/lunador_media_YYYY-MM-DD_HHMM.tar.gz \
  -C /var/www/lunador.ro/backend
```

---

## Django commands

Activate backend venv:

```bash
cd /var/www/lunador.ro/backend
source venv/bin/activate
```

Run checks:

```bash
python manage.py check
python manage.py check --deploy
```

Run migrations manually:

```bash
python manage.py migrate
```

Collect static manually:

```bash
python manage.py collectstatic --noinput
```

Create superuser:

```bash
python manage.py createsuperuser
```

---

## Frontend commands

Go to frontend:

```bash
cd /var/www/lunador.ro/frontend
```

Install dependencies:

```bash
npm ci
```

Build:

```bash
npm run build
```

Manual test:

```bash
/usr/bin/node /var/www/lunador.ro/frontend/node_modules/next/dist/bin/next start -p 3010 -H 127.0.0.1
```

---

## Nginx config

Site config:

```bash
/etc/nginx/sites-available/lunador.ro
```

Test nginx:

```bash
sudo nginx -t
```

Reload nginx:

```bash
sudo systemctl reload nginx
```

---

## Firewall

Check firewall:

```bash
sudo ufw status verbose
```

For Lunador itself, only these are needed:

```txt
22/tcp
80/tcp
443/tcp
```

Other currently open ports are used by the existing avestudio.ro mail/DNS setup. Do not remove them blindly.

---

## Rule for editing files

Edit tracked app code locally, then commit/push/deploy:

```txt
backend/config/settings.py
backend/core/...
frontend/app/...
frontend/next.config.ts
```

Do not edit tracked app code directly on the VPS unless emergency.

It is okay to edit server-only files on VPS:

```txt
backend/.env
frontend/.env.production.local
/etc/nginx/sites-available/lunador.ro
/etc/systemd/system/lunador-gunicorn.service
/etc/systemd/system/lunador-next.service
deploy.sh
scripts/backup.sh
```

If git pull complains about local changes:

```bash
git status
git diff path/to/file
```

If the VPS change is disposable:

```bash
git checkout -- path/to/file
./deploy.sh
```

Optional safer copy first:

```bash
cp path/to/file /tmp/file_backup
git checkout -- path/to/file
```

---

## Current known good setup

```txt
Django/Gunicorn: 127.0.0.1:8010
Next.js:         127.0.0.1:3010
nginx:           public 80/443
Postgres:        local database lunador
Deploy:          /var/www/lunador.ro/deploy.sh
Backups:         /var/www/lunador.ro/scripts/backup.sh
```
