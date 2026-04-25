# NexusFlow AI

**The Autonomous Supply Chain Brain for SMB E-commerce**

NexusFlow AI uses agentic AI to manage the entire lifecycle of physical products — from predicting demand and negotiating with suppliers to automating customs paperwork and optimizing last-mile logistics.

## Tech Stack

- **Frontend:** Next.js 16 (React) with TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** NestJS with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT-based authentication with role-based access control (ADMIN, MANAGER, VIEWER)

## Project Structure

```
nexusflow-ai/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 3001)
├── packages/         # Shared packages
└── package.json      # Workspace root
```

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 14+

### Database Setup

```bash
# Create database and user
sudo -u postgres psql -c "CREATE USER nexusflow WITH PASSWORD 'nexusflow_dev_2024' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE nexusflow_dev OWNER nexusflow;"
```

### Installation

```bash
# Install all dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env

# Run database migrations
cd apps/api && npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Development

```bash
# Start API server (port 3001)
npm run dev:api

# Start frontend dev server (port 3000)
npm run dev:web
```

### API Endpoints

| Method | Endpoint | Description | Auth |
| ------ | --------------- | --------------- | ---- |
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | JWT |
| GET | /api/users | List org users | JWT + ADMIN/MANAGER |
| PATCH | /api/users/:id/role | Update user role | JWT + ADMIN |
| DELETE | /api/users/:id | Delete user | JWT + ADMIN |

## Development Roadmap

- [x] **Phase 1:** Project setup, database, authentication & RBAC
- [ ] **Phase 2:** Shopify data ingestion & inventory dashboard
- [ ] **Phase 3:** AI demand forecasting engine (Python/FastAPI)
- [ ] **Phase 4:** Agentic supplier negotiation (LLM integration)
- [ ] **Phase 5:** Logistics, rate shopping & final polish
