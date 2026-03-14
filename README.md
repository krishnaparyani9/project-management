# Academic Project Management Platform

A full-stack MERN application for managing academic project workflows between students and guides.

Students can track tasks and submit progress updates. Guides can monitor groups, review updates, and oversee delivery health.

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT (cookie-based auth)

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS

## Features

### Authentication
- Signup and login for student and guide roles
- Session management using HTTP-only cookies (no localStorage token storage)
- Protected routes and role-based access

### Student Dashboard
- Real-time stats from MongoDB
- Assigned task summary and deadlines
- Progress history and completion metrics
- Group and guide visibility

### Guide Dashboard
- Mentored groups overview
- Team/student workload visibility
- Urgent tasks and recent student update feed
- Guide-specific APIs for monitoring

### UI/UX
- Dark modern interface
- Responsive dashboard layout
- Persistent sidebar navigation

## Project Structure

```text
academic-project-management-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection

## Environment Variables

Create a `.env` file inside `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/academic_project_manager
JWT_SECRET=change_this_secret_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Optional frontend variable in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

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
