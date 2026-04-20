# ts-ecommerce-api

A minimal but production-style REST API built with **Node.js**, **TypeScript**, **Express**, and **MySQL**.

Built as a portfolio project demonstrating clean backend architecture: typed service layers, JWT auth, proper error handling, and a real database — without unnecessary complexity.

---

## Tech Stack

| Layer       | Choice                                        |
|-------------|-----------------------------------------------|
| Runtime     | Node.js 18+                                   |
| Language    | TypeScript 5                                  |
| Framework   | Express 4                                     |
| Database    | MySQL 8 via `mysql2` (connection pool)        |
| Auth        | JWT (`jsonwebtoken`) + `bcryptjs`             |
| Validation  | `express-validator`                           |

---

## Project Structure

```
src/
├── config/
│   └── env.ts               # Centralized env config with type safety
├── types/
│   └── index.ts             # Domain models + DTOs + Express extensions
├── db/
│   ├── connection.ts        # mysql2 connection pool
│   ├── schema.sql           # Table definitions
│   └── seed.ts              # Seed script (npm run db:seed)
├── middleware/
│   ├── errorHandler.ts      # AppError class + global error + 404 handler
│   ├── auth.ts              # JWT authenticate + requireAdmin guards
│   └── validate.ts          # express-validator wrapper
├── services/
│   ├── auth.service.ts      # Login logic (timing-safe, bcrypt)
│   └── product.service.ts   # Product queries with pagination + filters
├── controllers/
│   ├── health.controller.ts
│   ├── auth.controller.ts
│   └── product.controller.ts
├── routes/
│   ├── health.routes.ts
│   ├── auth.routes.ts
│   └── product.routes.ts
├── app.ts                   # Express app setup
└── index.ts                 # Server entrypoint
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (recommended) — or a local MySQL 8 instance

### ⚡ Quickstart (Docker — copy-paste ready)

```bash
git clone https://t.co/MLxLJubBM2
cd ts-ecommerce-api
cp .env.example .env        # uses defaults that match docker-compose.yml
docker compose up -d        # starts MySQL in the background
npm install
npm run db:seed             # creates tables + seeds users/products
npm run dev
```

Server runs at: `http://localhost:3000`

> **No local MySQL needed.** The `docker-compose.yml` spins up a MySQL 8 container pre-configured to match the default `.env.example` values — no edits required to get running.

---

### Manual Setup (local MySQL)

If you prefer a local MySQL instance instead of Docker:

**1. Clone & install**

```bash
git clone https://t.co/MLxLJubBM2
cd ts-ecommerce-api
npm install
```

**2. Configure environment**

```bash
cp .env.example .env
```

Edit `.env` with your local MySQL credentials (see [Environment Variables](#environment-variables) below).

**3. Set up the database**

```bash
npm run db:seed
```

**4. Run the project**

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## Environment Variables

| Variable       | Description          | Default        |
|----------------|----------------------|----------------|
| `PORT`         | HTTP port            | `3000`         |
| `NODE_ENV`     | Environment          | `development`  |
| `DB_HOST`      | MySQL host           | `localhost`    |
| `DB_PORT`      | MySQL port           | `3306`         |
| `DB_USER`      | MySQL user           | `root`         |
| `DB_PASSWORD`  | MySQL password       | —              |
| `DB_NAME`      | Database name        | `ecommerce_db` |
| `JWT_SECRET`   | JWT signing secret   | required       |
| `JWT_EXPIRES_IN` | Token expiry       | `7d`           |

---

## API Reference

All responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

Errors:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description"
}
```

---

## Endpoints

### `GET /health`

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "services": {
      "database": "connected"
    }
  }
}
```

### `POST /auth/login`

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### `GET /products`

```bash
curl http://localhost:3000/products
```

With auth:

```bash
curl http://localhost:3000/products \
  -H "Authorization: Bearer <token>"
```

---

## Seeded Users

| Email                 | Password  | Role       |
|-----------------------|-----------|------------|
| admin@example.com     | admin123  | admin      |
| jane@example.com      | user123   | customer   |

---

## Design Decisions

- **No ORM** — raw `mysql2` queries for full control and performance
- **Service layer architecture** for clean separation of concerns
- **Centralized error handling** via `AppError` middleware
- **Timing-safe authentication** using bcrypt
- **Consistent API response structure** across all endpoints

---

## Example Query Optimization

Product listing optimization:

**Before:** Full table scan

**After:** Indexed query on `category + price`

```sql
CREATE INDEX idx_products_category_price ON products(category, price);
```

---

## Authentication

- JWT-based stateless authentication
- Tokens passed via `Authorization: Bearer <token>`
- No refresh tokens (kept simple for portfolio)

### Making a protected request

**Step 1 — log in and capture your token:**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.data.token')
```

**Step 2 — call an admin-only route:**

```bash
curl http://localhost:3000/admin/products \
  -H "Authorization: Bearer $TOKEN"
```

Without a valid token you get:

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "No token provided"
}
```

> `jq` is optional — you can paste the token from the login response manually if preferred.

---

## Error Handling

| Code               | Meaning               |
|--------------------|-----------------------|
| `VALIDATION_ERROR` | Invalid input         |
| `UNAUTHORIZED`     | Missing/invalid JWT   |
| `NOT_FOUND`        | Resource missing      |
| `INTERNAL_ERROR`   | Server failure        |

---

## Production Notes

- JWT expiry: 7 days (demo setup)
- Password hashing: bcrypt (10 rounds)
- No refresh tokens (simplified)
- Production upgrade: add refresh rotation + rate limiting

---

## License

MIT
