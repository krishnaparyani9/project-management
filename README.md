# 🎓 Academic Project Management Platform 🚀


> A comprehensive full-stack web application designed to streamline academic project management workflows. It facilitates collaboration between students, guides, and administrators in managing project groups, tasks, progress tracking, and notifications. 📚✨

## 📖 Project Overview

The **Academic Project Management Platform** is a web-based system built to manage academic projects in educational institutions, particularly for engineering or computer science programs where students work on major projects under the guidance of faculty mentors.

### 🎯 Core Concept
The platform addresses the challenges of coordinating multiple project groups, tracking individual and team progress, and maintaining communication between students and their academic guides. It provides a centralized system where all project-related activities can be monitored and managed efficiently. 🏫🔧

### 👥 User Roles and Responsibilities

#### 👑 Administrator
- **👤 User Management**: Register and manage guides and students
- **📚 Subject Management**: Create and organize academic subjects/courses
- **👥 Group Assignment**: Assign students to project groups and guides to mentor groups
- **⚙️ System Oversight**: Monitor overall system usage and send system-wide notices
- **👨‍🏫 Guide Assignment**: Assign guides to specific subjects or projects

#### 👨‍🏫 Guide (Faculty Mentor)
- **🎓 Mentorship**: Oversee multiple project groups assigned to them
- **📝 Task Creation**: Define project milestones and assign specific tasks to groups
- **📈 Progress Review**: Monitor student progress updates and provide feedback
- **💬 Communication**: Send targeted notices to their mentored groups
- **✅ Assessment**: Track project completion and provide guidance

#### 🎓 Student
- **🔧 Project Participation**: Work within assigned project groups
- **📋 Task Management**: View assigned tasks with deadlines
- **📊 Progress Reporting**: Submit regular progress updates on tasks
- **🤝 Collaboration**: Communicate with group members and guides
- **📈 Tracking**: Monitor personal and group progress metrics

### 🔄 Key Workflows

#### 🏗️ Project Setup Phase
1. 📚 Administrator creates subjects/courses
2. 🎓 Students register and are organized by division/year
3. 👥 Administrator creates project groups and assigns students
4. 👨‍🏫 Guides are assigned to mentor specific groups
5. 📝 Guides define project tasks and milestones

#### ⚙️ Execution Phase
1. 📋 Students view their assigned tasks and deadlines
2. 🔧 Students work on tasks and submit progress updates
3. 👀 Guides review progress and provide feedback
4. 📊 System tracks completion metrics and deadlines
5. 👑 Administrators monitor overall project health

#### 📢 Communication and Notifications
- 💬 Guides can send notices to their groups
- 📣 Administrators can send system-wide announcements
- 🔔 Students receive updates on task assignments and deadlines

### 🗄️ Data Management
The platform uses MongoDB to store:
- 👤 User profiles with role-based information
- 📚 Subject and course details
- 👥 Project groups with member assignments
- 📝 Task definitions with deadlines
- 📊 Progress updates with timestamps
- 📢 Notice communications
- ⚙️ System settings and configurations

### 🔒 Security and Access Control
- 🔐 JWT-based authentication with HTTP-only cookies
- 🛡️ Role-based access control (RBAC) for different user types
- 🚫 Protected API endpoints based on user roles
- 🔑 Secure password hashing and session management

## 🌟 Features

### 🎯 User Roles and Dashboards
- **👑 Admin Dashboard**: Manage guides, students, groups, subjects, and send notices
- **👨‍🏫 Guide Dashboard**: Mentor project groups, assign tasks, review progress, and provide feedback
- **🎓 Student Dashboard**: Track assigned tasks, submit progress updates, and view project details

### ⚡ Core Functionality
- **🔐 Authentication & Authorization**: Secure login/signup with role-based access control using JWT and HTTP-only cookies
- **📊 Project Management**: Create and manage subjects, groups, and tasks
- **📈 Progress Tracking**: Real-time progress updates and history
- **📢 Notifications**: Send notices to users
- **📱 Responsive UI**: Modern dark theme with responsive design using TailwindCSS

