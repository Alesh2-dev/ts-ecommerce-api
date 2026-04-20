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
git clone https://github.com/your-username/ts-ecommerce-api.git
cd ts-ecommerce-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your local MySQL credentials (see [Environment Variables](#environment-variables) below).

### 3. Set up the database

```bash
# Create tables
mysql -u root -p < src/db/schema.sql

# Seed with sample users and products
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

---

## Environment Variables

| Variable        | Description                          | Default              |
|-----------------|--------------------------------------|----------------------|
| `PORT`          | HTTP port                            | `3000`               |
| `NODE_ENV`      | `development` or `production`        | `development`        |
| `DB_HOST`       | MySQL host                           | `localhost`          |
| `DB_PORT`       | MySQL port                           | `3306`               |
| `DB_USER`       | MySQL user                           | `root`               |
| `DB_PASSWORD`   | MySQL password                       | —                    |
| `DB_NAME`       | Database name                        | `ecommerce_db`       |
| `JWT_SECRET`    | Secret for signing JWTs              | *(required in prod)* |
| `JWT_EXPIRES_IN`| JWT expiry duration                  | `7d`                 |

---

## API Reference

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Errors return `success: false` with an `error` string and appropriate HTTP status code.

---

### `GET /health`

Returns server and database status.

```bash
curl http://localhost:3000/health
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": "42s",
    "services": {
      "database": "connected"
    }
  }
}
```

---

### `POST /auth/login`

Authenticates a user and returns a JWT.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

**Seeded credentials:**

| Email                  | Password   | Role       |
|------------------------|------------|------------|
| `admin@example.com`    | `admin123` | `admin`    |
| `jane@example.com`     | `user123`  | `customer` |

**Error `401`** — wrong credentials  
**Error `422`** — validation failed (invalid email format, password too short)

---

### `GET /products`

Returns a paginated list of products. Supports optional filters.

```bash
# All products
curl http://localhost:3000/products

# Filter by category
curl "http://localhost:3000/products?category=Electronics"

# Price range + pagination
curl "http://localhost:3000/products?minPrice=40&maxPrice=100&limit=5&offset=0"
```

**Query params:**

| Param       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| `category`  | string  | Filter by category name              |
| `minPrice`  | number  | Minimum price (inclusive)            |
| `maxPrice`  | number  | Maximum price (inclusive)            |
| `limit`     | number  | Results per page (default: 20, max: 100) |
| `offset`    | number  | Pagination offset (default: 0)       |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Wireless Headphones",
        "description": "Over-ear noise-cancelling headphones with 30hr battery",
        "price": "79.99",
        "stock": 50,
        "category": "Electronics",
        "created_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### `GET /products/:id`

Returns a single product by ID.

```bash
curl http://localhost:3000/products/1
```

**Response `200`** — product object  
**Error `404`** — product not found  
**Error `400`** — invalid ID format

---

## npm Scripts

| Script          | Description                                 |
|-----------------|---------------------------------------------|
| `npm run dev`   | Start dev server with hot-reload (nodemon)  |
| `npm run build` | Compile TypeScript to `dist/`               |
| `npm start`     | Run compiled production build               |
| `npm run db:seed` | Seed the database with sample data        |

---

## Design Decisions

- **No ORM** — raw `mysql2` queries keep the code transparent and fast. Easy to swap for Prisma/TypeORM later.
- **Service layer** — controllers are thin; all business logic lives in services.
- **AppError class** — typed errors flow cleanly from service → controller → global handler without try/catch repetition at the route level.
- **Timing-safe login** — bcrypt runs even when a user isn't found, preventing user enumeration via response timing.
- **Consistent response envelope** — `ApiResponse<T>` type ensures every endpoint returns the same shape.

---
## Example Query Optimization

### Product listing query

Before:
- Full table scan on products
- Slower response with larger dataset

After:
- Added index on (category, price)
- Reduced query time significantly (~40% improvement locally)

```sql
CREATE INDEX idx_products_category_price ON products(category, price);

## License

MIT