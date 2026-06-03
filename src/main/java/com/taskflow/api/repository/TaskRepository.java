package com.taskflow.api.repository;

import com.taskflow.api.entity.Task;
import com.taskflow.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>,
        JpaSpecificationExecutor<Task> {

    Page<Task> findByAssignee(User assignee, Pageable pageable);

    Page<Task> findByReporter(User reporter, Pageable pageable);

    Page<Task> findByStatus(Task.Status status, Pageable pageable);

    Page<Task> findByPriority(Task.Priority priority, Pageable pageable);

    // Dashboard statistics
    long countByStatus(Task.Status status);

    long countByPriority(Task.Priority priority);

    long countByAssignee(User assignee);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status NOT IN ('RESOLVED', 'CLOSED') " +
           "AND t.dueDate < CURRENT_DATE")
    long countOverdueTasks();

    @Query("SELECT t.status, COUNT(t) FROM Task t GROUP BY t.status")
    List<Object[]> countTasksGroupedByStatus();

    @Query("SELECT t.priority, COUNT(t) FROM Task t GROUP BY t.priority")
    List<Object[]> countTasksGroupedByPriority();

    @Query("SELECT t.type, COUNT(t) FROM Task t GROUP BY t.type")
    List<Object[]> countTasksGroupedByType();

    // Assignee workload
    @Query("SELECT u.username, COUNT(t) FROM Task t JOIN t.assignee u " +
           "WHERE t.status NOT IN ('RESOLVED', 'CLOSED') GROUP BY u.username ORDER BY COUNT(t) DESC")
    List<Object[]> getAssigneeWorkload();

    // Full-text search across title and description
    @Query("SELECT t FROM Task t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Task> searchTasks(@Param("query") String query, Pageable pageable);
}
