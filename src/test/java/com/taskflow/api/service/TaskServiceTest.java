package com.taskflow.api.service;

import com.taskflow.api.dto.request.TaskRequest;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.Task;
import com.taskflow.api.entity.User;
import com.taskflow.api.exception.TaskFlowException;
import com.taskflow.api.repository.TaskRepository;
import com.taskflow.api.repository.UserRepository;
import com.taskflow.api.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private User mockUser;
    private Task mockTask;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .role(User.Role.USER)
                .isActive(true)
                .build();

        mockTask = Task.builder()
                .id(1L)
                .title("Fix login bug")
                .description("Users cannot log in with special characters")
                .type(Task.TaskType.BUG)
                .status(Task.Status.OPEN)
                .priority(Task.Priority.HIGH)
                .reporter(mockUser)
                .comments(new ArrayList<>())
                .history(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("createTask()")
    class CreateTaskTests {

        @Test
        @DisplayName("Should create task successfully with valid input")
        void createTask_withValidInput_returnsTaskDetail() {
            TaskRequest.Create request = new TaskRequest.Create();
            request.setTitle("Fix login bug");
            request.setDescription("Users cannot log in");
            request.setType(Task.TaskType.BUG);
            request.setPriority(Task.Priority.HIGH);

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
            when(taskRepository.save(any(Task.class))).thenReturn(mockTask);

            ResponseDTOs.TaskDetail result = taskService.createTask(request, "testuser");

            assertThat(result).isNotNull();
            assertThat(result.getTitle()).isEqualTo("Fix login bug");
            assertThat(result.getStatus()).isEqualTo(Task.Status.OPEN);
            assertThat(result.getPriority()).isEqualTo(Task.Priority.HIGH);
            verify(taskRepository, times(1)).save(any(Task.class));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when reporter not found")
        void createTask_withInvalidUser_throwsNotFoundException() {
            TaskRequest.Create request = new TaskRequest.Create();
            request.setTitle("Task title");
            request.setType(Task.TaskType.TASK);

            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.createTask(request, "unknown"))
                    .isInstanceOf(TaskFlowException.ResourceNotFoundException.class)
                    .hasMessageContaining("User");
        }

        @Test
        @DisplayName("Should assign task to assignee when assigneeId provided")
        void createTask_withAssigneeId_setsAssignee() {
            User assignee = User.builder().id(2L).username("assignee")
                    .role(User.Role.USER).isActive(true).build();

            TaskRequest.Create request = new TaskRequest.Create();
            request.setTitle("Assigned task");
            request.setType(Task.TaskType.TASK);
            request.setAssigneeId(2L);

            Task taskWithAssignee = Task.builder()
                    .id(2L).title("Assigned task")
                    .type(Task.TaskType.TASK).status(Task.Status.OPEN)
                    .priority(Task.Priority.MEDIUM)
                    .reporter(mockUser).assignee(assignee)
                    .comments(new ArrayList<>()).history(new ArrayList<>())
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
            when(userRepository.findById(2L)).thenReturn(Optional.of(assignee));
            when(taskRepository.save(any(Task.class))).thenReturn(taskWithAssignee);

            ResponseDTOs.TaskDetail result = taskService.createTask(request, "testuser");

            assertThat(result.getAssignee()).isNotNull();
            assertThat(result.getAssignee().getUsername()).isEqualTo("assignee");
        }
    }

    @Nested
    @DisplayName("updateTaskStatus()")
    class UpdateStatusTests {

        @Test
        @DisplayName("Should update status successfully")
        void updateStatus_withValidTransition_updatesSuccessfully() {
            TaskRequest.StatusUpdate request = new TaskRequest.StatusUpdate();
            request.setStatus(Task.Status.IN_PROGRESS);

            when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));
            when(taskRepository.save(any(Task.class))).thenReturn(mockTask);

            ResponseDTOs.TaskDetail result = taskService.updateTaskStatus(1L, request, "testuser");

            assertThat(result).isNotNull();
            verify(taskRepository).save(any(Task.class));
        }

        @Test
        @DisplayName("Should throw BusinessException when transitioning to same status")
        void updateStatus_toSameStatus_throwsBusinessException() {
            TaskRequest.StatusUpdate request = new TaskRequest.StatusUpdate();
            request.setStatus(Task.Status.OPEN); // Already OPEN

            when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));

            assertThatThrownBy(() -> taskService.updateTaskStatus(1L, request, "testuser"))
                    .isInstanceOf(TaskFlowException.BusinessException.class)
                    .hasMessageContaining("already in status");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for non-existent task")
        void updateStatus_nonExistentTask_throwsNotFoundException() {
            TaskRequest.StatusUpdate request = new TaskRequest.StatusUpdate();
            request.setStatus(Task.Status.IN_PROGRESS);

            when(taskRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.updateTaskStatus(99L, request, "testuser"))
                    .isInstanceOf(TaskFlowException.ResourceNotFoundException.class)
                    .hasMessageContaining("Task");
        }
    }

    @Nested
    @DisplayName("getTaskById()")
    class GetTaskTests {

        @Test
        @DisplayName("Should return task detail for valid ID")
        void getTaskById_withValidId_returnsTaskDetail() {
            when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));

            ResponseDTOs.TaskDetail result = taskService.getTaskById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getTitle()).isEqualTo("Fix login bug");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for unknown ID")
        void getTaskById_withInvalidId_throwsNotFoundException() {
            when(taskRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.getTaskById(999L))
                    .isInstanceOf(TaskFlowException.ResourceNotFoundException.class);
        }
    }
}
