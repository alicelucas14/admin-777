# Deploy On AWS Lightsail (Node.js)

This app can run on a single Lightsail instance because the Express backend already serves the built frontend from `frontend/dist`.

## Runtime Shape

- Public site and admin frontend: built with Vite into `frontend/dist`
- API and uploads: served by `backend/server.js`
- Persistent content: stored in `backend/data` and `backend/uploads`

## 1. Create The Lightsail Instance

- Create an Ubuntu Lightsail instance.
- Attach a static IP.
- Open ports `22`, `80`, and `443` in the Lightsail networking tab.
- Point your domain A record to the static IP.

## 2. Install Node.js, Nginx, And PM2

```bash
sudo apt update
sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Verify:

```bash
node -v
npm -v
pm2 -v
```

## 3. Upload Or Clone The Project

```bash
cd /var/www
sudo git clone https://github.com/alicelucas14/admin-777.git stars777
sudo chown -R $USER:$USER /var/www/stars777
cd /var/www/stars777
```

If you deploy by copying files instead of Git, keep the same final folder structure.

## 4. Install Dependencies And Build The Frontend

Run this from the project root:

```bash
npm run install:all
npm run build
```

`npm run install:all` is important on a fresh Lightsail instance because this repository keeps backend and frontend dependencies in separate `package.json` files.

## 5. Set Production Environment Variables

Create a shell env file:

```bash
sudo nano /etc/stars777.env
```

Example:

```bash
NODE_ENV=production
PORT=4000
ADMIN_USERNAME=replace-this
ADMIN_PASSWORD=replace-this
ADMIN_API_TOKEN=replace-this
DATA_DIR=/var/www/stars777/backend/data
UPLOADS_DIR=/var/www/stars777/backend/uploads
CONTACT_TO_EMAIL=you@example.com
CONTACT_FROM_EMAIL=verified-sender@example.com
RESEND_API_KEY=your_resend_key
```

Load it before starting PM2:

```bash
set -a
source /etc/stars777.env
set +a
```

## 6. Start The App With PM2

From the project root:

```bash
cd /var/www/stars777
set -a
source /etc/stars777.env
set +a
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs stars777
pm2 restart stars777
```

Health check:

```bash
curl http://127.0.0.1:4000/api/health
```

## 7. Reverse Proxy With Nginx

Create an Nginx site:

```bash
sudo nano /etc/nginx/sites-available/stars777
```

Use this config:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/stars777 /etc/nginx/sites-enabled/stars777
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Add HTTPS

Install Certbot and issue the certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 9. Update The Site Later

```bash
cd /var/www/stars777
git pull origin main
npm run install:all
npm run build
set -a
source /etc/stars777.env
set +a
pm2 restart stars777
```

## Notes

- Do not leave the default admin credentials in production.
- `backend/data` and `backend/uploads` contain live content, uploads, and admin-managed settings. Back them up.
- If you ever move those folders outside the repo, keep `DATA_DIR` and `UPLOADS_DIR` pointed at the persistent location.