-- ============================================================
-- TaskFlow API - Database Schema
-- PostgreSQL 16+
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100),
    department  VARCHAR(20),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER'
                    CHECK (role IN ('ADMIN', 'USER')),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    type             VARCHAR(20)  NOT NULL DEFAULT 'TASK'
                         CHECK (type IN ('TASK', 'INCIDENT', 'BUG', 'FEATURE')),
    status           VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                         CHECK (status IN ('OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED')),
    priority         VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM'
                         CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    due_date         DATE,
    assignee_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reporter_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    resolution_notes TEXT,
    tags             VARCHAR(200),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id         BIGSERIAL PRIMARY KEY,
    content    TEXT         NOT NULL,
    task_id    BIGINT       NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id  BIGINT       NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Task history / audit trail
CREATE TABLE IF NOT EXISTS task_history (
    id          BIGSERIAL PRIMARY KEY,
    task_id     BIGINT       NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    field_name  VARCHAR(50)  NOT NULL,
    old_value   VARCHAR(200),
    new_value   VARCHAR(200),
    changed_by  VARCHAR(100) NOT NULL,
    changed_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_username  ON users(username);
CREATE INDEX IF NOT EXISTS idx_task_status    ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_priority  ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_task_assignee  ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_type      ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_comment_task   ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_history_task   ON task_history(task_id);
