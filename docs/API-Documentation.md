# 📡 REST API Documentation

This document provides a comprehensive technical reference for all RESTful API endpoints in the **Momentum Learning** backend system.

---

## 📌 Base Configuration

- **Base URL**: `http://localhost:8080/api`
- **Protocol**: HTTP/HTTPS
- **Default Media Type**: `application/json` (Multipart endpoints explicitly specified)
- **Authentication Header**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 📦 Standard Response Envelope

All API endpoints return data wrapped in a standardized JSON response envelope (`ApiResponse<T>`):

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "timestamp": "2026-08-14T12:00:00"
}
```

### Error Response (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "message": "Detailed error description or validation message",
  "data": null,
  "timestamp": "2026-08-14T12:00:00"
}
```

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

### 1.1 User Signup
Creates a new user account. Supports profile picture upload.

- **Endpoint**: `POST /api/auth/signup`
- **Content-Type**: `multipart/form-data`
- **Authentication Required**: None (Public)

#### Request Form Data Parameters:
| Parameter | Type | Required | Description | Constraints |
|---|---|---|---|---|
| `name` | String | Yes | User's full name | Non-blank |
| `email` | String | Yes | User's unique email address | Valid email format |
| `password` | String | Yes | User password | Min 6 characters |
| `profilePicture` | File | No | Profile image attachment | Max 20MB |

#### Sample Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2026-08-14T12:00:00"
    }
  },
  "timestamp": "2026-08-14T12:00:00"
}
```

---

### 1.2 User Login
Authenticates user credentials and returns a JWT token.

- **Endpoint**: `POST /api/auth/login`
- **Content-Type**: `application/json`
- **Authentication Required**: None (Public)

#### Request Body:
```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

