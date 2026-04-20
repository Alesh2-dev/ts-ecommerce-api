# ts-ecommerce-api

A minimal but production-style REST API built with **Node.js**, **TypeScript**, **Express**, and **MySQL**.

Built as a portfolio project demonstrating clean backend architecture: typed service layers, JWT auth, proper error handling, and a real database — without unnecessary complexity.

---

## Tech Stack

| Layer       | Choice                              |
|-------------|-------------------------------------|
| Runtime     | Node.js 18+                         |
| Language    | TypeScript 5                        |
| Framework   | Express 4                           |
| Database    | MySQL 8 via `mysql2` (connection pool) |
| Auth        | JWT (`jsonwebtoken`) + `bcryptjs`   |
| Validation  | `express-validator`                 |

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
- MySQL 8 running locally (or via Docker)

### 1. Clone & install

```bash
git clone https://github.com/Alesh2-dev/ts-ecommerce-api.git
cd ts-ecommerce-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your local MySQL credentials (see [Environment Variables](#environment-variables) below).

### 3. Set up the database

Start database (Docker)
docker compose up -d
4. Setup database
npm run db:seed
5. Run the project
npm run dev

Server runs at:

http://localhost:3000
Environment Variables
Variable	Description	Default
PORT	HTTP port	3000
NODE_ENV	Environment	development
DB_HOST	MySQL host	localhost
DB_PORT	MySQL port	3306
DB_USER	MySQL user	root
DB_PASSWORD	MySQL password	—
DB_NAME	Database name	ecommerce_db
JWT_SECRET	JWT signing secret	required
JWT_EXPIRES_IN	Token expiry	7d
API Reference

All responses follow a consistent format:

{
  "success": true,
  "data": {},
  "message": "optional"
}

Errors:

{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description"
}
Endpoints
GET /health
curl http://localhost:3000/health

Response:

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
POST /auth/login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

Response:

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
GET /products
curl http://localhost:3000/products

With auth:

curl http://localhost:3000/products \
  -H "Authorization: Bearer <token>"
Seeded Users
Email	Password	Role
admin@example.com
	admin123	admin
jane@example.com
	user123	customer
Design Decisions
No ORM — raw mysql2 queries for full control and performance
Service layer architecture for clean separation of concerns
Centralized error handling via AppError middleware
Timing-safe authentication using bcrypt
Consistent API response structure across all endpoints
Example Query Optimization
Product listing optimization

Before:

Full table scan

After:

Indexed query on category + price
CREATE INDEX idx_products_category_price ON products(category, price);
Authentication
JWT-based stateless authentication
Tokens passed via Authorization: Bearer <token>
No refresh tokens (kept simple for portfolio)
Error Handling
Code	Meaning
VALIDATION_ERROR	Invalid input
UNAUTHORIZED	Missing/invalid JWT
NOT_FOUND	Resource missing
INTERNAL_ERROR	Server failure
Production Notes
JWT expiry: 7 days (demo setup)
Password hashing: bcrypt (10 rounds)
No refresh tokens (simplified)
Production upgrade: add refresh rotation + rate limiting
Quickstart (Docker)
docker compose up -d
npm install
cp .env.example .env
npm run db:seed
npm run dev
License

MIT


---

# 🚀 What you do NOW

Run:

```bash
git add .
git commit -m "feat: finalize production-ready README + docker setup"
git push origin main