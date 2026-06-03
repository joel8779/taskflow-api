# 🗂️ TaskFlow API

> **Employee Task & Incident Management System** — Production-grade REST API built with Spring Boot 3, JWT Authentication, and PostgreSQL.

[![CI/CD Pipeline](https://github.com/joel8779/taskflow-api/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/joel8779/taskflow-api/actions)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Overview

TaskFlow API is a fully-featured backend system for managing tasks and operational incidents within an organization. It demonstrates enterprise Java development practices including layered architecture, JWT security, JPA auditing, and containerized deployment.

**Built to showcase:**
- Clean, maintainable Spring Boot architecture
- Stateless JWT-based authentication with role-based access control
- Production patterns: global exception handling, API response wrapping, audit trails
- DevOps-ready with Docker, docker-compose, and CI/CD via GitHub Actions

---

## ⚡ Quick Start (Docker)

```bash
git clone https://github.com/YOUR_USERNAME/taskflow-api.git
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
|-------|-------------|
| ADMIN | Full access — delete tasks, manage users, view all data |
| USER  | Create/update tasks, comment, view assigned work |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user account |
| POST | `/api/v1/auth/login` | Authenticate, receive JWT |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tasks` | ✅ | List tasks (paginated, filterable) |
| POST | `/api/v1/tasks` | ✅ | Create new task/incident |
| GET | `/api/v1/tasks/{id}` | ✅ | Get task detail |
| PUT | `/api/v1/tasks/{id}` | ✅ | Full update |
| PATCH | `/api/v1/tasks/{id}/status` | ✅ | Status transition |
| DELETE | `/api/v1/tasks/{id}` | 🔐 ADMIN | Delete task |
| GET | `/api/v1/tasks/dashboard/stats` | ✅ | Aggregated statistics |

### Query Parameters (GET /tasks)
```
?status=OPEN&priority=HIGH&type=INCIDENT&assigneeId=3&search=login
&page=0&size=20&sort=createdAt,desc
```

### Comments & History
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks/{id}/comments` | Add comment |
| GET | `/api/v1/tasks/{id}/comments` | Get comments (paginated) |
| DELETE | `/api/v1/tasks/comments/{id}` | Delete comment |
| GET | `/api/v1/tasks/{id}/history` | Full audit trail |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users/me` | ✅ | Current user profile |
| GET | `/api/v1/users` | 🔐 ADMIN | All users |
| PATCH | `/api/v1/users/{id}/role` | 🔐 ADMIN | Change user role |

---

## 🗃️ Data Model

```
User (1) ──< Task (reporter/assignee)
Task (1) ──< Comment
Task (1) ──< TaskHistory (audit trail)
```

**Task States:** `OPEN → IN_PROGRESS → UNDER_REVIEW → RESOLVED → CLOSED`

**Priority Levels:** `LOW | MEDIUM | HIGH | CRITICAL`

**Task Types:** `TASK | INCIDENT | BUG | FEATURE`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.2.3 |
| Security | Spring Security + JWT (jjwt 0.11) |
| Persistence | Spring Data JPA + Hibernate |
| Database | PostgreSQL 16 |
| Build | Maven 3.9 |
| Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Testing | JUnit 5 + Mockito |

---

## 🚀 Local Development (Without Docker)

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 14+

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/taskflow-api.git
cd taskflow-api

# 2. Create database
psql -U postgres -c "CREATE DATABASE taskflow_db;"
psql -U postgres -c "CREATE USER taskflow_user WITH PASSWORD 'taskflow_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE taskflow_db TO taskflow_user;"

# 3. Run the schema
psql -U taskflow_user -d taskflow_db -f docs/schema.sql
psql -U taskflow_user -d taskflow_db -f docs/data.sql

# 4. Configure environment
cp .env.example .env
# Edit .env with your values

# 5. Run
mvn spring-boot:run
```

---

## 🧪 Running Tests

```bash
# All unit tests
mvn test

# With coverage report
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
  "timestamp": "2024-03-15T10:30:00"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Task not found with id: '99'",
  "timestamp": "2024-03-15T10:30:00"
}
```

---

## 🌱 Sample Credentials (from seed data)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| alice.johnson | user123 | USER |
| bob.smith | user123 | USER |

---

## 📁 Project Structure

```
taskflow-api/
├── src/
│   ├── main/
│   │   ├── java/com/taskflow/api/
│   │   └── resources/application.yml
│   └── test/
├── docs/
│   ├── schema.sql
│   ├── data.sql
│   └── TaskFlow-API.postman_collection.json
├── .github/workflows/ci-cd.yml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── pom.xml
```

---

## 🔑 Key Design Decisions

1. **Stateless JWT Auth** — No server-side session storage; horizontally scalable
2. **JPA Specification Pattern** — Composable, type-safe dynamic queries without messy JPQL string concatenation
3. **Global Exception Handler** — Centralized error handling; controllers stay clean
4. **API Response Wrapper** — Consistent `ApiResponse<T>` envelope for all endpoints
5. **Audit Base Entity** — `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on all entities via Spring Data Auditing
6. **Task History** — Immutable change log records every field-level mutation
7. **Multi-stage Docker Build** — Separate build and runtime layers; minimal production image

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
