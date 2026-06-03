# TaskFlow API — Career Assets

---

## ✅ RESUME BULLET POINTS (Copy-paste ready)

### For "Projects" Section:

**TaskFlow API — Employee Task & Incident Management System** | Java · Spring Boot · PostgreSQL · Docker
- Designed and built a production-grade REST API using **Spring Boot 3**, implementing stateless **JWT authentication** with role-based access control (ADMIN/USER), layered MVC architecture, and a global exception handler that standardizes error responses across 15+ endpoints
- Engineered a dynamic **JPA Specification** query engine supporting multi-field filtering, full-text search, and pagination/sorting — reducing ad-hoc JPQL queries to zero while keeping controller logic clean
- Containerized the full stack using a **multi-stage Dockerfile** and **Docker Compose** (app + PostgreSQL), and automated the build/test/Docker pipeline with **GitHub Actions CI/CD**, cutting deployment setup from hours to a single `docker-compose up` command

### Alternate bullets (mix and match):

- Implemented **JPA Auditing** (`@CreatedBy`, `@LastModifiedBy`) and an immutable `TaskHistory` entity to provide a full audit trail for all field-level changes, enabling compliance-grade traceability
- Built a dashboard analytics endpoint aggregating task KPIs (counts by status, priority, type, assignee workload, overdue items) using JPQL group-by queries — designed to power real-time operational dashboards
- Wrote unit tests using **JUnit 5 and Mockito** with 100% service-layer coverage, following the Arrange-Act-Assert pattern and testing both happy paths and exception flows

---

## 🎯 WHAT TO LIST ON YOUR RESUME (Skills Section)

**Languages:** Java 17  
**Frameworks:** Spring Boot 3, Spring Security, Spring Data JPA  
**Databases:** PostgreSQL, Hibernate/JPA  
**Security:** JWT, BCrypt, Role-Based Access Control (RBAC)  
**DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD)  
**APIs:** RESTful API design, OpenAPI 3.0 / Swagger UI  
**Testing:** JUnit 5, Mockito  
**Tools:** Maven, Lombok, Git  
**Patterns:** Layered Architecture, DTO Pattern, Repository Pattern, Global Exception Handling

---

## 🎤 INTERVIEW QUESTIONS & ANSWERS

### 🔐 Security

**Q: How does JWT authentication work in your project?**

> When a user logs in, the server validates credentials and generates a signed JWT using HS256. The token embeds the username, role, and expiration. The `JwtAuthenticationFilter` intercepts every request, parses the `Authorization: Bearer <token>` header, validates the signature and expiry, then sets the `SecurityContextHolder` authentication. Since JWTs are stateless — no session storage is needed — the app scales horizontally with no shared state.

**Q: How do you handle role-based access control?**

> Spring Security's `@PreAuthorize("hasRole('ADMIN')")` annotation is applied at the controller method level. The `SecurityConfig` also defines path-level rules — for example, `DELETE /tasks/{id}` requires ADMIN. The user's role is embedded in their JWT claims and loaded into `UserPrincipal.getAuthorities()` as `ROLE_ADMIN` or `ROLE_USER`.

**Q: How do you store passwords securely?**

> Passwords are hashed with BCrypt (strength factor 12) using Spring's `PasswordEncoder`. BCrypt is a one-way adaptive hash function — it's intentionally slow and includes a salt, making rainbow table attacks impractical. We never store or log plaintext passwords anywhere.

---

### 🏗️ Architecture

**Q: Why did you use the DTO pattern instead of returning entities directly?**

> Returning JPA entities directly from controllers is an anti-pattern for several reasons: it can accidentally expose sensitive fields (like `password`), it creates tight coupling between the API contract and database schema, and lazy-loaded associations can cause `LazyInitializationException` outside a transaction. DTOs decouple the API surface from the persistence layer. `TaskSummary` vs `TaskDetail` also lets me return different field sets for list vs detail views without multiple entity queries.

**Q: Explain your layered architecture.**

> The app follows a strict layered pattern: **Controller** handles HTTP concerns only (parse request, call service, return `ResponseEntity`). **Service** contains all business logic and transaction management — it's where rules like "you can't transition to the same status" live. **Repository** handles data access via Spring Data JPA. **Entity** represents the database schema. This separation means I can unit test the service layer with mocks, and swap the persistence layer without touching business logic.

**Q: What is the JPA Specification pattern and why did you use it?**

> `JpaSpecificationExecutor` lets you build type-safe, composable `WHERE` clauses programmatically at runtime. In `TaskSpecification.withFilters()`, each filter (status, priority, type, assigneeId, search) adds a `Predicate` to a list only if the parameter is non-null. All predicates are ANDed together with `cb.and(...)`. The alternative — building JPQL strings manually — is error-prone and hard to test. Specifications are clean, testable, and extensible.

**Q: Why do you use an `ApiResponse<T>` wrapper?**

> It enforces a consistent contract: every response has `success`, `message`, `data`, and `timestamp`. Without a wrapper, clients must handle wildly different response shapes. With it, the frontend can always check `response.success` first, then access `response.data`. It also makes Swagger documentation cleaner — all endpoints share the same envelope schema.

---

### 🗃️ Database & JPA

**Q: How does JPA Auditing work in your project?**

> I annotate `BaseEntity` with `@EntityListeners(AuditingEntityListener.class)` and use `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`. Spring Data JPA populates these automatically on persist/merge. The `AuditorAware` bean reads the current username from `SecurityContextHolder` — so every record knows exactly who created/updated it without any manual code in the service layer.

