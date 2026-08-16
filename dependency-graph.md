# 🕸️ DEPENDENCY-GRAPH.MD — Module & File Dependency Analysis

> **Momentum Learning Architectural Dependency Graph**  
> *Structural relationship maps across Frontend components, Backend packages, JPA entities, and core system files.*

---

## 1. ⚛️ Frontend Component & Service Dependency Hierarchy

```
App.jsx (Root Component)
└── AppRouter.jsx (Routing Central)
    ├── AuthProvider (AuthContext.jsx)
    │   └── authService.js
    │       └── api.js (Axios Instance with Interceptor)
    ├── ThemeProvider (ThemeContext.jsx)
    ├── ProtectedRoute.jsx / AdminRoute.jsx
    │   └── Reads AuthContext (user, loading)
    └── Pages
        ├── Auth.jsx
        │   ├── Login.jsx ──> authService.js
        │   └── Signup.jsx ──> authService.js
        ├── Dashboard.jsx
        │   ├── StateCard.jsx
        │   ├── WeeklyStreak.jsx ──> leetcodeService.js
        │   ├── Calendar.jsx ──> dashboardService.js
        │   └── TopicsWithDeadlines.jsx ──> topicService.js
        ├── Leetcode.jsx
        │   └── leetcodeService.js ──> api.js
        ├── History.jsx
        │   ├── TopicCard.jsx ──> topicService.js
        │   └── AddTopicModal.jsx ──> topicService.js
        └── Admin.jsx
            ├── PlatformOverview.jsx ──> adminService.js
            ├── UserManagement.jsx ──> adminService.js
            └── UserAnalyticsDetail.jsx ──> adminService.js
```

---

## 2. ☕ Backend Class & Service Dependency Graph

```
MementumApplication (Spring Boot Entry Point)
├── SecurityConfig
│   ├── JwtAuthenticationFilter
│   │   └── JwtUtil
│   ├── PasswordConfig (BCryptPasswordEncoder)
│   └── CorsFilter
├── Controllers
│   ├── AuthController ──────> AuthService (AuthServiceImpl)
│   │                          ├── UserRepository
│   │                          ├── JwtUtil
│   │                          ├── PasswordEncoder
│   │                          └── FileValidator
│   ├── TopicController ─────> TopicService (TopicServiceImpl)
│   │                          ├── TopicRepository
│   │                          ├── SubtopicRepository
│   │                          ├── TopicMapper
│   │                          └── SecurityUtil
│   ├── LeetcodeController ──> LeetcodeService (LeetcodeServiceImpl)
│   │                          ├── LeetcodeEntryRepository
│   │                          ├── LeetcodeMapper
│   │                          ├── FileValidator
│   │                          └── SecurityUtil
│   ├── DashboardController ─> DashboardService (DashboardServiceImpl)
│   │                          ├── TopicRepository
│   │                          ├── SubtopicRepository
│   │                          ├── LeetcodeEntryRepository
│   │                          └── SecurityUtil
│   └── AdminController ─────> AdminService (AdminServiceImpl)
│                              ├── UserRepository
│                              ├── TopicRepository
│                              ├── SubtopicRepository
│                              ├── LeetcodeEntryRepository
│                              └── SecurityUtil
```

---

## 3. 🔥 Critical System Files (High Impact — Modify with Caution)

The following files represent the core operational backbone of the application. Changes to these files can affect security, data integrity, or global app state:

### Backend Core Files
1. **`JwtAuthenticationFilter.java`**: Controls global token interception, authorization context setting, and API access verification.
2. **`SecurityUtil.java`**: Extracted identity utility used across every protected service method to read current `userId`.
3. **`SecurityConfig.java`**: Spring Security chain, CORS bean definitions, and password encoder setup.
4. **`AuthServiceImpl.java`**: Handles registration, BCrypt hashing, default admin role assignment, and login logic.
5. **`GlobalExceptionHandler.java`**: Catches all runtime and validation exceptions across the application and converts them into standardized `ApiResponse<T>`.

### Frontend Core Files
1. **`api.js`**: Central Axios configuration holding `API_BASE_URL` and `Authorization` Bearer token header injection interceptor.
2. **`AuthContext.jsx`**: Global user session state container and initial token check lifecycle.
3. **`AppRouter.jsx`**: Global routing table and route protection guards (`ProtectedRoute`, `AdminRoute`).

---

## 4. 🛡️ Safe Refactoring Rules
- **Do not modify `SecurityUtil.getCurrentUserId()` signature** without updating call sites across `TopicServiceImpl`, `LeetcodeServiceImpl`, `DashboardServiceImpl`, and `AdminServiceImpl`.
- **Do not modify `ApiResponse<T>` envelope fields (`success`, `message`, `data`, `timestamp`)** as all frontend Axios callers rely on `res.data.data` and `res.data.success`.
- **Ensure binary endpoints return proper MIME headers** (`Content-Type` and `Content-Disposition`) when serving BLOB payloads.
