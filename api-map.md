# 📡 API-MAP.MD — REST API Specification & Request/Response Catalog

> **Momentum Learning API Inventory**  
> *Detailed technical specifications for request payloads, data envelopes, and response formats.*

---

## 1. 📦 Global Response Envelope (`ApiResponse<T>`)

All endpoints in Momentum Learning return JSON adhering to the following structure:

### Success Response Format (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "timestamp": "2026-08-16T12:00:00"
}
```

### Failure Response Format (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "message": "Detailed error notification message",
  "data": null,
  "timestamp": "2026-08-16T12:00:00"
}
```

---

## 2. 🔌 Detailed Endpoint Schemas

### 2.1 Auth Module (`/api/auth`)

#### `POST /api/auth/signup`
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `name` (String, Required)
  - `email` (String, Required)
  - `password` (String, Required, min 6 chars)
  - `confirmPassword` (String, Required)
  - `profilePicture` (MultipartFile, Optional, max 20MB)
- **Response Data (`AuthResponse`)**:
  - `token`: String (JWT Bearer Token)
  - `user`: Object (`UserResponse`: `id`, `name`, `email`, `role`, `status`, `createdAt`)

#### `POST /api/auth/login`
- **Content-Type**: `application/json`
- **Request Body (`LoginRequest`)**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response Data (`AuthResponse`)**:
  - `token`: String
  - `user`: `UserResponse` object

#### `GET /api/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Response Data**: `UserResponse` object

---

### 2.2 Topic Module (`/api/topics`)

#### `POST /api/topics`
- **Request Body (`TopicRequest`)**:
  ```json
  {
    "title": "Data Structures & Algorithms",
    "category": "Computer Science",
    "deadline": "2026-10-15",
    "subtopics": [
      { "title": "Arrays & Strings" },
      { "title": "Trees & Graphs" }
    ]
  }
  ```
- **Response Data (`TopicResponse`)**:
  - `id`: Long
  - `title`: String
  - `category`: String
  - `deadline`: Date
  - `progressPercentage`: Double
  - `subtopics`: Array of `SubtopicResponse`

#### `PATCH /api/topics/{topicId}/subtopics/{subtopicId}/toggle`
- **Response Data**: Updated `TopicResponse` reflecting new overall progress percentage.

#### `POST /api/topics/{topicId}/subtopics/{subtopicId}/notes`
- **Content-Type**: `multipart/form-data`
- **Params**: `notes` (String), `file` (MultipartFile)
- **Response Data**: Updated `SubtopicResponse`

---

### 2.3 LeetCode Module (`/api/leetcode`)

#### `POST /api/leetcode`
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `problemTitle`: String (Required)
  - `platform`: String (Default "LeetCode")
  - `difficulty`: String (`EASY`, `MEDIUM`, `HARD`)
  - `notes`: String
  - `entryDate`: Date (`YYYY-MM-DD`)
  - `taskPhoto`: File (Optional)
  - `codeScreenshot`: File (Optional)
- **Response Data (`LeetcodeResponse`)**:
  - `id`, `problemTitle`, `platform`, `difficulty`, `notes`, `entryDate`, `hasTaskPhoto`, `hasCodeScreenshot`

---

### 2.4 Dashboard Module (`/api/dashboard`)

#### `GET /api/dashboard/summary`
- **Response Data (`DashboardSummaryResponse`)**:
  - `totalTopics`: Integer
  - `completedSubtopics`: Integer
  - `totalSubtopics`: Integer
  - `activeStreak`: Integer
  - `totalLeetcodeSolved`: Integer

#### `GET /api/dashboard/calendar?year=2026&month=8`
- **Response Data**: Array of `CalendarDayResponse` (`date`, `activityCount`, `completedSubtopicsCount`, `leetcodeCount`)

---

### 2.5 Admin Module (`/api/admin`)

#### `GET /api/admin/overview`
- **Response Data (`AdminPlatformOverviewResponse`)**:
  - Total users, active users, total topics created, total subtopics completed, total LeetCode entries logged across platform.

#### `PATCH /api/admin/users/{userId}/status`
- **Request Body (`UpdateUserStatusRequest`)**:
  ```json
  { "status": "INACTIVE" }
  ```

#### `PATCH /api/admin/users/{userId}/role`
- **Request Body (`UpdateUserRoleRequest`)**:
  ```json
  { "role": "ADMIN" }
  ```