### 🚀 Additional Features
- 🔵 Google OAuth integration for authentication
- 📧 Email notifications via Nodemailer
- ✅ Data validation with Zod
- 🛡️ TypeScript for type safety

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│  (React + Vite) │◄──►│ (Node.js + Exp) │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Components    │    │ • Routes        │    │ • Models        │
│ • Pages         │    │ • Controllers   │    │ • Schemas       │
│ • API Services  │    │ • Services      │    │ • Collections   │
│ • Context       │    │ • Middleware    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    🔄 Data Flow & API Calls
```

## 🔄 User Flow Diagram

```
🚀 START
    │
    ▼
🔐 Login Required?
    │
    ├── YES ──► 🔐 Authentication
    │           │
    │           ▼
    │       👤 User Role?
    │           │
    │           ├── 👑 ADMIN ──► 👑 Admin Dashboard
    │           │               │
    │           │               ├── 👥 Manage Users
    │           │               ├── 👥 Manage Groups
    │           │               └── 📢 Send Notices
    │           │
    │           ├── 👨‍🏫 GUIDE ──► 👨‍🏫 Guide Dashboard
    │           │               │
    │           │               ├── 📝 Create Tasks
    │           │               ├── 📈 Review Progress
    │           │               └── 👥 Mentor Groups
    │           │
    │           └── 🎓 STUDENT ──► 🎓 Student Dashboard
    │                           │
    │                           ├── 📋 View Tasks
    │                           ├── 📤 Submit Updates
    │                           └── 👥 View Group
    │
    └── NO ───► 📊 Dashboard
                │
                ▼
            🚪 Logout
                │
                ▼
            🏁 END
```

## 🛠️ Tech Stack

### 🔧 Backend
- **🟢 Node.js** with **🚂 Express.js** for server-side logic
- **🔷 TypeScript** for type safety
- **🍃 MongoDB** with **🦫 Mongoose** for database management
- **🔑 JWT** for authentication
- **🔒 bcryptjs** for password hashing
- **📧 Nodemailer** for email services
- **✅ Zod** for schema validation

### 🎨 Frontend
- **⚛️ React** with **🔷 TypeScript** for UI components
- **⚡ Vite** for fast development and building
- **🎨 TailwindCSS** for styling
- **🧭 React Router** for navigation
- **📡 Axios** for API calls
- **💡 Lucide React** for icons

## 📋 Prerequisites

- 🟢 Node.js (version 18 or higher)
- 🍃 MongoDB (local instance or MongoDB Atlas)
- 📦 npm or yarn package manager

## 🚀 Installation

1. **📥 Clone the repository:**
   ```bash
   git clone <repository-url>
   cd academic-project-management-platform
   ```

2. **📦 Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **📦 Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

## ⚙️ Environment Setup

### 🔧 Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/academic_project_manager
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Email configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 🎨 Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## ▶️ Running the Application

1. **🍃 Start MongoDB:**
   Ensure MongoDB is running locally or update `MONGODB_URI` for Atlas.

2. **🔧 Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

3. **🎨 Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

4. **🏗️ Build for production:**
   - 🔧 Backend: `npm run build` then `npm start`
   - 🎨 Frontend: `npm run build` then `npm run preview`

## 📁 Project Structure

```
academic-project-management-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # ⚙️ Database and environment configuration
│   │   ├── controllers/     # 🎮 Route handlers
│   │   ├── middleware/      # 🛡️ Authentication and error handling
│   │   ├── models/          # 📊 Mongoose schemas
│   │   ├── routes/          # 🛣️ API routes
│   │   ├── services/        # 🔧 Business logic
│   │   ├── types/           # 📝 TypeScript type definitions
│   │   └── utils/           # 🛠️ Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # 🖼️ Static assets
│   │   ├── components/      # 🧩 Reusable UI components
│   │   ├── context/         # 🔄 React context providers
│   │   ├── hooks/           # 🪝 Custom React hooks
│   │   ├── layouts/         # 📐 Layout components
│   │   ├── pages/           # 📄 Page components
│   │   ├── routes/          # 🧭 Routing configuration
│   │   ├── services/        # 🌐 API service functions
│   │   ├── types/           # 📝 TypeScript types
│   │   └── utils/           # 🛠️ Utility functions
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── postcss.config.js
└── README.md
```

## 🔗 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - 👤 User registration
- `POST /api/auth/login` - 🔑 User login
- `POST /api/auth/logout` - 🚪 User logout

### 📚 Subjects
- `GET /api/subjects` - 📖 Get all subjects
- `POST /api/subjects` - ➕ Create subject (Admin)

### 👥 Groups
- `GET /api/groups` - 👥 Get groups
- `POST /api/groups` - ➕ Create group (Admin/Guide)

### 📝 Tasks
- `GET /api/tasks` - 📋 Get tasks
- `POST /api/tasks` - ➕ Create task (Guide)

### 📊 Progress
- `GET /api/progress` - 📈 Get progress updates
- `POST /api/progress` - 📤 Submit progress update (Student)

### 📢 Notices
- `GET /api/notices` - 🔔 Get notices
- `POST /api/notices` - 📣 Send notice (Admin)

## 🔄 Project Management Workflow

```
👑 Administrator                    👨‍🏫 Guide                    🎓 Student
     │                                 │                            │
     ├── 📚 Create Subjects           ├── 📝 Create Tasks          ├── 📋 View Tasks
     │                                 │                            │
     ├── 👤 Register Users            ├── 📈 Review Progress       ├── 📤 Submit Progress
     │                                 │                            │
     ├── 👥 Create Groups             └── 📢 Send Notices          └── 🔔 View Notices
     │
     └── 👨‍🏫 Assign Guides
          │
          ▼
     ┌─────────────────────────────────────────────────────────────────┐
     │                    📊 Database Storage                          │
     │                                                                 │
     │  📚 Subjects  │  👤 Users  │  👥 Groups  │  📝 Tasks  │  📊 Progress  │
     │               │            │             │            │               │
     │  • Course     │  • Profile │  • Members │  • Deadlines│  • Updates   │
     │  • Details    │  • Roles   │  • Guide   │  • Status  │  • History    │
     └─────────────────────────────────────────────────────────────────┘