**Q: How do you handle N+1 query problems?**

> By default, I use `FetchType.LAZY` on all `@ManyToOne` and `@OneToMany` relationships so associations are only loaded on demand. For endpoints that need related data (like `TaskDetail` which shows assignee/reporter), the service method is marked `@Transactional(readOnly = true)` to keep the session open during mapping. For bulk list endpoints, I'd use `@EntityGraph` or a custom JPQL `JOIN FETCH` to load related data in a single query.

**Q: Why PostgreSQL over MySQL for this project?**

> PostgreSQL has better support for advanced query features we'd need at scale: full-text search with GIN indexes, JSONB columns for metadata, and more robust MVCC concurrency. It also has stronger standards compliance. That said, the codebase is nearly database-agnostic — switching to MySQL would require only a dialect change in `application.yml`.

---

### ☁️ DevOps & Operations

**Q: Walk me through your Docker setup.**

> The `Dockerfile` uses a multi-stage build: Stage 1 is a Maven image that compiles the JAR (dependencies are cached in a separate layer for faster rebuilds). Stage 2 uses a minimal JRE Alpine image — the final image is ~200MB vs ~600MB for a full JDK image. The app runs as a non-root `taskflow` user for security. `docker-compose.yml` orchestrates app + PostgreSQL with a health check dependency: the app only starts after Postgres passes `pg_isready`.

**Q: What does your CI/CD pipeline do?**

> On every push to `main` or PR, GitHub Actions: (1) spins up a PostgreSQL service container, (2) runs `mvn test`, (3) builds the JAR with `mvn package -DskipTests`, (4) uploads test results as artifacts. On merges to `main`, it also builds the Docker image. This catches regressions before they reach any environment.

**Q: How would you handle secrets in production?**

> Never hardcode secrets or commit `.env` files. In Docker, inject secrets via environment variables at runtime. In cloud environments (AWS, GCP), use services like AWS Secrets Manager or GCP Secret Manager and mount secrets as environment variables in the container. The `JWT_SECRET` especially must be at least 256 bits and rotated periodically.

---

### 🧪 Testing

**Q: How did you approach unit testing the service layer?**

> I use JUnit 5 + Mockito with `@ExtendWith(MockitoExtension.class)`. Repositories and utilities are mocked so tests run in milliseconds with no database. I follow the Arrange-Act-Assert pattern and group tests with `@Nested` classes per method. I test both success paths and exception flows — for example, verifying that `updateTaskStatus` throws `BusinessException` when transitioning to the current status, and `ResourceNotFoundException` for unknown IDs.

**Q: What's the difference between unit and integration tests?**

> Unit tests isolate a single class with mocked dependencies — fast, no I/O, run in CI on every push. Integration tests (`@SpringBootTest`) wire up the full Spring context and hit a real database (I'd use an H2 in-memory DB or Testcontainers with real PostgreSQL). Integration tests are slower but catch wiring issues, database constraint violations, and transaction behavior. For this project I prioritized service-layer unit tests for resume value; integration tests would be the next step.

---

## 📅 1-DAY IMPLEMENTATION SCHEDULE

### Morning (4h): Foundation
| Time | Task |
|------|------|
| 9:00-9:30 | Set up Maven project, add dependencies, folder structure |
| 9:30-10:00 | Create entities: `BaseEntity`, `User`, `Task`, `Comment`, `TaskHistory` |
| 10:00-10:30 | Create repositories + `TaskSpecification` |
| 10:30-11:00 | Create all DTOs (request + response) |
| 11:00-11:30 | JWT security: `JwtUtils`, `JwtAuthenticationFilter`, `UserPrincipal` |
| 11:30-12:00 | `SecurityConfig`, `AuditConfig`, `OpenApiConfig` |

### Afternoon (4h): Business Logic + APIs
| Time | Task |
|------|------|
| 12:00-13:00 | `AuthService` (register/login) + `AuthController` |
| 13:00-14:30 | `TaskService` (full CRUD + dashboard) + `TaskController` |
| 14:30-15:00 | `CommentService` + `CommentController` + `UserController` |
| 15:00-15:30 | `GlobalExceptionHandler` + `MapperUtil` |
| 15:30-16:00 | `schema.sql`, `data.sql`, `application.yml` |

### Evening (2h): DevOps + Polish
| Time | Task |
|------|------|
| 16:00-16:30 | Write unit tests (`TaskServiceTest`, `AuthServiceTest`) |
| 16:30-17:00 | Dockerfile + docker-compose.yml |
| 17:00-17:30 | GitHub Actions workflow, `.gitignore`, `.env.example` |
| 17:30-18:00 | README.md, Postman collection, push to GitHub |

---

## 🏆 TIPS FOR THE INTERVIEW

1. **Run the project before the interview** — boot it with Docker, hit the Swagger UI, walk through a full flow (register → login → create task → update status → view dashboard)

2. **Know the JWT flow cold** — draw it on a whiteboard: Login → BCrypt verify → JWT generate → Client stores → Client sends → Filter validates → SecurityContext set

3. **Be ready to explain every annotation** — `@Transactional(readOnly = true)`, `@EnableJpaAuditing`, `@PreAuthorize`, `@RestControllerAdvice`, `@MappedSuperclass`

4. **Discuss what you'd add next** — refresh tokens, Redis caching for dashboard stats, email notifications on task assignment, rate limiting, Flyway/Liquibase for DB migrations

5. **Mention the design decisions** — why Specification over string JPQL, why DTOs over entities, why stateless JWT over sessions. Interviewers love hearing you articulate trade-offs.
