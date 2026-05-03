# Full-Stack Website (React + Express)

## Run Everything

From the workspace root:

```bash
npm install
npm run dev
```

This starts:
- Frontend: http://127.0.0.1:5173
- Admin Panel: http://127.0.0.1:5173/admin
- Backend: http://localhost:4000

Public frontend does not show any admin link. Open `/admin` directly for admin access.

## Run Individually

```bash
npm run dev:frontend
npm run dev:backend
```

Or, if you prefer the production-style backend process in a separate terminal:

```bash
npm run start:backend
npm run start:frontend
```

Recommended local workflow:

- Terminal 1: `npm run start:backend`
- Terminal 2: `npm run start:frontend`

The frontend dev server is pinned to `127.0.0.1:5173` and proxies API calls to `127.0.0.1:4000`.
If port `5173` is already in use, Vite now fails clearly instead of silently moving to another port.

## Build Frontend

```bash
npm run build
```

## Deploy Publicly

The simplest production setup for this project is one Node service:

- Render builds the frontend with `npm run build`
- Express serves the built frontend and the API from the same service
- A persistent disk stores runtime data and uploaded blog images

This repo now includes [render.yaml](render.yaml) for that setup.

### Render Deployment

1. Push your latest changes to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select this GitHub repository.
4. Render will detect `render.yaml` and create the web service plus persistent disk.
5. Use a Render plan that supports persistent disks. The included blueprint is set to `starter` because the app stores uploads and runtime data.
6. Set these required environment variables before the first production login:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_API_TOKEN`

Optional email variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

After deploy, your site will be live on the Render URL and accessible from any device.

### Important Production Note

Admin-edited settings, visitor logs, contact submissions, and uploaded blog images are runtime data. They are not intended to live in Git. In hosted environments they should be stored on the mounted disk configured through:

- `DATA_DIR`
- `UPLOADS_DIR`

## Backend API Endpoints

- GET `/api/health`
- POST `/api/contact`
- POST `/api/admin/login`
- GET `/api/admin/dashboard`
- GET `/api/admin/games`
- GET `/api/admin/posts-blogs`
- GET `/api/admin/promotion`
- GET `/api/admin/reviews`
- GET `/api/admin/global-settings`

## Admin Login

Default credentials (change via env vars):

- Username: `admin`
- Password: `admin123`

Optional backend env vars:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_API_TOKEN`
- `RESEND_API_KEY` for contact form email notifications
- `CONTACT_TO_EMAIL` for the inbox that receives contact messages
- `CONTACT_FROM_EMAIL` for the verified sender address used by Resend

Contact form submissions are always saved in `backend/data/contact-submissions.json`.
Email notifications are sent when `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are configured.

Visitor and admin login activity is stored in `backend/data/visitors.json` and `backend/data/admin-logins.json`.

## Frontend API Config

Optional frontend env file:

- Copy `frontend/.env.example` to `frontend/.env`
- Set `VITE_API_BASE_URL` if your backend URL changes.
