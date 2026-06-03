package com.taskflow.api.service;

import com.taskflow.api.dto.request.TaskRequest;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    ResponseDTOs.TaskDetail createTask(TaskRequest.Create request, String creatorUsername);
    ResponseDTOs.TaskDetail getTaskById(Long id);
    Page<ResponseDTOs.TaskSummary> getAllTasks(
        Task.Status status,
        Task.Priority priority,
        Task.TaskType type,
        Long assigneeId,
        String search,
        Pageable pageable);
    ResponseDTOs.TaskDetail updateTask(Long id, TaskRequest.Update request, String username);
    ResponseDTOs.TaskDetail updateTaskStatus(Long id, TaskRequest.StatusUpdate request, String username);
    void deleteTask(Long id, String username);
    ResponseDTOs.DashboardStats getDashboardStats();
}
