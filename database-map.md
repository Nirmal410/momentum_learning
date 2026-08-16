# 🗄️ DATABASE-MAP.MD — Relational Database Schemas & Entity Mappings

> **Momentum Learning Database Intelligence Map**  
> *Complete MySQL database tables, column constraints, entity relationships, and indexes.*

---

## 1. 📌 Database Configuration Summary
- **Database Engine**: MySQL 8.0+ (InnoDB Engine)
- **Database Name**: `momentum_learning`
- **Charset & Collation**: `utf8mb4` / `utf8mb4_unicode_ci`
- **JPA DDL Auto Mode**: `update`

---

## 2. 📊 Entity Relationship Diagram (ERD)

```
+------------------------------------+
|               users                |
+------------------------------------+
| PK  id               BIGINT        |
| UK  email            VARCHAR(255)  |
|     name             VARCHAR(255)  |
|     password         VARCHAR(255)  |
|     profile_picture  LONGBLOB      |
|     role             VARCHAR(50)   |
|     status           VARCHAR(50)   |
|     created_at       DATETIME(6)   |
+------------------------------------+
        |                    |
        | 1:N                | 1:N
        v                    v
+------------------+  +------------------------------------+
|      topics      |  |          leetcode_entries          |
+------------------+  +------------------------------------+
| PK  id           |  | PK  id                         BIGINT |
| FK  user_id      |  | FK  user_id                    BIGINT |
|     title        |  |     problem_title              VARCHAR|
|     category     |  |     platform                   VARCHAR|
|     deadline     |  |     difficulty                 VARCHAR|
|     created_at   |  |     notes                      TEXT   |
+------------------+  |     task_photo                 LONGBLOB|
        |             |     task_photo_content_type    VARCHAR|
        | 1:N         |     code_screenshot            LONGBLOB|
        v             |     code_screenshot_content_type VARCHAR|
+------------------+  |     entry_date                 DATE   |
|    subtopics     |  |     created_at                 DATETIME|
+------------------+  +------------------------------------+
| PK  id           |
| FK  topic_id     |
|     title        |
|     completed    |
|     completed_at |
|     notes        |
|     notes_file   |
+------------------+
```

---

## 3. 📋 Table Specifications & Column Details

### 3.1 Table `users`
| Column Name | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key | User ID |
| `name` | `VARCHAR(255)` | No | None | None | User's full name |
| `email` | `VARCHAR(255)` | No | None | Unique | User's login email |
| `password` | `VARCHAR(255)` | No | None | None | BCrypt hashed password |
| `profile_picture` | `LONGBLOB` | Yes | `NULL` | None | Binary image payload |
| `role` | `VARCHAR(50)` | No | `'USER'` | None | Role (`USER` / `ADMIN`) |
| `status` | `VARCHAR(50)` | No | `'ACTIVE'` | None | Status (`ACTIVE` / `INACTIVE`) |
| `created_at` | `DATETIME(6)` | No | Current Time | None | Creation timestamp |

---

### 3.2 Table `topics`
| Column Name | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key | Topic ID |
| `user_id` | `BIGINT` | No | None | FK ➔ `users.id` | Owner user ID |
| `title` | `VARCHAR(255)` | No | None | None | Topic title |
| `category` | `VARCHAR(255)` | Yes | `NULL` | None | Category tag |
| `deadline` | `DATE` | Yes | `NULL` | None | Target deadline |
| `created_at` | `DATETIME(6)` | No | Current Time | None | Creation timestamp |

---

### 3.3 Table `subtopics`
| Column Name | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key | Subtopic ID |
| `topic_id` | `BIGINT` | No | None | FK ➔ `topics.id` | Parent topic ID |
| `title` | `VARCHAR(255)` | No | None | None | Subtopic name |
| `completed` | `BOOLEAN` | No | `FALSE` | None | Completion flag |
| `completed_at` | `DATETIME(6)` | Yes | `NULL` | None | Completion timestamp |
| `notes` | `TEXT` | Yes | `NULL` | None | Markdown notes |
| `notes_file` | `LONGBLOB` | Yes | `NULL` | None | Document binary payload |
| `notes_file_name` | `VARCHAR(255)` | Yes | `NULL` | None | Original filename |
| `notes_file_content_type` | `VARCHAR(100)` | Yes | `NULL` | None | MIME type |

---

### 3.4 Table `leetcode_entries`
| Column Name | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key | Entry ID |
| `user_id` | `BIGINT` | No | None | FK ➔ `users.id` | Owner user ID |
| `problem_title` | `VARCHAR(255)` | No | None | None | Problem title/number |
| `platform` | `VARCHAR(100)` | Yes | `'LeetCode'` | None | Platform name |
| `difficulty` | `VARCHAR(50)` | Yes | `'MEDIUM'` | None | `EASY`/`MEDIUM`/`HARD` |
| `notes` | `TEXT` | Yes | `NULL` | None | Approach notes |
| `task_photo` | `LONGBLOB` | Yes | `NULL` | None | Whiteboard photo payload |
| `task_photo_content_type` | `VARCHAR(100)` | Yes | `NULL` | None | Task photo MIME type |
| `code_screenshot` | `LONGBLOB` | Yes | `NULL` | None | Code screenshot payload |
| `code_screenshot_content_type` | `VARCHAR(100)` | Yes | `NULL` | None | Screenshot MIME type |
| `entry_date` | `DATE` | No | None | None | Problem solution date |
| `created_at` | `DATETIME(6)` | No | Current Time | None | Log timestamp |

---

## 4. ⚡ Indexes & Optimization Strategy
1. **Foreign Key Indexes**:
   - `idx_topics_user_id` on `topics(user_id)`
   - `idx_subtopics_topic_id` on `subtopics(topic_id)`
   - `idx_leetcode_user_id` on `leetcode_entries(user_id)`
2. **Analytics & Heatmap Indexes**:
   - `idx_leetcode_user_entry_date` on `leetcode_entries(user_id, entry_date)`
   - `idx_subtopics_completed_at` on `subtopics(completed_at)`
3. **Lazy Binary Loading**: JPA `@Basic(fetch = FetchType.LAZY)` configured on `LONGBLOB` columns to prevent unnecessary byte retrieval during standard list queries.
