# 🧠 MEMORY.MD — Momentum Learning Permanent Knowledge Base & Architecture Brain

> **System Overview & Codebase Intelligence Document**  
> *Created for Momentum Learning codebase — Complete operational, architectural, and data flow map.*

---

## 1. 📌 Project Overview
**Momentum Learning** is a full-stack learning management and consistency tracking web application designed for students and developers. It helps users organize learning curricula into structured topics and subtopics, log daily competitive programming (e.g. LeetCode) practice entries with solution notes and code screenshots, track consistency via streaks and monthly activity heatmaps, and perform administrative user oversight and platform analytics.

- **Primary Goal**: Maintain educational momentum and consistency across Data Structures & Algorithms (DSA), Web Development, System Design, and other learning tracks.
- **Repository Architecture**: Decoupled Monorepo structure containing a Spring Boot REST API backend (`backend/`) and a React (Vite) Single Page Application frontend (`frontend/`).

---

## 2. 🎯 Project Purpose & Business Logic

### Business Problem Solved
Self-directed learning often suffers from lack of structured tracking, fragmented practice problem notes, and loss of daily study momentum. Momentum Learning solves this by providing:
1. Structured curriculum hierarchy (Topic ➔ Subtopics).
2. Centralized competitive programming log with media upload support (code screenshots & whiteboard task photos).
3. Real-time visual motivation via daily activity calendars and active streak counters.
4. Admin oversight for user account management, role elevation, and user-specific analytics.

### Target Persona & User Roles
- **`USER`**: Standard learner who logs practice, tracks progress, uploads solution notes/images, and monitors streaks.
- **`ADMIN`**: Platform administrator who views overall metrics, inspects individual user performance, updates account status (`ACTIVE`/`INACTIVE`), modifies roles (`USER`/`ADMIN`), or removes user accounts. (Note: The first user registered on a fresh database automatically receives the `ADMIN` role).

---

## 3. 🛠️ Technology Detection

| Layer | Technology / Library | Version / Details |
|---|---|---|
| **Frontend Framework** | React SPA (Vite) | React `19.2.8`, Vite `8.2.0` |
| **Frontend Router** | React Router DOM | `^7.11.0` |
| **HTTP Client** | Axios | `^1.19.0` (with Bearer Token request interceptor) |
| **Frontend UI Components** | Custom Vanilla CSS + Lucide / React Icons | `react-icons ^5.7.0`, `recharts ^3.10.1`, `react-calendar ^6.0.1` |
| **Backend Framework** | Java / Spring Boot | Java 21, Spring Boot 4.1.0 |
| **Security & Auth** | Spring Security 6 + JJWT | JJWT `0.12.6`, BCrypt Password Encoding |
| **Database & ORM** | MySQL 8.0+ / Spring Data JPA | Hibernate 6.x, HikariCP connection pool |
| **Build Systems** | Apache Maven (Backend), npm (Frontend) | Maven 3.8+ (`mvnw`), Node.js 18+ |

---

## 4. 📁 Repository Tree & Folder Responsibilities

