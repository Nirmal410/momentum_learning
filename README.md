# Momentum Learning 🚀
> A high-performance, full-stack web application designed to help learners organize study schedules, track topic & subtopic completion, log LeetCode practice submissions, view progress analytics, and manage platform users.

---

## 📌 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Quick Start Guide](#quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Project Documentation](#project-documentation)
- [Coding Standards & Best Practices](#coding-standards--best-practices)
- [License](#license)

---

## 📖 Overview
**Momentum Learning** is built to maintain consistency and track educational momentum across complex learning paths. Whether mastering Data Structures & Algorithms (DSA), Web Development, or System Design, Momentum Learning provides a centralized dashboard for:
- Structuring learning curricula into modular **Topics** and **Subtopics**.
- Logging **LeetCode** and competitive programming submissions along with code screenshots and problem notes.
- Visualizing daily consistency via an interactive **Activity Calendar** and **Streak Counter**.
- Administrative oversight with user role management, account status controls, and granular platform analytics.

---

## ✨ Key Features

### 🎯 1. Curriculum & Topic Management
- **Hierarchical Structuring**: Create learning topics with categories, target deadlines, and granular subtopics.
- **Progress Tracking**: Automatic completion calculation based on completed subtopics.
- **Notes & File Attachments**: Attach custom study notes or reference documents (PDF, DOCX, images) directly to subtopics.

### 💻 2. LeetCode & Practice Logger
- **Problem Logging**: Track problem title, platform, difficulty level (*EASY*, *MEDIUM*, *HARD*), and personal notes.
- **Media Attachments**: Upload task proof images and code screenshots for revision.
- **Streak Monitoring**: Real-time streak tracking based on daily submission consistency.

### 📊 3. Interactive Analytics & Dashboard
- **Activity Calendar**: Monthly calendar heatmap displaying practice density and completion records.
- **Recent Activity Feed**: Real-time stream of recently completed topics and logged practice problems.
- **Summary Metrics**: Quick metrics displaying total topics, completed subtopics, active streak days, and total practice problems solved.

### 🛡️ 4. Security & Administration
- **Stateless JWT Authentication**: Secure authentication mechanism using JSON Web Tokens (JWT) with HTTP Bearer authorization.
- **Role-Based Access Control (RBAC)**: Strict segregation between standard `USER` and `ADMIN` roles.
- **Admin Panel**: User status management (`ACTIVE`/`INACTIVE`), role assignment (`USER`/`ADMIN`), user account removal, and individual user analytical deep-dives.

---

## 🛠️ Technology Stack

| Layer | Technology | Version / Tooling |
|---|---|---|
| **Backend Framework** | Java / Spring Boot | Java 21, Spring Boot 4.1.0 |
| **Security & Auth** | Spring Security + JJWT | JJWT `0.12.6`, BCrypt Password Encoding |
| **Data Access Layer** | Spring Data JPA / Hibernate | MySQL 8+, HikariCP connection pool |
| **Frontend Framework** | React / Vite | React 18, Vite build tool |
| **Routing & HTTP** | React Router DOM & Axios | React Router v6, Axios with JWT interceptors |
| **UI & Styling** | Vanilla CSS & Lucide Icons | Custom CSS design system, Lucide React icons |
| **Build & Tools** | Maven & npm | Apache Maven 3.8+, Node.js 18+ |

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │      React Client      │
                                  │    (Vite SPA - 5173)   │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              │ (Bearer JWT)
                                              ▼
                                  ┌────────────────────────┐
                                  │   Spring Boot Server   │
                                  │      (Port 8080)       │
                                  └───────────┬────────────┘
                                              │
          ┌───────────────────────────────────┼───────────────────────────────────┐
          ▼                                   ▼                                   ▼
┌──────────────────┐                ┌──────────────────┐                ┌──────────────────┐
│  Auth & Security │                │  Core Services   │                │   Admin Module   │
│  - JWT Filter    │                │  - Topic Service │                │  - User Analytics│
│  - Spring Sec    │                │  - LeetCode Svc  │                │  - Status & Role │
└──────────────────┘                └─────────┬────────┘                └──────────────────┘
                                              │ JPA / Hibernate
                                              ▼
                                  ┌────────────────────────┐
                                  │      MySQL RDBMS       │
                                  │  (momentum_learning)   │
                                  └────────────────────────┘
```

---

## 📁 Project Directory Structure

```
momentumLearning/
├── backend/                        # Spring Boot Application Root
│   ├── src/main/java/com/nirmal/momentum/
│   │   ├── common/                 # API Envelopes & Shared Constants
│   │   ├── config/                 # Security, CORS, JWT Configurations
│   │   ├── controller/             # REST Endpoints (Auth, Topic, LeetCode, Dashboard, Admin)
│   │   ├── dto/                    # Data Transfer Objects & Validation Constraints
│   │   ├── entity/                 # JPA Entities (User, Topic, Subtopic, LeetcodeEntry)
│   │   ├── exception/              # Global Exception Handling & Custom Exceptions
│   │   ├── mapper/                 # Entity <-> DTO Mapping Layer
│   │   ├── repository/             # Spring Data JPA Repositories
│   │   ├── security/               # JwtAuthenticationFilter & UserDetails
│   │   ├── service/                # Business Logic Interfaces & Implementations
│   │   └── util/                   # File Validation, JWT & Security Helpers
│   ├── src/main/resources/
│   │   └── application.properties  # Database, Server & JWT Configs
│   └── pom.xml                     # Maven Dependencies & Build Definitions
├── frontend/                       # Vite React Application Root
│   ├── src/
│   │   ├── api/                    # Axios API Client Modules
│   │   ├── components/             # Reusable UI Components & Layouts
│   │   ├── context/                # AuthContext & Global Application State
│   │   ├── pages/                  # Page Components (Dashboard, LeetCode, History, Admin, Auth)
│   │   ├── router/                 # App Router & Protected Route Guards
│   │   └── styles/                 # Application CSS & Design Tokens
│   ├── package.json                # Frontend Dependencies
│   └── vite.config.js              # Vite Development & Build Config
└── docs/                           # Project Comprehensive Documentation
    ├── API-Documentation.md        # Complete REST API Specifications
    ├── Database-Schema.md          # ER Diagrams & MySQL Schema Definitions
    ├── Deployment-Guide.md         # Production Deployment & Security Configuration
    └── Architecture-and-Best-Practices.md # Maintainability & Code Quality Guide
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Java Development Kit (JDK)**: Version 21 or higher
- **Node.js**: Version 18.x or higher & `npm`
- **MySQL Database**: Version 8.0 or higher
- **Maven**: Version 3.8+ (or use included `./mvnw` wrapper)

---

### 1. Database Setup
Start your MySQL server and create the database (or let Spring Boot create it automatically):
```sql
CREATE DATABASE IF NOT EXISTS momentum_learning;
```

---

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Update database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/momentum_learning?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   app.jwt.secret=YOUR_SECURE_256_BIT_SECRET_KEY
   ```
3. Build and run the Spring Boot service:
   ```bash
   mvn clean spring-boot:run
   ```
   The backend server will launch on `http://localhost:8080`.

---

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Access the frontend interface at `http://localhost:5173`.

---

## 📚 Project Documentation

Detailed guides and technical references are maintained in the [`docs/`](file:///c:/Users/nirma/OneDrive/Documents/springboot/momentumLearning/docs) directory:

- 📑 **[API Documentation](file:///c:/Users/nirma/OneDrive/Documents/springboot/momentumLearning/docs/API-Documentation.md)**: Full REST API specs, request/response models, and status codes.
- 🗄️ **[Database Schema](file:///c:/Users/nirma/OneDrive/Documents/springboot/momentumLearning/docs/Database-Schema.md)**: Entity specifications, database table design, relationships, and index strategy.
- 🚀 **[Deployment Guide](file:///c:/Users/nirma/OneDrive/Documents/springboot/momentumLearning/docs/Deployment-Guide.md)**: Steps for deploying backend and frontend applications to production.
- 🏛️ **[Architecture & Best Practices](file:///c:/Users/nirma/OneDrive/Documents/springboot/momentumLearning/docs/Architecture-and-Best-Practices.md)**: Guidelines on writing clean, maintainable, secure, and extensible code.

---

## 🧹 Coding Standards & Best Practices

1. **Separation of Concerns**: Controllers handle HTTP requests; Service layer owns business rules; Repositories manage persistence; DTOs decouple external APIs from internal database models.
2. **Stateless Security**: Authentication is fully stateless using JWT tokens passed via standard Bearer headers.
3. **Global Exception Handling**: API errors are caught centrally with unified error response formats.
4. **Explicit Validation**: Inputs are validated at controller boundaries using `@Valid` and JSR-380 standard annotations (`@NotBlank`, `@Email`, `@Size`).
5. **Clean Frontend State**: Separation of page controllers, contextual auth state, and reusable component libraries.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