```

## 🤝 Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💡 Discussing the current state of the code
- 🆕 Submitting a fix
- 🎯 Proposing new features
- 📚 Becoming a maintainer

### 📝 Development Process
1. 🍴 Fork the repo and create your branch from `main`.
2. 🔧 If you've added code that should be tested, add tests.
3. ✅ If you've changed APIs, update the documentation.
4. 📤 Ensure the test suite passes.
5. 🔄 Make sure your code lints.
6. 📋 Issue that pull request!

### 🐛 Bug Reports
We use GitHub issues to track public bugs. Report a bug by opening a new issue; it's that easy!

### 📜 Coding Style
- 🔷 Use TypeScript for all new code
- 📏 Follow the existing code style
- 📝 Write meaningful commit messages
- 🧪 Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 📜

## 🆘 Support

Got questions? Need help? Here's how to get in touch:

- 📧 **Email**: [your-email@example.com](mailto:your-email@example.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/academic-project-management-platform/issues)
- 📖 **Documentation**: Check out our [Wiki](https://github.com/your-username/academic-project-management-platform/wiki)

---

<div align="center">

**Made with ❤️ by [Your Name]**

⭐ Star this repo if you found it helpful!

[⬆️ Back to top](#-academic-project-management-platform-)

</div>

## Installation

From project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run in Development

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Build for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## API Overview

Base URL: `/api`

### Health
- GET `/health`

### Auth
- POST `/auth/register`
- POST `/auth/login`
- GET `/auth/me`
- POST `/auth/logout`

### Student Endpoints
- GET `/groups/my`
- GET `/tasks/my`
- GET `/progress/my`

### Guide Endpoints
- GET `/groups/guide`
- GET `/tasks/guide`
- GET `/progress/guide`

## Security Notes

- Auth uses HTTP-only cookies for better client-side token safety.
- CORS is configured for your frontend origin (`CLIENT_URL`).
- Ensure `JWT_SECRET` is strong in production.
- Use HTTPS in production and set secure cookie behavior accordingly.

## Current Status

Implemented:
- Full authentication flow
- Dynamic student dashboard
- Dynamic guide dashboard
- MongoDB-backed API integration

In progress / next:
- Guide actions (assign task, update milestone)
- Student progress submission forms
- Documentation upload flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a pull request

## License

MIT