```
momentumLearning/
├── .gemini/                          # Gemini IDE configurations
├── .vscode/                          # VS Code workspace settings
├── docs/                             # Architecture & API specifications
│   ├── API-Documentation.md          # Full REST API endpoint definitions
│   ├── Architecture-and-Best-Practices.md # Maintainability & design patterns
│   ├── Database-Schema.md            # ER Diagrams & MySQL table specs
│   ├── Deployment-Guide.md           # Production build & deployment guide
│   └── UI-Screenshots/               # Visual application previews
├── backend/                          # Spring Boot application root
│   ├── src/main/java/com/nirmal/momentum/
│   │   ├── MementumApplication.java  # Main Application Entrypoint
│   │   ├── common/                   # ApiResponse<T> envelope & Constants
│   │   ├── config/                   # SecurityConfig, CorsConfig, PasswordConfig, JwtProperties
│   │   ├── controller/               # Auth, Topic, Leetcode, Dashboard, Admin, Test Controllers
│   │   ├── dto/                      # Requests, Responses, and Admin DTO subfolder
│   │   ├── entity/                   # User, Topic, Subtopic, LeetcodeEntry JPA entities
│   │   ├── exception/                # GlobalExceptionHandler & custom exception classes
│   │   ├── mapper/                   # Entity <-> DTO converters (User, Topic, Leetcode)
│   │   ├── repository/               # UserRepository, TopicRepository, SubtopicRepository, LeetcodeEntryRepository
│   │   ├── security/                 # JwtAuthenticationFilter (OncePerRequestFilter)
│   │   ├── service/                  # Business logic interfaces (Auth, Topic, Leetcode, Dashboard, Admin)
│   │   │   └── impl/                 # Service implementations
│   │   └── util/                     # JwtUtil, SecurityUtil, FileValidator
│   ├── src/main/resources/
│   │   └── application.properties    # Database credentials, server port, JWT secret
│   ├── pom.xml                       # Maven build configuration
│   ├── mvnw / mvnw.cmd               # Maven wrappers
│   └── HELP.md                       # Spring Boot generated starter help
├── frontend/                         # React Vite application root
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── api/                      # Axios client (`api.js`) and service modules (`authService`, `topicService`, etc.)
│   │   ├── components/               # UI components grouped by feature (`admin`, `auth`, `common`, `dashboard`, `layout`, `topic`)
│   │   ├── context/                  # AuthContext, ThemeContext, AddTopicModalContext
│   │   ├── pages/                    # Auth, Dashboard, History, Leetcode, Progress, Admin pages
│   │   ├── router/                   # AppRouter.jsx, ProtectedRoute.jsx, AdminRoute.jsx
│   │   ├── styles/ & css/            # Custom CSS stylesheets
│   │   ├── App.jsx & main.jsx        # Root React entry points
│   │   └── index.html                # Entry HTML shell
│   ├── package.json                  # Frontend dependencies & scripts
│   └── vite.config.js                # Vite bundler configuration
├── README.md                         # Main repository introduction
├── TASKS.md                          # Roadmap & checklist tracking
├── CHANGELOG.md                      # Release notes & changelog
├── memory.md                         # (NEW) Complete Codebase Intelligence Memory Document
├── architecture.md                   # (NEW) Comprehensive Architectural Map
├── routes.md                         # (NEW) Routing & Endpoint Map
├── api-map.md                        # (NEW) REST API Specification & Inventory
├── database-map.md                   # (NEW) Relational Schema & Entity Map
└── dependency-graph.md               # (NEW) Critical Module & Dependency Graph
```

---

## 5. 🏛️ System Architecture

### Architectural Pattern
Decoupled Layered Architecture (Client-Server over REST):

```
+-----------------------------------------------------------------------+
|                            REACT SPA (Vite)                           |
|       [Pages] -> [Components] -> [Context/Services] -> [Axios]        |
+-----------------------------------------------------------------------+
                                    |
                         HTTP / REST API (JSON / Multipart)
                         Authorization: Bearer <JWT>
                                    v
+-----------------------------------------------------------------------+
|                         SPRING BOOT BACKEND                           |
|  [SecurityFilterChain / CorsFilter] -> [JwtAuthenticationFilter]       |
|                                   |                                   |
|                          [RestController Layer]                       |
|                                   |                                   |
|                          [Service Logic Layer]                        |
|                                   |                                   |
|                        [Spring Data JPA Repos]                        |
+-----------------------------------------------------------------------+
                                    |
                           JPA / JDBC SQL
                                    v
+-----------------------------------------------------------------------+
|                            MYSQL 8.0+ RDBMS                           |
|    Tables: users, topics, subtopics, leetcode_entries                |
+-----------------------------------------------------------------------+
```

---

## 6. 🌐 Routing Intelligence & Guards

