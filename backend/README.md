# Ticket Labs Backend (Auth API)

JWT-based email/password authentication backend using Express + Prisma + PostgreSQL (Neon-ready) with HTTP-only cookie sessions.

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and fill values:

- `DATABASE_URL` (Neon PostgreSQL connection string)
- `JWT_SECRET` (long random secret)
- `PORT` (default `4000`)
- `JWT_COOKIE_NAME` (default `ticketlabs_session`)
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
- `POST /api/auth/logout`
- `GET /api/auth/me` (uses JWT from HTTP-only cookie)

## Frontend integration notes

- Frontend requests must use `credentials: 'include'`.
- `CORS_ORIGIN` in backend `.env` must match your frontend dev URL.