#### Sample Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2026-08-14T12:00:00"
    }
  },
  "timestamp": "2026-08-14T12:00:00"
}
```

---

### 1.3 Get Current User Profile
Retrieves current authenticated user details.

- **Endpoint**: `GET /api/auth/me`
- **Authentication Required**: Yes (`USER` / `ADMIN`)

#### Sample Response:
```json
{
  "success": true,
  "message": "User details fetched",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2026-08-14T12:00:00"
  },
  "timestamp": "2026-08-14T12:00:00"
}
```

---

### 1.4 User Logout
Invalidates local token session (stateless notification).

- **Endpoint**: `POST /api/auth/logout`
- **Authentication Required**: Yes (`USER` / `ADMIN`)

---

## 📚 2. Topic & Subtopic Endpoints (`/api/topics`)

### 2.1 Create Topic with Subtopics
- **Endpoint**: `POST /api/topics`
- **Content-Type**: `application/json`
- **Authentication Required**: Yes

#### Request Body:
```json
{
  "title": "Spring Boot Microservices",
  "category": "Backend Development",
  "deadline": "2026-09-30",
  "subtopics": [
    { "title": "Spring Cloud Gateway Setup" },
    { "title": "Eureka Service Registry" },
    { "title": "Resilience4j Circuit Breaker" }
  ]
}
```

#### Sample Response:
```json
{
  "success": true,
  "message": "Topic created successfully",
  "data": {
    "id": 10,
    "title": "Spring Boot Microservices",
    "category": "Backend Development",
    "deadline": "2026-09-30",
    "createdAt": "2026-08-14T12:10:00",
    "progressPercentage": 0.0,
    "subtopics": [
      {
        "id": 25,
        "title": "Spring Cloud Gateway Setup",
        "completed": false,
        "completedAt": null,
        "notes": null,
        "hasNotesFile": false,
        "notesFileName": null
      }
    ]
  },
  "timestamp": "2026-08-14T12:10:00"
}
```

---

### 2.2 Get All User Topics
- **Endpoint**: `GET /api/topics`
- **Authentication Required**: Yes

#### Sample Response:
```json
{
  "success": true,
  "message": "Topics fetched successfully",
  "data": [
    {
      "id": 10,
      "title": "Spring Boot Microservices",
      "category": "Backend Development",
      "deadline": "2026-09-30",
      "progressPercentage": 33.3,
      "subtopics": [...]
    }
  ],
  "timestamp": "2026-08-14T12:10:00"
}
```

---

### 2.3 Get Specific Topic
- **Endpoint**: `GET /api/topics/{id}`
- **Authentication Required**: Yes

---

### 2.4 Delete Topic
- **Endpoint**: `DELETE /api/topics/{id}`
- **Authentication Required**: Yes

---

### 2.5 Toggle Subtopic Completion Status
- **Endpoint**: `PATCH /api/topics/{topicId}/subtopics/{subtopicId}/toggle`
- **Authentication Required**: Yes

#### Sample Response:
Returns updated `TopicResponse` reflecting recalculated progress percentage.

---

### 2.6 Save Subtopic Notes & Document File
- **Endpoint**: `POST /api/topics/{topicId}/subtopics/{subtopicId}/notes`
- **Content-Type**: `multipart/form-data`
- **Authentication Required**: Yes

#### Request Form Data:
| Field | Type | Description |
|---|---|---|
| `notes` | String | Written text notes |
| `file` | MultipartFile | Uploaded file document |

---

### 2.7 Download Subtopic Notes File
- **Endpoint**: `GET /api/topics/{topicId}/subtopics/{subtopicId}/notes-file`
- **Authentication Required**: Yes
- **Returns**: Raw byte payload with appropriate `Content-Type` header (e.g. `application/pdf`, `image/png`).

---

## 💻 3. LeetCode Practice Logger (`/api/leetcode`)

### 3.1 Log New Practice Entry
- **Endpoint**: `POST /api/leetcode`
- **Content-Type**: `multipart/form-data`
- **Authentication Required**: Yes

#### Request Form Data:
| Parameter | Type | Required | Description |
|---|---|---|---|
| `problemTitle` | String | Yes | Problem name/number (e.g. "1. Two Sum") |
| `platform` | String | No | Default: "LeetCode" |
| `difficulty` | String | Yes | `EASY`, `MEDIUM`, or `HARD` |
| `notes` | String | No | Custom approach & complexity notes |
| `entryDate` | Date (YYYY-MM-DD) | Yes | Date problem was solved |
| `taskPhoto` | File | No | Solution diagram or proof photo |
| `codeScreenshot` | File | No | IDE / LeetCode code screenshot |

---

### 3.2 Fetch All Practice Logs
- **Endpoint**: `GET /api/leetcode`
- **Authentication Required**: Yes

---

### 3.3 Get Active Practice Streak
- **Endpoint**: `GET /api/leetcode/streak`
- **Authentication Required**: Yes
- **Response Data**: Integer count representing active daily streak.

---

### 3.4 Delete Practice Entry
- **Endpoint**: `DELETE /api/leetcode/{id}`
- **Authentication Required**: Yes

---

### 3.5 Download Entry Images
- `GET /api/leetcode/{id}/photo` -> Task proof image
- `GET /api/leetcode/{id}/code-screenshot` -> Code submission screenshot

---

## 📊 4. Dashboard & Analytics (`/api/dashboard`)

### 4.1 Get Dashboard Overview Summary
- **Endpoint**: `GET /api/dashboard/summary`
- **Authentication Required**: Yes

#### Sample Response:
```json
{
  "success": true,
  "message": "Dashboard summary retrieved",
  "data": {
    "totalTopics": 12,
    "completedSubtopics": 48,
    "totalSubtopics": 60,
    "activeStreak": 7,
    "totalLeetcodeSolved": 35
  },
  "timestamp": "2026-08-14T12:00:00"
}
```

---

### 4.2 Get Monthly Activity Calendar
- **Endpoint**: `GET /api/dashboard/calendar?year=2026&month=8`
- **Query Params**: `year` (optional), `month` (optional)
- **Authentication Required**: Yes

#### Sample Response Data Array:
```json
[
  {
    "date": "2026-08-14",
    "activityCount": 3,
    "completedSubtopicsCount": 2,
    "leetcodeCount": 1
  }
]
```

---

### 4.3 Get Recent Activity Stream
- **Endpoint**: `GET /api/dashboard/recent`
- **Authentication Required**: Yes

---

## 🛡️ 5. Admin Management Endpoints (`/api/admin`)
*Requires `ROLE_ADMIN` authority.*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/overview` | Platform-wide user metrics & usage statistics |
| `GET` | `/api/admin/users` | Overview list of all registered platform users |
| `GET` | `/api/admin/users/{userId}/analytics` | User specific activity analytics (`timeRange=30d`) |
| `PATCH` | `/api/admin/users/{userId}/status` | Update account status (`ACTIVE` / `INACTIVE`) |
| `PATCH` | `/api/admin/users/{userId}/role` | Update user role (`USER` / `ADMIN`) |
| `DELETE` | `/api/admin/users/{userId}` | Permanently delete user and all associated data |

---

## ⚠️ HTTP Error Status Codes

| Code | Status | Meaning & Troubleshooting |
|---|---|---|
| `400` | Bad Request | Validation error or missing required request parameters |
| `401` | Unauthorized | Missing or expired JWT token in `Authorization` header |
| `403` | Forbidden | Insufficient user role permissions (e.g. non-admin accessing `/api/admin`) |
| `404` | Not Found | Target entity (User, Topic, Subtopic, Entry) does not exist |
| `500` | Internal Server Error | Uncaught backend runtime exception |
