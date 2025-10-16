# Study Group Finder & Collaboration Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Spring_Boot-3.5.6-green?style=for-the-badge&logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Java-17-red?style=for-the-badge&logo=openjdk" alt="Java">
</p>

A modern, full-stack web application that facilitates academic collaboration by connecting students in the same courses to form effective study groups. Built with React, TypeScript, Spring Boot, and MySQL.

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Problem Statement

Students often struggle to:
- Find peers in their courses for group study
- Coordinate study sessions effectively
- Share resources and communicate in real-time
- Track group activities and schedules

This platform solves these challenges by providing an integrated environment for academic collaboration.

## ✨ Features

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Secure password hashing with Spring Security
- ✅ Email-based password reset
- ✅ Session management (Remember Me functionality)

### User Profile Management
- ✅ Comprehensive profile creation with academic details
- ✅ Avatar upload capabilities via Cloudinary
- ✅ Secondary school, higher secondary, and university information
- ✅ Bio and personal information management

### Course Management
- ✅ Browse and search available courses
- ✅ Enroll/unenroll in courses
- ✅ View enrolled courses
- ✅ Track course peers

### Peer Discovery
- ✅ Find peers in same courses
- ✅ View course-specific peers
- ✅ Filter and search functionality

### Study Groups
- ✅ Create and manage study groups
- ✅ Public/private group settings
- ✅ Group member management
- ✅ Group discovery and filtering

### Communication
- 🚧 Real-time chat functionality
- 🚧 Group messaging
- 🚧 Direct messaging

### Calendar & Scheduling
- 🚧 Schedule study sessions
- 🚧 Event reminders
- 🚧 Group calendar integration

*Legend: ✅ Implemented | 🚧 Planned*

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Lucide React** - Icons

### Backend
- **Spring Boot 3.5.6** - Application framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Data persistence
- **MySQL 8** - Database
- **JWT (JSON Web Tokens)** - Token-based authentication
- **Lombok** - Boilerplate code reduction
- **SpringDoc OpenAPI** - API documentation

### Third-Party Services
- **Cloudinary** - Image storage and management
- **Gmail SMTP** - Email notifications

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 17** or higher
- **Node.js 18.x** or higher
- **npm**
- **MySQL 8.0** or higher
- **Maven 3.8** or higher
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mohammadsarfarazafzal/study-group-finder-and-collaboration-platform.git
cd study-group-finder-and-collaboration-platform
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE studygroup;
```

The application will automatically create the required tables on first run.

### 3. Backend Setup

```bash
cd backend

# Install dependencies (Maven will handle this)
mvn clean install

# Skip tests if needed
mvn clean install -DskipTests
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/studygroup?useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JWT Configuration
jwt.secret=YOUR_JWT_SECRET_KEY
jwt.expiration=86400000

# Gmail SMTP Configuration (for password reset)
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD

# Cloudinary Configuration (for avatar uploads)
cloudinary.cloud-name=YOUR_CLOUD_NAME
cloudinary.api-key=YOUR_API_KEY
cloudinary.api-secret=YOUR_API_SECRET
```

### Frontend Configuration

Edit `frontend/src/services/api.ts` if your backend runs on a different port:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Running the Application

### Start Backend Server

```bash
cd backend
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📚 API Documentation

Once the backend is running, access the Swagger UI documentation at:
```
http://localhost:8080/swagger-ui.html
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/update-password` - Update password (authenticated)

#### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/upload-avatar` - Upload avatar
- `DELETE /api/user/remove-avatar` - Remove avatar

#### Courses
- `GET /api/courses` - Get all courses (with optional search)
- `GET /api/courses/{courseId}` - Get specific course
- `GET /api/courses/my-courses` - Get enrolled courses
- `POST /api/courses/{courseId}/enroll` - Enroll in course
- `DELETE /api/courses/{courseId}/unenroll` - Unenroll from course
- `GET /api/courses/peers` - Get peers in same courses
- `GET /api/courses/{courseId}/peers` - Get peers in specific course

## 📁 Project Structure

```
study-group-finder/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/studygroup/backend/
│   │   │   │   ├── config/          # Security, JWT, CORS configs
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── repository/      # Data repositories
│   │   │   │   ├── service/         # Business logic
│   │   │   │   └── BackendApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React contexts (Auth)
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service calls
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔒 Security Features

- Password encryption using BCrypt
- JWT-based stateless authentication
- CORS configuration for frontend-backend communication
- Secure file upload validation
- Email verification for password reset


## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.


## Acknowledgments

- Spring Boot documentation
- React documentation
- Tailwind CSS
- Cloudinary
- All open-source contributors

---

<p align="center">Made with ❤️ for students</p>