### Frontend Routes (`frontend/src/router/AppRouter.jsx`)
- `/` ➔ `Auth.jsx` (Public Login/Signup)
- `/dashboard` ➔ `Dashboard.jsx` (Protected by `ProtectedRoute`)
- `/leetcode` ➔ `Leetcode.jsx` (Protected by `ProtectedRoute`)
- `/history` ➔ `History.jsx` (Protected by `ProtectedRoute`)
- `/progress` ➔ `Progress.jsx` (Protected by `ProtectedRoute`)
- `/admin` ➔ `Admin.jsx` (Protected by `AdminRoute`)

---

## 7. 💻 Frontend Architecture

- **State Management**:
  - `AuthContext`: Manages logged-in user state (`user`), initial token validation, and global loading state.
  - Local Component State: React `useState` for local form state, topic cards, and submission modal visibility.
  - `AddTopicModalContext`: Manages topic creation modal state across navigation headers.
- **HTTP Layer**:
  - `api.js`: Instantiates Axios with `baseURL: http://localhost:8080/api` and `withCredentials: true`. An interceptor attaches `Authorization: Bearer <token>` from `localStorage`.
- **Media Previews**:
  - Binary payloads for images/documents are fetched from backend endpoints (e.g. `/api/leetcode/{id}/code-screenshot`) or displayed via blob URLs.

---

## 8. ⚙️ Backend Architecture

- **Controller Layer**: Encapsulates REST endpoints, returning standardized `ApiResponse<T>`.
- **Service Layer**: Defines business logic contracts and implementations (`AuthServiceImpl`, `TopicServiceImpl`, `LeetcodeServiceImpl`, `DashboardServiceImpl`, `AdminServiceImpl`).
- **Data Access Layer**: `UserRepository`, `TopicRepository`, `SubtopicRepository`, `LeetcodeEntryRepository` extending `JpaRepository`.
- **Security Chain**:
  1. Requests pass through `CorsFilter` and `JwtAuthenticationFilter`.
  2. `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`, validates token signature using `JwtUtil`, extracts `userId`, and places `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`.
  3. `SecurityUtil.getCurrentUserId()` reads authentication principal across service methods.

---

## 9. 🗄️ Database Architecture

### Data Models & Relationships
1. **`User` (Table: `users`)**:
   - `id` (PK, BigInt), `name`, `email` (Unique), `password` (BCrypt), `profilePicture` (`LONGBLOB`), `role` (`USER`/`ADMIN`), `status` (`ACTIVE`/`INACTIVE`), `createdAt`.
   - Has Many `Topic` and Many `LeetcodeEntry`.
2. **`Topic` (Table: `topics`)**:
   - `id` (PK, BigInt), `user_id` (FK ➔ `users.id`), `title`, `category`, `deadline`, `createdAt`.
   - Belongs to `User`, Has Many `Subtopic` (`CASCADE DELETE`).
3. **`Subtopic` (Table: `subtopics`)**:
   - `id` (PK, BigInt), `topic_id` (FK ➔ `topics.id`), `title`, `completed` (Boolean), `completedAt`, `notes` (TEXT), `notesFile` (`LONGBLOB`), `notesFileName`, `notesFileContentType`.
4. **`LeetcodeEntry` (Table: `leetcode_entries`)**:
   - `id` (PK, BigInt), `user_id` (FK ➔ `users.id`), `problemTitle`, `platform`, `difficulty` (`EASY`/`MEDIUM`/`HARD`), `notes` (TEXT), `taskPhoto` (`LONGBLOB`), `taskPhotoContentType`, `codeScreenshot` (`LONGBLOB`), `codeScreenshotContentType`, `entryDate`, `createdAt`.

---

## 10. 🔄 Complete End-to-End Data Flow

### Example: Logging a LeetCode Practice Entry
1. **User Action**: User fills problem title, platform, difficulty, notes, entry date, attaches screenshot file on `Leetcode.jsx`, and clicks Submit.
2. **Frontend Call**: `leetcodeService.createEntry(formData)` sends `POST /api/leetcode` with `multipart/form-data` and `Authorization: Bearer <jwt>`.
3. **Security Filter**: `JwtAuthenticationFilter` intercepts request, verifies token via `JwtUtil`, sets authentication context with `userId`.
4. **Controller**: `LeetcodeController.createEntry()` receives `@RequestParam` fields and files.
5. **Service**: `LeetcodeServiceImpl.createEntry()` gets `userId` via `SecurityUtil.getCurrentUserId()`, validates image format using `FileValidator`, extracts byte array, builds `LeetcodeEntry` entity, and saves to repository.
6. **Database**: Hibernate executes `INSERT INTO leetcode_entries ...`.
7. **Response**: Service maps saved entity to `LeetcodeResponse` and returns `ApiResponse.success(...)` to frontend.
8. **UI Update**: `Leetcode.jsx` updates local entries state array and triggers streak update.

