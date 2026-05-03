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
