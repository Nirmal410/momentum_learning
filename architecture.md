# 🏛️ ARCHITECTURE.MD — System Architecture & Design Specifications

> **Momentum Learning Architectural Overview**  
> *Detailed technical reference documenting design patterns, structural topology, security architecture, and data persistence models.*

---

## 1. 🏗️ High-Level System Architecture

Momentum Learning follows a decoupled, client-server SPA architecture.

```
+-------------------------------------------------------------------------------+
|                               FRONTEND CLIENT                                 |
|                                                                               |
|  +---------------------+   +---------------------+   +---------------------+  |
|  |  React Router DOM   |   |   AuthContext /     |   |   Axios Interceptor |  |
|  |  (SPA Navigation)   |   |   ThemeContext      |   |   (Bearer JWT Header)|  |
|  +----------+----------+   +----------+----------+   +----------+----------+  |
|             |                         |                         |             |
|             +-------------------------+-------------------------+             |
+---------------------------------------|---------------------------------------+
                                        | HTTP / JSON / Multipart
                                        v (Port 8080)
+-------------------------------------------------------------------------------+
|                               BACKEND SERVER                                  |
|                             (Spring Boot 4.1.0)                               |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                    SecurityFilterChain / CorsFilter                     |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|                                       v                                       |
|  +-------------------------------------------------------------------------+  |
|  |                    JwtAuthenticationFilter                              |  |
|  |                    (Extracts & Validates Bearer Token)                  |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|                                       v                                       |
|  +-------------------------------------------------------------------------+  |
|  |                            Controller Layer                             |  |
|  |  (AuthController, TopicController, LeetcodeController, AdminController) |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|                                       v                                       |
|  +-------------------------------------------------------------------------+  |
|  |                             Service Layer                               |  |
|  |  (AuthService, TopicService, LeetcodeService, DashboardService, Admin)  |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|                                       v                                       |
|  +-------------------------------------------------------------------------+  |
|  |                          Data Access (JPA)                              |  |
|  |  (UserRepository, TopicRepository, SubtopicRepository, LeetcodeRepo)    |  |
|  +------------------------------------+------------------------------------+  |
+---------------------------------------|---------------------------------------+
                                        | JPA / Hibernate SQL Queries
                                        v
+-------------------------------------------------------------------------------+
|                            DATABASE LAYER (MySQL 8)                           |
|       Tables: users, topics, subtopics, leetcode_entries                      |
+-------------------------------------------------------------------------------+
```

---

## 2. 🛡️ Security Architecture & Authentication Lifecycle

```
[ Client Login ] ---> POST /api/auth/login ---> AuthController
                                                     |
                                                     v
                                              AuthServiceImpl
                                                     |
                                                     +---> Validate Password (BCrypt)
                                                     +---> Check User Status (ACTIVE)
                                                     +---> Generate Token (JwtUtil)
                                                     |
[ JWT Token Returned ] <-----------------------------+

[ Subsequent Request ] ---> Header: Bearer <token>
                                   |
                                   v
                        JwtAuthenticationFilter
                                   |
                         Validate JWT Signature
                                   |
                        Extract User ID & Set
                      SecurityContextHolder Principal
                                   |
                                   v
                         Service Implementation
                        (Reads User ID via SecurityUtil)
```

---

## 3. 💾 Data Persistence Model & Entity Hierarchy

```
+-------------------+             1:N             +-------------------+
|       User        | --------------------------> |       Topic       |
| ----------------- |                             | ----------------- |
| id (PK)           |                             | id (PK)           |
| email (Unique)    |                             | user_id (FK)      |
| password (BCrypt) |                             | title             |
| role (USER/ADMIN) |                             | category          |
| status            |                             | deadline          |
+-------------------+                             +---------+---------+
          |                                                 |
          | 1:N                                             | 1:N
          v                                                 v
+-------------------+                             +-------------------+
|   LeetcodeEntry   |                             |     Subtopic      |
| ----------------- |                             | ----------------- |
| id (PK)           |                             | id (PK)           |
| user_id (FK)      |                             | topic_id (FK)     |
| problemTitle      |                             | title             |
| difficulty        |                             | completed         |
| entryDate         |                             | completedAt       |
| taskPhoto (BLOB)  |                             | notes (TEXT)      |
| codeScreenshot    |                             | notesFile (BLOB)  |
+-------------------+                             +-------------------+
```

---

## 4. 🎨 Design System & UI Architecture

- **Styling**: Modular Vanilla CSS custom properties (`index.css`, `App.css`, component-level stylesheets).
- **Iconography**: `react-icons` (Lucide React set for modern minimalist iconography).
- **Data Visualization**: Recharts for analytical charts, `react-calendar` for daily activity heatmap tracking.
- **Component Pattern**:
  - `Layout`: Shared navigation shell (`Navbar`, `Sidebar`, `MainLayout`).
  - `Pages`: View controllers (`Dashboard.jsx`, `Leetcode.jsx`, `History.jsx`, `Progress.jsx`, `Admin.jsx`).
  - `Components`: Reusable micro-components (`TopicCard`, `Calendar`, `WeeklyStreak`, `StateCard`, `Modal`, `Button`).
