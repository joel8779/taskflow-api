package com.taskflow.api.service.impl;

import com.taskflow.api.dto.request.TaskRequest;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.*;
import com.taskflow.api.exception.TaskFlowException;
import com.taskflow.api.repository.TaskRepository;
import com.taskflow.api.repository.TaskSpecification;
import com.taskflow.api.repository.UserRepository;
import com.taskflow.api.service.TaskService;
import com.taskflow.api.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public ResponseDTOs.TaskDetail createTask(TaskRequest.Create request, String creatorUsername) {
        User reporter = findUserByUsername(creatorUsername);
        User assignee = request.getAssigneeId() != null
                ? findUserById(request.getAssigneeId())
                : null;

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .status(Task.Status.OPEN)
                .dueDate(request.getDueDate())
                .reporter(reporter)
                .assignee(assignee)
                .tags(request.getTags())
                .build();

        Task saved = taskRepository.save(task);
        recordHistory(saved, "status", null, Task.Status.OPEN.name(), creatorUsername);

        log.info("Task created: id={}, title='{}', by={}", saved.getId(), saved.getTitle(), creatorUsername);
        return MapperUtil.toTaskDetail(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseDTOs.TaskDetail getTaskById(Long id) {
        Task task = findTaskById(id);
        return MapperUtil.toTaskDetail(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResponseDTOs.TaskSummary> getAllTasks(
            Task.Status status, Task.Priority priority, Task.TaskType type,
            Long assigneeId, String search, Pageable pageable) {

        Specification<Task> spec = TaskSpecification.withFilters(status, priority, type, assigneeId, search);
        return taskRepository.findAll(spec, pageable)
                .map(MapperUtil::toTaskSummary);
    }

    @Override
    public ResponseDTOs.TaskDetail updateTask(Long id, TaskRequest.Update request, String username) {
        Task task = findTaskById(id);
        User updater = findUserByUsername(username);

        if (request.getTitle() != null && !request.getTitle().equals(task.getTitle())) {
            recordHistory(task, "title", task.getTitle(), request.getTitle(), username);
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null && !request.getStatus().equals(task.getStatus())) {
            recordHistory(task, "status", task.getStatus().name(), request.getStatus().name(), username);
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null && !request.getPriority().equals(task.getPriority())) {
            recordHistory(task, "priority", task.getPriority().name(), request.getPriority().name(), username);
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getAssigneeId() != null) {
            User newAssignee = findUserById(request.getAssigneeId());
            String oldAssignee = task.getAssignee() != null ? task.getAssignee().getUsername() : "Unassigned";
            recordHistory(task, "assignee", oldAssignee, newAssignee.getUsername(), username);
            task.setAssignee(newAssignee);
        }
        if (request.getTags() != null) {
            task.setTags(request.getTags());
        }
        if (request.getResolutionNotes() != null) {
            task.setResolutionNotes(request.getResolutionNotes());
        }

        Task saved = taskRepository.save(task);
        log.info("Task updated: id={}, by={}", id, username);
        return MapperUtil.toTaskDetail(saved);
    }

    @Override
    public ResponseDTOs.TaskDetail updateTaskStatus(Long id, TaskRequest.StatusUpdate request, String username) {
        Task task = findTaskById(id);

        if (task.getStatus().equals(request.getStatus())) {
            throw new TaskFlowException.BusinessException(
                "Task is already in status: " + request.getStatus());
        }

        recordHistory(task, "status", task.getStatus().name(), request.getStatus().name(), username);
        task.setStatus(request.getStatus());

        if (request.getResolutionNotes() != null) {
            task.setResolutionNotes(request.getResolutionNotes());
        }

        Task saved = taskRepository.save(task);
        log.info("Task status updated: id={}, status={}, by={}", id, request.getStatus(), username);
        return MapperUtil.toTaskDetail(saved);
    }

    @Override
    public void deleteTask(Long id, String username) {
        Task task = findTaskById(id);
        taskRepository.delete(task);
        log.info("Task deleted: id={}, by={}", id, username);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseDTOs.DashboardStats getDashboardStats() {
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : taskRepository.countTasksGroupedByStatus()) {
            byStatus.put(((Task.Status) row[0]).name(), (Long) row[1]);
        }

        Map<String, Long> byPriority = new HashMap<>();
        for (Object[] row : taskRepository.countTasksGroupedByPriority()) {
            byPriority.put(((Task.Priority) row[0]).name(), (Long) row[1]);
        }

        Map<String, Long> byType = new HashMap<>();
        for (Object[] row : taskRepository.countTasksGroupedByType()) {
            byType.put(((Task.TaskType) row[0]).name(), (Long) row[1]);
        }

        Map<String, Long> assigneeWorkload = new HashMap<>();
        for (Object[] row : taskRepository.getAssigneeWorkload()) {
            assigneeWorkload.put((String) row[0], (Long) row[1]);
        }

        return ResponseDTOs.DashboardStats.builder()
                .totalTasks(taskRepository.count())
                .totalIncidents(byType.getOrDefault("INCIDENT", 0L))
                .openItems(byStatus.getOrDefault("OPEN", 0L))
                .inProgressItems(byStatus.getOrDefault("IN_PROGRESS", 0L))
                .resolvedItems(byStatus.getOrDefault("RESOLVED", 0L))
                .overdueItems(taskRepository.countOverdueTasks())
                .criticalItems(byPriority.getOrDefault("CRITICAL", 0L))
                .byStatus(byStatus)
                .byPriority(byPriority)
                .byType(byType)
                .assigneeWorkload(assigneeWorkload)
                .build();
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private Task findTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("Task", "id", id));
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("User", "username", username));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("User", "id", id));
    }

    private void recordHistory(Task task, String field, String oldVal, String newVal, String changedBy) {
        TaskHistory history = TaskHistory.builder()
                .task(task)
                .fieldName(field)
                .oldValue(oldVal)
                .newValue(newVal)
                .changedBy(changedBy)
                .build();
        task.getHistory().add(history);
    }
}
