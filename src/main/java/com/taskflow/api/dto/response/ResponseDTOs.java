package com.taskflow.api.dto.response;

import com.taskflow.api.entity.Task;
import com.taskflow.api.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public class ResponseDTOs {

    // ──────────────── AUTH ────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String tokenType;
        private Long expiresIn;
        private UserSummary user;
    }

    // ──────────────── USER ────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String department;
        private User.Role role;
        private Boolean isActive;
    }

    // ──────────────── TASK ────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskSummary {
        private Long id;
        private String title;
        private Task.TaskType type;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDate dueDate;
        private boolean overdue;
        private UserSummary assignee;
        private UserSummary reporter;
        private int commentCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskDetail {
        private Long id;
        private String title;
        private String description;
        private Task.TaskType type;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDate dueDate;
        private boolean overdue;
        private String tags;
        private String resolutionNotes;
        private UserSummary assignee;
        private UserSummary reporter;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String createdBy;
    }

    // ──────────────── COMMENT ────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentResponse {
        private Long id;
        private String content;
        private UserSummary author;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ──────────────── HISTORY ────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryResponse {
        private Long id;
        private String fieldName;
        private String oldValue;
        private String newValue;
        private String changedBy;
        private LocalDateTime changedAt;
    }

    // ──────────────── DASHBOARD ────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private long totalTasks;
        private long totalIncidents;
        private long openItems;
        private long inProgressItems;
        private long resolvedItems;
        private long overdueItems;
        private long criticalItems;
        private Map<String, Long> byStatus;
        private Map<String, Long> byPriority;
        private Map<String, Long> byType;
        private Map<String, Long> assigneeWorkload;
    }
}
