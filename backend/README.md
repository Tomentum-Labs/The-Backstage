# The Backstage Backend (Auth API)

JWT-based email/password authentication backend using Express + Prisma + PostgreSQL (Neon-ready) with HTTP-only cookie sessions.

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and fill values:

- `DATABASE_URL` (Neon PostgreSQL connection string)
- `JWT_SECRET` (long random secret)
- `RESEND_API_KEY` (placeholder is fine during local setup)
- `EMAIL_FROM` (verified sender/domain in Resend for production)
- `PASSWORD_RESET_URL` (frontend reset page URL)
- `PORT` (default `4000`)
- `ACCESS_COOKIE_NAME` and `REFRESH_COOKIE_NAME` (optional cookie names)
- `CORS_ORIGIN` (default `http://localhost:5173`)

## 3) Generate Prisma client + migrate

```bash
npx prisma generate
npx prisma migrate dev --name init_auth
```

## 4) Start backend

```bash
npm run dev
```

## API endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/password/forgot`
- `POST /api/auth/password/reset`
- `POST /api/auth/logout`
- `GET /api/auth/me` (uses JWT from HTTP-only cookie)

## Frontend integration notes

- Frontend requests must use `credentials: 'include'`.
- `CORS_ORIGIN` in backend `.env` must match your frontend dev URL.
