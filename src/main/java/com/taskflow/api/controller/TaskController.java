package com.taskflow.api.controller;

import com.taskflow.api.dto.request.TaskRequest;
import com.taskflow.api.dto.response.ApiResponse;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.Task;
import com.taskflow.api.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task and incident lifecycle management")
public class TaskController {

    private final TaskService taskService;

    // Valid sort fields to prevent invalid property exceptions
    private static final Set<String> VALID_SORT_FIELDS = Set.of(
        "id", "title", "status", "priority", "type", "dueDate", "createdAt", "updatedAt"
    );

    @PostMapping
    @Operation(summary = "Create task/incident", description = "Create a new task or incident")
    public ResponseEntity<ApiResponse<ResponseDTOs.TaskDetail>> create(
            @Valid @RequestBody TaskRequest.Create request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResponseDTOs.TaskDetail task = taskService.createTask(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Task created successfully", task));
    }

    @GetMapping
    @Operation(summary = "List all tasks", description = "Get paginated list of tasks with optional filters")
    public ResponseEntity<ApiResponse<Page<ResponseDTOs.TaskSummary>>> getAll(

            @Parameter(description = "Filter by status: OPEN | IN_PROGRESS | UNDER_REVIEW | RESOLVED | CLOSED")
            @RequestParam(required = false) Task.Status status,

            @Parameter(description = "Filter by priority: LOW | MEDIUM | HIGH | CRITICAL")
            @RequestParam(required = false) Task.Priority priority,

            @Parameter(description = "Filter by type: TASK | INCIDENT | BUG | FEATURE")
            @RequestParam(required = false) Task.TaskType type,

            @Parameter(description = "Filter by assignee user ID")
            @RequestParam(required = false) Long assigneeId,

            @Parameter(description = "Search in title and description")
            @RequestParam(required = false) String search,

            @Parameter(description = "Page number (0-based), default: 0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size, default: 20")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Sort field: id | title | status | priority | createdAt | dueDate, default: createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,

            @Parameter(description = "Sort direction: asc | desc, default: desc")
            @RequestParam(defaultValue = "desc") String sortDir) {

        // Sanitize sort field — fall back to createdAt if invalid to prevent 500
        String safeSortBy = VALID_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(100, Math.max(1, size)),
                Sort.by(direction, safeSortBy)
        );

        Page<ResponseDTOs.TaskSummary> tasks =
                taskService.getAllTasks(status, priority, type, assigneeId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<ApiResponse<ResponseDTOs.TaskDetail>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task", description = "Full update of task fields")
    public ResponseEntity<ApiResponse<ResponseDTOs.TaskDetail>> update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest.Update request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResponseDTOs.TaskDetail updated = taskService.updateTask(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task status", description = "Quick status transition with optional resolution notes")
    public ResponseEntity<ApiResponse<ResponseDTOs.TaskDetail>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest.StatusUpdate request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResponseDTOs.TaskDetail updated = taskService.updateTaskStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete task (Admin only)")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        taskService.deleteTask(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Dashboard statistics", description = "Aggregated task stats for dashboard")
    public ResponseEntity<ApiResponse<ResponseDTOs.DashboardStats>> dashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(taskService.getDashboardStats()));
    }
}