---

## 11. 🔐 Security & Auth Flow

1. **Signup**:
   - Accepts name, email, password, confirmPassword, optional profile picture image.
   - First user registered gets role `ADMIN`; subsequent users get role `USER`.
   - Password encrypted via `BCryptPasswordEncoder`.
   - Returns JWT token and User response.
2. **Login**:
   - Validates email & BCrypt password. Checks account status (`ACTIVE`).
   - Generates JWT token signed with HMAC SHA-256 secret (`app.jwt.secret`).
   - Returns JWT token and User response.
3. **Token Usage**:
   - Stored in browser `localStorage`.
   - Frontend Axios interceptor includes token in `Authorization: Bearer <token>` header.
4. **Admin Protection**:
   - Backend admin endpoints check user authority or `SecurityUtil` context.
   - Frontend `AdminRoute` component redirects non-admin users to `/dashboard`.

---

## 12. ⚡ Environment Variables & Configuration

- Backend Config (`application.properties`):
  - `server.port=8080`
  - `spring.datasource.url=jdbc:mysql://localhost:3306/momentum_learning?createDatabaseIfNotExist=true`
  - `spring.datasource.username=root`
  - `spring.datasource.password=Licet@123`
  - `app.jwt.secret=momentum-learning-super-secret-key-change-me-in-production-please-use-a-256-bit-key`
  - `app.jwt.expiration-ms=86400000` (24 hours)
  - `spring.servlet.multipart.max-file-size=20MB`
- Frontend Config (`api.js`):
  - `API_BASE_URL = "http://localhost:8080/api"`

---

## 13. 📊 Features Inventory

1. **Curriculum & Topic Tracking**: Topic creation, nested subtopics, subtopic completion toggling, note taking, and document file attachments (`PDF`, `DOCX`, images).
2. **LeetCode & Competitive Practice Logger**: Difficulty categorization (`EASY`, `MEDIUM`, `HARD`), task proof & code screenshot image attachments, entry date logging, active daily streak calculation.
3. **Analytics Dashboard**: Quick summary counters (total topics, completed subtopics, active streak, problems solved), interactive monthly activity heatmap calendar, recent activity timeline.
4. **Admin Management Module**: Overview platform statistics, user account status toggling (`ACTIVE`/`INACTIVE`), role assignment (`USER`/`ADMIN`), user account deletion, and user analytical deep-dives.

---

## 14. 🚨 Technical Debt & Known Bottlenecks

1. **In-Database Binary Storage (`LONGBLOB`)**: Media files and document attachments are stored directly in MySQL tables. While lazy loading is configured on entities, storing large blobs inside RDBMS tables can inflate database storage size. *Recommendation*: Migrate file storage to S3/Cloud Storage and store asset URLs.
2. **Spring Security Authorization Config**: `SecurityConfig` currently uses `anyRequest().permitAll()` in the filter chain, relying on `SecurityUtil.getCurrentUserId()` inside services or custom guards to enforce security. *Recommendation*: Enforce explicit method security (`@PreAuthorize("hasRole('ADMIN')")`) or update `SecurityConfig` request matchers.
3. **Hardcoded Secrets**: JWT secret key in `application.properties` should be moved to environment variables before production deployment.

---

## 15. 🚀 Development & Deployment Guide

### Running Locally
1. MySQL: Ensure MySQL is running on port 3306 with database `momentum_learning`.
2. Backend:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
   (Runs REST API on `http://localhost:8080`).
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   (Runs Vite SPA on `http://localhost:5173`).
