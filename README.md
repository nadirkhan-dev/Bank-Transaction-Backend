# Bank Transaction Service

This repository contains a simple Node.js/Express backend for a fictional "Bank Transaction" system. It includes user authentication, account and ledger management, transaction processing with idempotency, and email notifications. Swagger-based API documentation is integrated to allow interactive exploration of endpoints.

---

## Features

- **User management**
  - Register new users
  - Login with JWT cookie
  - (extensions available) logout, password reset flows
- **Transactions**
  - Create transfers between accounts
  - Idempotency check to prevent duplicate processing
  - Ledger entries for debits/credits
  - Email notifications for successful/failure events
- **Swagger documentation**
  - Interactive API docs at `/api-docs` (if Swagger packages installed)
- **Email service**
  - Sends welcome email on registration
  - Transaction and failure notifications via Gmail OAuth2
- **MongoDB** via Mongoose for persistence

---

## Project Structure

```
package.json
server.js
src/
  app.js
  config/
    db.js                # mongoose connection
  controller/
    auth.controller.js   # auth handlers
    transaction.controller.js # transaction logic
  models/
    user.model.js
    account.model.js
    ledger.model.js
    transaction.model.js
  routes/
    auth.routes.js
    transaction.routes.js
  services/
    email.service.js    # nodemailer helpers
  swagger.js            # swagger setup
```

---

## Getting Started

1. **Clone the repo**
   ```bash
   git clone <repo-url> Bank-Transaction
   cd Bank-Transaction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   - Copy `.env.example` to `.env`
   - Fill in values for:
     - `PORT` / `BASE_URL`
     - `JWT_SECRET_KEY`
     - `MONGO_URI` (or `MONGO_KEY` if your config uses it)
     - Email OAuth credentials (`EMAIL_USER`, `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`)

4. **Run the server**
   ```bash
   npm run dev    # uses nodemon
   ```

5. **Visit Swagger docs**
   Open `http://localhost:3000/api-docs` to explore endpoints.

---

## Available API Endpoints

### Authentication

- `POST /api/auth/register` – create user
- `POST /api/auth/login` – authenticate

> Additional endpoints may exist depending on your code: logout, forgot/reset password.

### Transactions

- `POST /api/transactions` – create a transfer between accounts (requires body fields `fromAccount`, `toAccount`, `amount`, `idempotencyKey`)

(See Swagger for full request/response schemas.)

---

## Extending the Project

- Add more routes and controllers under `src/routes` and `src/controller`.
- Annotate new routes with Swagger JSDoc comments and they will show up in `/api-docs` automatically.
- Expand models in `src/models` as needed; use Mongoose for schema definitions and instance methods.

---

## Notes

- The transaction controller currently sends both success and failure emails for every transaction – adjust logic for your business rules.
- Ensure MongoDB is running locally or your connection string points to a cloud instance.
- Swagger dependencies must be installed (`swagger-jsdoc`, `swagger-ui-express`) or the docs route will error.

---

❤️ Built for demonstration and learning purposes.