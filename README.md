# TaskFlow API

[![CI/CD Pipeline](https://github.com/joel8779/taskflow-api/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/joel8779/taskflow-api/actions/workflows/ci-cd.yml)
[![Last Commit](https://img.shields.io/github/last-commit/joel8779/taskflow-api)](https://github.com/joel8779/taskflow-api/commits/main)

> **Employee Task & Incident Management System** — Clean REST API built with Spring Boot 3, JWT Authentication, and PostgreSQL.

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

TaskFlow API is a backend system for managing tasks and operational incidents within an organization. It demonstrates Spring Boot development practices including layered architecture, JWT security, JPA auditing, dynamic querying, and containerized deployment.

**Built to showcase:**
*   Clean, maintainable Spring Boot architecture.
*   Stateless JWT-based authentication with role-based access control (RBAC).
*   Production patterns: global exception handling, API response wrapping, and entity auditing.
*   DevOps-ready deployment using Docker, Docker Compose, and CI/CD pipelines via GitHub Actions.

---

## ⚡ Quick Start (Docker)

```bash
git clone https://github.com/joel8779/taskflow-api.git
cd taskflow-api
cp .env.example .env
docker-compose up --build
```

API is live at: **http://localhost:8080**  
Swagger UI: **http://localhost:8080/swagger-ui.html**

---

## 🏗️ Architecture

```
src/main/java/com/taskflow/api/
├── controller/          # REST controllers — HTTP layer only
│   ├── AuthController       # POST /auth/register, /auth/login
│   ├── TaskController       # Full CRUD + dashboard stats
│   ├── CommentController    # Comments & history endpoints
│   └── UserController       # User management
├── service/             # Business logic layer (interfaces + impls)
│   ├── AuthService
│   ├── TaskService
│   └── CommentService
├── repository/          # Spring Data JPA repositories + Specifications
├── entity/              # JPA entities with audit fields
│   ├── BaseEntity           # createdAt, updatedAt, createdBy, updatedBy
│   ├── User
│   ├── Task
│   ├── Comment
│   └── TaskHistory
├── dto/
│   ├── request/         # Validated inbound DTOs
│   └── response/        # Outbound DTOs (ApiResponse<T> wrapper)
├── security/            # JWT filter, utils, UserPrincipal
├── config/              # SecurityConfig, OpenApiConfig, AuditConfig
├── exception/           # Global exception handler + custom exceptions
└── util/                # MapperUtil (entity → DTO)
```

---

## 🔐 Authentication

All protected endpoints require a JWT Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

**Roles:**
| Role  | Capabilities |
| :--- | :--- |
| **ADMIN** | Full access — delete tasks, manage users, modify roles, view all data. |
| **USER**  | Create/update tasks, comment, view assigned work. |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Register new user account. |
| **POST** | `/api/v1/auth/login` | Authenticate and receive JWT token. |

### Tasks
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/tasks` | ✅ | List tasks (paginated, filterable). |
| **POST** | `/api/v1/tasks` | ✅ | Create new task or incident. |
| **GET** | `/api/v1/tasks/{id}` | ✅ | Get task details. |
| **PUT** | `/api/v1/tasks/{id}` | ✅ | Full update of task contents. |
| **PATCH** | `/api/v1/tasks/{id}/status` | ✅ | Status transition check. |
| **DELETE** | `/api/v1/tasks/{id}` | 🔐 ADMIN | Delete task from records. |
| **GET** | `/api/v1/tasks/dashboard/stats` | ✅ | Aggregated task dashboard statistics. |

### Query Parameters (`GET /tasks`)
```
?status=OPEN&priority=HIGH&type=INCIDENT&assigneeId=3&search=login&page=0&size=20&sort=createdAt,desc
```

### Comments & History
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/tasks/{id}/comments` | Add new comment. |
| **GET** | `/api/v1/tasks/{id}/comments` | Get comments list (paginated). |
| **DELETE** | `/api/v1/tasks/comments/{id}` | Delete a comment. |
| **GET** | `/api/v1/tasks/{id}/history` | Retrieve full field-level audit trail. |

### Users
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/users/me` | ✅ | Current user profile. |
| **GET** | `/api/v1/users` | 🔐 ADMIN | Get all users list. |
| **PATCH** | `/api/v1/users/{id}/role` | 🔐 ADMIN | Change user role privileges. |

---

## 🗃️ Data Model

```
User (1) ──< Task (reporter/assignee)
Task (1) ──< Comment
Task (1) ──< TaskHistory (audit trail)
```

*   **Task States**: `OPEN → IN_PROGRESS → UNDER_REVIEW → RESOLVED → CLOSED`
*   **Priority Levels**: `LOW | MEDIUM | HIGH | CRITICAL`
*   **Task Types**: `TASK | INCIDENT | BUG | FEATURE`

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Language** | Java 17 | Core programming runtime. |
| **Framework** | Spring Boot 3.2.3 | Layered backend routing context. |
| **Security** | Spring Security + JWT | Header token checking via `jjwt` library. |
| **Persistence** | Spring Data JPA + Hibernate | Mappings to relational database tables. |
| **Database** | PostgreSQL 16 | Production-grade datastore. |
| **Documentation** | SpringDoc OpenAPI 3 | Automatic endpoint swagger-ui documentation. |
| **DevOps** | Docker & Docker Compose | Multi-container environment settings. |
| **CI/CD** | GitHub Actions | Build validation workflows. |

---

## 🚀 Local Development (Without Docker)

### Prerequisites
*   Java 17+ installed.
*   Maven 3.8+ installed.
*   PostgreSQL 14+ running.

### Setup
1. Create PostgreSQL database:
   ```bash
   psql -U postgres -c "CREATE DATABASE taskflow_db;"
   psql -U postgres -c "CREATE USER taskflow_user WITH PASSWORD 'taskflow_pass';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE taskflow_db TO taskflow_user;"
   ```
2. Run database seeds:
   ```bash
   psql -U taskflow_user -d taskflow_db -f docs/schema.sql
   psql -U taskflow_user -d taskflow_db -f docs/data.sql
   ```
3. Configure environment file:
   ```bash
   cp .env.example .env
   # Edit .env with your local credentials
   ```
4. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

---

## 🧪 Running Tests

```bash
# Execute all unit tests
mvn test

# Run build package verification
mvn verify
```

---

## 📦 API Response Format

All responses are wrapped in a consistent envelope:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { ... },
  "timestamp": "2026-06-03T10:30:00"
}
```

---

## 🔑 Key Design Decisions

1.  **Stateless JWT Authentication**: Removed server session state constraints to make backend nodes horizontally scalable.
2.  **JPA Specification Pattern**: Composable, type-safe dynamic queries without writing messy string concatenations.
3.  **Global Exception Handling**: Integrated standard ControllerAdvice handlers to keep controllers clean of try-catch blocks.
4.  **JPA Auditing**: Declared a base class containing auditing annotations to write creation and update timestamps automatically.
5.  **Audit Logs**: Change logs are recorded in a dedicated table to save full history records of task field modifications.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
