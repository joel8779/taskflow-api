package com.taskflow.api.util;

import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.Comment;
import com.taskflow.api.entity.Task;
import com.taskflow.api.entity.TaskHistory;
import com.taskflow.api.entity.User;

import java.time.LocalDate;

/**
 * Centralized mapper utility for converting entities to DTOs.
 * Keeps mapping logic out of service/controller layers.
 */
public class MapperUtil {

    private MapperUtil() {}

    public static ResponseDTOs.UserSummary toUserSummary(User user) {
        if (user == null) return null;
        return ResponseDTOs.UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }

    public static ResponseDTOs.TaskSummary toTaskSummary(Task task) {
        return ResponseDTOs.TaskSummary.builder()
                .id(task.getId())
                .title(task.getTitle())
                .type(task.getType())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .overdue(isOverdue(task))
                .assignee(toUserSummary(task.getAssignee()))
                .reporter(toUserSummary(task.getReporter()))
                .commentCount(task.getComments() != null ? task.getComments().size() : 0)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    public static ResponseDTOs.TaskDetail toTaskDetail(Task task) {
        return ResponseDTOs.TaskDetail.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .type(task.getType())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .overdue(isOverdue(task))
                .tags(task.getTags())
                .resolutionNotes(task.getResolutionNotes())
                .assignee(toUserSummary(task.getAssignee()))
                .reporter(toUserSummary(task.getReporter()))
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .createdBy(task.getCreatedBy())
                .build();
    }

    public static ResponseDTOs.CommentResponse toCommentResponse(Comment comment) {
        return ResponseDTOs.CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(toUserSummary(comment.getAuthor()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    public static ResponseDTOs.HistoryResponse toHistoryResponse(TaskHistory history) {
        return ResponseDTOs.HistoryResponse.builder()
                .id(history.getId())
                .fieldName(history.getFieldName())
                .oldValue(history.getOldValue())
                .newValue(history.getNewValue())
                .changedBy(history.getChangedBy())
                .changedAt(history.getChangedAt())
                .build();
    }

    private static boolean isOverdue(Task task) {
        return task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != Task.Status.RESOLVED
                && task.getStatus() != Task.Status.CLOSED;
    }
}
