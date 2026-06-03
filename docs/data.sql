-- ============================================================
-- TaskFlow API - Sample Seed Data
-- admin123 and user123 are BCrypt (cost=10) encoded below
-- ============================================================

-- Admin user  (password: admin123)
INSERT INTO users (username, email, password, full_name, department, role, created_by)
VALUES ('admin', 'admin@taskflow.com',
        '$2b$10$7ZPq9jg3/rgBnzftidHTpOHgVoXfuwxaanarTmntxUGblxpperMnG',
        'System Administrator', 'IT', 'ADMIN', 'system')
ON CONFLICT (username) DO NOTHING;

-- Regular users  (password: user123)
INSERT INTO users (username, email, password, full_name, department, role, created_by)
VALUES
    ('alice.johnson', 'alice@taskflow.com',
     '$2b$10$rTD5ZxeRnv87nQa9TWeZg.QC4o1p237zHpJSHL13WsJfp35JV425m',
     'Alice Johnson', 'Engineering', 'USER', 'system'),
    ('bob.smith', 'bob@taskflow.com',
     '$2b$10$rTD5ZxeRnv87nQa9TWeZg.QC4o1p237zHpJSHL13WsJfp35JV425m',
     'Bob Smith', 'QA', 'USER', 'system'),
    ('charlie.dev', 'charlie@taskflow.com',
     '$2b$10$rTD5ZxeRnv87nQa9TWeZg.QC4o1p237zHpJSHL13WsJfp35JV425m',
     'Charlie Dev', 'Engineering', 'USER', 'system')
ON CONFLICT (username) DO NOTHING;

-- Sample tasks
INSERT INTO tasks (title, description, type, status, priority, due_date, reporter_id, assignee_id, tags, created_by)
SELECT
    'Authentication service intermittently failing',
    'Users report 401 errors randomly when the auth service is under load. Reproducible at ~500 req/s.',
    'INCIDENT', 'IN_PROGRESS', 'CRITICAL',
    CURRENT_DATE + INTERVAL '2 days',
    u_admin.id, u_alice.id,
    'auth,production,urgent',
    'admin'
FROM users u_admin, users u_alice
WHERE u_admin.username = 'admin' AND u_alice.username = 'alice.johnson';

INSERT INTO tasks (title, description, type, status, priority, due_date, reporter_id, assignee_id, tags, created_by)
SELECT
    'Implement JWT refresh token mechanism',
    'Add refresh token support to extend sessions without forcing re-login.',
    'FEATURE', 'OPEN', 'HIGH',
    CURRENT_DATE + INTERVAL '7 days',
    u_admin.id, u_alice.id,
    'auth,security,backend',
    'admin'
FROM users u_admin, users u_alice
WHERE u_admin.username = 'admin' AND u_alice.username = 'alice.johnson';

INSERT INTO tasks (title, description, type, status, priority, due_date, reporter_id, assignee_id, tags, created_by)
SELECT
    'Database query optimization for task listing',
    'The /api/v1/tasks endpoint takes 800ms+ under load. N+1 query issue suspected.',
    'BUG', 'OPEN', 'MEDIUM',
    CURRENT_DATE + INTERVAL '5 days',
    u_bob.id, u_charlie.id,
    'performance,database',
    'bob.smith'
FROM users u_bob, users u_charlie
WHERE u_bob.username = 'bob.smith' AND u_charlie.username = 'charlie.dev';

INSERT INTO tasks (title, description, type, status, priority, reporter_id, tags, created_by)
SELECT
    'Update API documentation for v2 endpoints',
    'Swagger annotations need to be updated to reflect the new v2 API contract.',
    'TASK', 'RESOLVED', 'LOW',
    u_admin.id,
    'docs,swagger',
    'admin'
FROM users u_admin
WHERE u_admin.username = 'admin';

-- Sample comments
INSERT INTO comments (content, task_id, author_id, created_by)
SELECT
    'Investigated the issue. Root cause found in session management under high GC pressure.',
    t.id, u.id, 'alice.johnson'
FROM tasks t, users u
WHERE t.title = 'Authentication service intermittently failing'
  AND u.username = 'alice.johnson';
