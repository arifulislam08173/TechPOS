# TechPOS

TechPOS is a full-stack Point of Sale and Inventory Management System built for a computer and accessories retail shop. It manages products, categories, stock movements, POS sales, invoices, users, roles, permissions, and business reports from a single application.

The project was built as a practical React + ASP.NET Core application, with a strong focus on clean business workflows, backend-driven data handling, secure authorization, and a professional enterprise-style user interface.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Router
- Axios
- React Hook Form
- Lucide React
- React Hot Toast

### Backend
- C#
- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Npgsql
- JWT Authentication
- Policy-based Authorization
- OpenAPI / Swagger

## Main Features

### Authentication and Access Control
- JWT-based login
- Secure password hashing
- User profile and password change
- Active/inactive user control
- Role-based access control
- Custom roles and permission assignment
- Backend policy-based authorization for protected actions

### Product and Category Management
- Product and category CRUD
- Unique SKU validation
- Product status management
- Purchase price and selling price
- Low-stock threshold
- Dedicated create, edit, and read-only detail pages
- Backend-driven search, filtering, sorting, and pagination

### Searchable Remote Dropdowns
Large relational dropdowns do not load every record into the browser.

Examples:
- Product category selection
- Inventory product selection
- User role selection

Dropdowns use:
- Server-side search
- Pagination
- 10 records per request
- Debounced search
- Previous / Next navigation

This keeps the UI responsive even when the database contains a large number of records.

### Inventory Management
- Stock In
- Stock Out
- Stock Adjustment
- Stock movement history
- Read-only inventory transaction details
- Stock balance validation
- PostgreSQL row locking for stock consistency
- Database transactions for atomic stock updates
- Immutable inventory audit trail

Product stock cannot be manually edited from the product form. Stock changes only through audited inventory operations or completed sales.

### Point of Sale
- Backend-driven product search
- Add products to cart
- Quantity control
- Discount
- Cash, Card, and Mobile Banking payment methods
- Amount paid and change calculation
- Stock validation before checkout
- Automatic stock deduction
- Invoice generation
- Sale and SaleItem history

During checkout, the backend reads the current product price from the database rather than trusting a price sent by the frontend.

### Sales
- Sales history
- Invoice search
- Payment method filter
- Date-range filter
- Server-side pagination
- Sale detail page
- Print-friendly invoice view

Historical sale items store product name, SKU, cost, and price snapshots so previous invoices remain accurate even when product data changes later.

### Reports
- Date-range sales report
- Total sales
- Total orders
- Items sold
- Average order value
- Gross profit
- Inventory cost value
- Inventory retail value
- Sales trend
- Top-selling products
- Low-stock products
- CSV export
- PDF export

### Dashboard
- Today's sales
- Today's orders
- Items sold
- Active products
- Low-stock count
- Recent sales
- Low-stock products

## Architecture

The application follows a layered structure:

```text
React UI
   ↓
TanStack Query / Axios
   ↓
ASP.NET Core Controllers
   ↓
Services
   ↓
Entity Framework Core
   ↓
PostgreSQL
```

Backend structure:

```text
TechPOS.Api/
├── Controllers/
├── DTOs/
├── Models/
├── Data/
├── Services/
├── Interfaces/
├── Middleware/
├── Helpers/
├── Migrations/
├── Program.cs
└── appsettings.json
```

Frontend structure:

```text
src/
├── api/
├── auth/
├── components/
├── pages/
├── types/
├── App.tsx
└── main.tsx
```

## Backend-Driven Data Handling

Search, filtering, sorting, and pagination are handled by the backend instead of loading complete datasets into the frontend.

Example:

```http
GET /api/products?page=1&pageSize=10&search=logitech&categoryId=4&isActive=true
```

EF Core translates the composed LINQ query into SQL and PostgreSQL performs the filtering and pagination.

## Transaction Safety

Important business operations use database transactions.

For example, completing a POS sale performs these operations together:

```text
Create Sale
Create SaleItems
Validate Stock
Deduct Product Stock
Create StockTransactions
Generate Invoice
```

If any operation fails, the transaction is rolled back.

Product rows are also locked during stock-sensitive operations to reduce the risk of concurrent overselling.

## Security

- Passwords are stored as hashes
- JWT is used for authentication
- Sensitive configuration is not committed to Git
- Backend authorization policies enforce permissions
- Frontend permission checks are used only for the user experience
- Product prices used during checkout are read from the database
- Input validation is applied through DTOs and backend business rules

## Getting Started

### Prerequisites

Make sure the following are installed:

- .NET 10 SDK
- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd TechPOS
```

### 2. Backend setup

```bash
cd backend/TechPOS.Api
dotnet restore
```

Configure local secrets:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=techpos_db;Username=postgres;Password=YOUR_PASSWORD"
dotnet user-secrets set "Jwt:Key" "YOUR_SECURE_JWT_KEY"
dotnet user-secrets set "SeedAdmin:Email" "admin@techpos.local"
dotnet user-secrets set "SeedAdmin:Password" "YOUR_ADMIN_PASSWORD"
dotnet user-secrets set "SeedAdmin:FullName" "TechPOS Administrator"
```

Apply migrations:

```bash
dotnet ef database update
```

Run the API:

```bash
dotnet run
```

Swagger / OpenAPI:

```text
http://localhost:5259/swagger
```

The exact backend port may vary depending on your local launch settings.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5259/api
```

Run the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Demo Data

A PostgreSQL demo seed script can be used to populate historical products, inventory movements, and POS sales for report testing.

The seed data is intended for development and portfolio demonstration only.

## Suggested Portfolio Screenshots

For a concise project preview, useful screenshots include:

1. Login
2. Dashboard
3. Products list
4. Product create/edit page
5. Inventory history
6. New stock operation
7. Point of Sale
8. Sales history
9. Sale / invoice details
10. Reports with charts/metrics
11. Users
12. Roles and Permissions

## Project Purpose

TechPOS was built to demonstrate a complete React + ASP.NET Core business application rather than a simple CRUD demo.

The project focuses on:
- Full-stack API integration
- Relational database design
- Secure authentication and authorization
- Transaction-safe inventory workflows
- Backend-driven search and pagination
- POS and reporting workflows
- Professional enterprise-style UI

## Author

**Md. Ariful Islam Evan**  
Software Engineer

