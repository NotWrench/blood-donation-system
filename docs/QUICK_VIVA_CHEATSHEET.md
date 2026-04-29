# Quick Viva Cheatsheet - Blood Donation System

## 🎯 One-Sentence Summary
"A web application that connects hospitals needing blood with donors who can provide it, with admin approval for safety."

## 🏗️ Architecture (30 seconds)
- **Frontend:** Next.js (React) - User interface
- **Backend:** Express.js (Node) - API server
- **Database:** PostgreSQL - Data storage
- **Connection:** fetch API - HTTP requests

## 👥 Three User Roles
1. **Hospital** - Creates blood requests
2. **Admin** - Approves/rejects requests
3. **Donor** - Accepts approved requests

## 🔄 Main Flow (Remember This!)
```
Hospital Creates → Admin Approves → Donor Accepts
   (pending)         (approved)       (fulfilled)
```

## 🔐 Authentication
- **Registration:** Hash password → Save to database
- **Login:** Compare password → Return user data
- **Session:** Store in localStorage
- **Security:** bcrypt hashing, role validation

## 📊 Database Tables
1. **users** - All user accounts (donor/hospital/admin)
2. **requests** - Blood requests with status
3. **inventory** - Available blood units by type

## 🔌 Key API Endpoints
```
POST /api/auth/register     → Sign up
POST /api/auth/login        → Login
POST /api/hospital/requests → Create request
PUT  /api/requests/:id      → Approve/reject
POST /api/donor/accept-request/:id → Accept
```

## ⚠️ Known Limitations (Be Honest!)
1. **No Drizzle ORM** - Uses raw SQL instead
2. **No JWT tokens** - Uses localStorage
3. **No real-time updates** - Manual refresh needed
4. **No email notifications** - Future feature

## 🎤 Demo Order
1. Show architecture diagram
2. Register as hospital
3. Create blood request (status: pending)
4. Login as admin
5. Approve request (status: approved)
6. Login as donor
7. Accept request (status: fulfilled)
8. Show updates across all roles

## 💡 If Asked About...

**Security:**
"We use bcrypt for password hashing, role-based access control, and parameterized SQL queries to prevent injection attacks."

**Scalability:**
"We could add load balancers, database replication, Redis caching, and microservices architecture."

**Why PostgreSQL:**
"Blood donation data is highly structured with clear relationships. PostgreSQL ensures data integrity through constraints."

**Why Next.js:**
"Provides server-side rendering, better SEO, built-in routing, and is industry-standard."

**Transactions:**
"We use database transactions when updating inventory to ensure both request status and inventory units change together or not at all."

## 🎯 Key Technical Skills
- Full-stack development (React + Node.js)
- RESTful API design
- Database design & SQL
- Authentication & authorization
- State management
- Responsive UI design

## 📝 Opening Statement
"Hello, I'm presenting a Blood Donation Management System that connects hospitals, donors, and admins through a secure web platform. The system ensures proper approval workflows and maintains real-time inventory tracking."

## 🎉 Closing Statement
"This project taught me full-stack development, database design, authentication, and how to build real-world applications that solve actual problems. Thank you!"

## 🚀 Before Demo Checklist
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Database seeded with test users
- [ ] Test all three user logins
- [ ] Clear browser cache
- [ ] Have architecture diagram ready

## 🆘 Emergency Answers

**"Why didn't you use [technology X]?"**
"We chose our stack based on learning goals and project requirements. [Technology X] would be a great addition for future versions."

**"This feature doesn't work!"**
"That's a known limitation. In production, we would implement [solution]. For this demo, we focused on core functionality."

**"How would you improve this?"**
"I would add: JWT authentication, real-time updates with WebSockets, email notifications, mobile app, and comprehensive testing."

---

**Remember:** Be confident, be honest, and show what you learned! 🎓
