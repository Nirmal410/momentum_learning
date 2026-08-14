# 📋 Momentum Learning Task Checklist & Roadmap

## 🟩 Completed Tasks (Phase 1 & Phase 2)

### Backend Architecture & Data Layer
- [x] Configure Spring Boot 4.1.0 application structure and MySQL persistence with JPA/Hibernate.
- [x] Implement database entities: `User`, `Topic`, `Subtopic`, `LeetcodeEntry`.
- [x] Configure BCrypt password hashing and JWT authentication (`JwtAuthenticationFilter`, `JwtUtil`).
- [x] Implement `ApiResponse<T>` unified response envelope and `GlobalExceptionHandler`.
- [x] Build full CRUD endpoints for Topics, Subtopics, and File Upload attachments.
- [x] Implement LeetCode practice entry logging, file uploads (code screenshot, task proof), and streak calculation logic.
- [x] Build Dashboard summary endpoints, activity calendar heatmap API, and recent activity streams.
- [x] Implement Admin Module endpoints (`/api/admin/*`) for user overview, role modification, account status updates, and user analytics.

### Frontend Application
- [x] Scaffold React + Vite application with React Router v6 navigation.
- [x] Set up Axios API client with JWT bearer token request interceptors and error handling.
- [x] Implement `AuthContext` for persistent user login state management.
- [x] Build user authentication views (`Auth.jsx` - Login & Signup).
- [x] Implement interactive `Dashboard.jsx` with summary stats, activity heatmap, and recent logs.
- [x] Implement Topic management page (`History.jsx` / Topic views) with progress calculation and file attachment downloads.
- [x] Build LeetCode practice submission logger (`Leetcode.jsx`) with image modal previews and difficulty tags.
- [x] Implement Admin Panel (`Admin.jsx`) for platform metrics and user controls.

---

## 🟨 In Progress / Upcoming Features (Phase 3)

- [ ] **Notification & Reminder System**: Scheduled email reminders for upcoming topic deadlines.
- [ ] **Data Export Capabilities**: PDF & CSV export for user learning summaries and LeetCode logs.
- [ ] **Dockerization**: Create `docker-compose.yml` for single-command full-stack container orchestration.
- [ ] **Automated Test Suite**: Expand JUnit 5 test coverage and add React component integration tests.
