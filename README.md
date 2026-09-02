# Expense Voucher Management System

A role-based web application for managing and approving corporate expense vouchers.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Database Setup
1. Create a PostgreSQL database named `voucher_db`
2. Duplicate `backend/.env.example` to `backend/.env` and update `DATABASE_URL` with your postgres credentials.
3. Run migrations to build the schema:
   ```bash
   cd backend
   npm run migrate up
   ```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Database Schema Explanation

The application uses a relational PostgreSQL database with two primary tables:

1. **`users` Table**
   - Handles authentication and RBAC (Role-Based Access Control).
   - Columns: `id`, `name`, `email` (unique), `password_hash`, `role`, `created_at`.
   - `role` can be one of: `employee`, `director`, `accounts`.

2. **`vouchers` Table**
   - Stores expense submissions and tracks their lifecycle.
   - Core fields: `voucher_number` (unique), `voucher_date`, `expense_date`, `department_name`, `amount`, `expense_category`.
   - Relationships: `employee_id` (Foreign Key referencing `users(id)`).
   - Signatures: `employee_signature_url`, `director_signature_url` store paths to uploaded files.
   - Lifecycle tracking: `status` (`draft` -> `submitted` -> `approved` | `rejected`), `approval_date`, `rejection_reason`.

## API Documentation

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT

### Vouchers
- `POST /api/vouchers` - Create a new voucher (draft or submit)
- `GET /api/vouchers` - Get all vouchers (Director & Accounts). Accepts query params: `status`, `department`, `category`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `search`, `sortBy`, `sortOrder`.
- `GET /api/vouchers/mine` - Get employee's own vouchers
- `GET /api/vouchers/pending` - Get submitted vouchers awaiting approval
- `GET /api/vouchers/stats` - Get aggregate statistics (scoped by role)
- `GET /api/vouchers/:id` - Get details for a specific voucher
- `PUT /api/vouchers/:id` - Update a draft voucher
- `DELETE /api/vouchers/:id` - Delete a draft voucher
- `PATCH /api/vouchers/:id/approve` - Director approval (requires signature)
- `PATCH /api/vouchers/:id/reject` - Director rejection (requires reason)

### Uploads
- `POST /api/upload/signature` - Upload image (`.jpeg`, `.png`, `.webp`) up to 2MB.

## Assumptions Made
- **Voucher Validation**: Employees must upload a signature before a voucher can move from `draft` to `submitted`.
- **Director Approval**: Directors must upload their signature to transition a voucher from `submitted` to `approved`.
- **Read-Only Accounts Role**: The "Accounts" role is strictly read-only and does not possess approval authority.
- **File Storage**: Signatures are stored locally on the server file system (`/uploads`).
- **Security**: Passwords are hashed using bcrypt. Role validation is enforced at the route level via middleware.