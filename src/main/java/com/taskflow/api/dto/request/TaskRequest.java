package com.taskflow.api.dto.request;

import com.taskflow.api.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

public class TaskRequest {

    @Data
    public static class Create {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
        private String title;

        @Size(max = 5000, message = "Description cannot exceed 5000 characters")
        private String description;

        @NotNull(message = "Task type is required")
        private Task.TaskType type;

        private Task.Priority priority = Task.Priority.MEDIUM;

        private LocalDate dueDate;

        private Long assigneeId;

        @Size(max = 200)
        private String tags;
    }

    @Data
    public static class Update {
        @Size(min = 5, max = 200)
        private String title;

        @Size(max = 5000)
        private String description;

        private Task.Status status;

        private Task.Priority priority;

        private LocalDate dueDate;

        private Long assigneeId;

        @Size(max = 200)
        private String tags;

        @Size(max = 2000)
        private String resolutionNotes;
    }

    @Data
    public static class StatusUpdate {
        @NotNull(message = "Status is required")
        private Task.Status status;

        @Size(max = 2000)
        private String resolutionNotes;
    }
}
