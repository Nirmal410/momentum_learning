# 🚦 ROUTES.MD — Comprehensive Routing Intelligence

> **Momentum Learning Route & Endpoint Mapping**  
> *Complete map of Frontend React Router paths and Backend REST API Endpoints.*

---

## 1. ⚛️ Frontend Routes Table (React Router DOM v7)

| Path | Component | Guard / Protection | Purpose |
|---|---|---|---|
| `/` | `Auth.jsx` | None (Public) | User Authentication (Login & Registration forms) |
| `/dashboard` | `Dashboard.jsx` | `ProtectedRoute` | Overview metrics, activity heatmap, recent streams |
| `/leetcode` | `Leetcode.jsx` | `ProtectedRoute` | LeetCode & competitive programming practice logger |
| `/history` | `History.jsx` | `ProtectedRoute` | Topic & subtopic curriculum manager |
| `/progress` | `Progress.jsx` | `ProtectedRoute` | Analytics & progress visualization |
| `/admin` | `Admin.jsx` | `AdminRoute` | Administrator management panel for platform oversight |

---

## 2. 🔌 Backend REST API Routes Table

### Authentication API (`/api/auth`)
| Method | Route Path | Auth Required | Used By (Frontend File) | Purpose |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | `Auth.jsx` / `authService.js` | Register new account (with optional profile picture) |
| `POST` | `/api/auth/login` | Public | `Auth.jsx` / `authService.js` | Authenticate user credentials & issue JWT token |
| `GET` | `/api/auth/me` | User / Admin | `AuthContext.jsx` / `authService.js` | Fetch currently authenticated user profile |
| `POST` | `/api/auth/logout` | User / Admin | `Navbar.jsx` / `authService.js` | Stateless session logout |

---

### Topic & Subtopic API (`/api/topics`)
| Method | Route Path | Auth Required | Used By (Frontend File) | Purpose |
|---|---|---|---|---|
| `POST` | `/api/topics` | User / Admin | `AddTopicModal.jsx` / `topicService.js` | Create a new topic with nested subtopics |
| `GET` | `/api/topics` | User / Admin | `History.jsx`, `Dashboard.jsx` | Fetch all topics owned by logged-in user |
| `GET` | `/api/topics/{id}` | User / Admin | `TopicCard.jsx` | Fetch specific topic by ID |
| `DELETE` | `/api/topics/{id}` | User / Admin | `TopicCard.jsx` | Delete topic and all nested subtopics |
| `PATCH` | `/api/topics/{topicId}/subtopics/{subtopicId}/toggle` | User / Admin | `TopicCard.jsx`, `History.jsx` | Toggle subtopic completion state |
| `POST` | `/api/topics/{topicId}/subtopics/{subtopicId}/notes` | User / Admin | `TopicCard.jsx` | Save subtopic notes and attach document file |
| `GET` | `/api/topics/{topicId}/subtopics/{subtopicId}/notes-file` | User / Admin | `TopicCard.jsx` | Download attached document file binary |

---

### LeetCode Practice Logger API (`/api/leetcode`)
| Method | Route Path | Auth Required | Used By (Frontend File) | Purpose |
|---|---|---|---|---|
| `POST` | `/api/leetcode` | User / Admin | `Leetcode.jsx` / `leetcodeService.js` | Log new problem entry (with task photo & code screenshot) |
| `GET` | `/api/leetcode` | User / Admin | `Leetcode.jsx` / `leetcodeService.js` | Fetch user's logged practice entries |
| `GET` | `/api/leetcode/streak` | User / Admin | `WeeklyStreak.jsx`, `Dashboard.jsx` | Fetch user's active consecutive daily streak count |
| `DELETE` | `/api/leetcode/{id}` | User / Admin | `Leetcode.jsx` / `leetcodeService.js` | Delete practice entry |
| `GET` | `/api/leetcode/{id}/photo` | User / Admin | `Leetcode.jsx` | Stream task photo binary payload |
| `GET` | `/api/leetcode/{id}/code-screenshot` | User / Admin | `Leetcode.jsx` | Stream code screenshot binary payload |

---

### Dashboard Analytics API (`/api/dashboard`)
| Method | Route Path | Auth Required | Used By (Frontend File) | Purpose |
|---|---|---|---|---|
| `GET` | `/api/dashboard/summary` | User / Admin | `Dashboard.jsx` / `dashboardService.js` | Overview key metrics (topics, subtopics, streak, problems) |
| `GET` | `/api/dashboard/calendar` | User / Admin | `Calendar.jsx` / `dashboardService.js` | Monthly practice heatmap activity calendar |
| `GET` | `/api/dashboard/recent` | User / Admin | `Dashboard.jsx` / `dashboardService.js` | Stream of recently completed topics & practice logs |

---

### Admin Management API (`/api/admin`)
| Method | Route Path | Auth Required | Used By (Frontend File) | Purpose |
|---|---|---|---|---|
| `GET` | `/api/admin/overview` | Admin Only | `PlatformOverview.jsx` / `adminService.js` | Platform metrics & usage stats |
| `GET` | `/api/admin/users` | Admin Only | `UserManagement.jsx` / `adminService.js` | List all platform users |
| `GET` | `/api/admin/users/{userId}/analytics` | Admin Only | `UserAnalyticsDetail.jsx` | Fetch specific user's activity analytics |
| `PATCH` | `/api/admin/users/{userId}/status` | Admin Only | `UserManagement.jsx` | Toggle user account status (`ACTIVE`/`INACTIVE`) |
| `PATCH` | `/api/admin/users/{userId}/role` | Admin Only | `UserManagement.jsx` | Update user role (`USER`/`ADMIN`) |
| `DELETE` | `/api/admin/users/{userId}` | Admin Only | `UserManagement.jsx` | Permanently remove user account |
