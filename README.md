# Blood Donation Management System

A comprehensive web application that connects hospitals needing blood with donors who can provide it, with an admin approval layer for safety and authenticity.

## 🎯 Project Overview

This system enables:
- **Hospitals** to create blood requests
- **Admins** to review and approve/reject requests
- **Donors** to view approved requests and accept them
- Real-time inventory management
- Role-based access control

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd blood-donation-system
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Setup Database**
```bash
# Create database
createdb blood_donation

# Run schema
cd server
psql -U postgres -d blood_donation -f reset_db.sql

# Seed demo data
node seed_demo.js
```

4. **Start the application**
```bash
# Terminal 1: Start Backend (from server folder)
cd server
node index.js

# Terminal 2: Start Frontend (from root folder)
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Test Users

After seeding the database:

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Donor    | rahul@example.com            | password123 |
| Hospital | cityhospital@example.com     | password123 |
| Admin    | admin@lifedrops.com          | admin123    |

## 📚 Documentation

All project documentation is organized in the [`docs/`](docs/) folder:

- **[Quick Start Guide](docs/QUICK_SETUP_AFTER_FIX.md)** - Detailed setup instructions
- **[Viva Presentation Guide](docs/VIVA_PRESENTATION_GUIDE.md)** - Complete guide for demo/presentation
- **[System Architecture](docs/SYSTEM_ARCHITECTURE.md)** - Architecture overview
- **[Final Project Status](docs/FINAL_PROJECT_STATUS.md)** - Current status and features
- **[Documentation Index](docs/INDEX.md)** - Complete documentation index

## 🏗️ Technology Stack

**Frontend:**
- Next.js 16 (React framework)
- TypeScript
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Node.js + Express.js
- PostgreSQL
- bcrypt (password hashing)

## ✨ Key Features

- ✅ User authentication with role-based access
- ✅ Hospital blood request creation
- ✅ Admin approval/rejection system
- ✅ Donor request acceptance
- ✅ Real-time inventory management
- ✅ Donation history tracking
- ✅ Responsive dark theme UI
- ✅ Transaction-safe database operations

## 📖 Learn More About Next.js

This project is built with Next.js. To learn more:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## 🚀 Deployment

For deployment instructions, see [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md).

The easiest way to deploy the Next.js frontend is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

This is an educational project. For questions or suggestions, please refer to the documentation in the `docs/` folder.

---

**For detailed documentation, guides, and troubleshooting, see the [`docs/`](docs/) folder.**
