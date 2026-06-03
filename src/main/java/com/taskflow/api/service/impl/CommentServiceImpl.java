package com.taskflow.api.service.impl;

import com.taskflow.api.dto.request.CommentRequest;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.Comment;
import com.taskflow.api.entity.Task;
import com.taskflow.api.entity.User;
import com.taskflow.api.exception.TaskFlowException;
import com.taskflow.api.repository.CommentRepository;
import com.taskflow.api.repository.TaskRepository;
import com.taskflow.api.repository.UserRepository;
import com.taskflow.api.service.CommentService;
import com.taskflow.api.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public ResponseDTOs.CommentResponse addComment(Long taskId, CommentRequest request, String username) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("Task", "id", taskId));
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("User", "username", username));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .author(author)
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("Comment added to task {}, by {}", taskId, username);
        return MapperUtil.toCommentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResponseDTOs.CommentResponse> getComments(Long taskId, Pageable pageable) {
        if (!taskRepository.existsById(taskId)) {
            throw new TaskFlowException.ResourceNotFoundException("Task", "id", taskId);
        }
        return commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable)
                .map(MapperUtil::toCommentResponse);
    }

    @Override
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("Comment", "id", commentId));

        // Only author or admin can delete
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("User", "username", username));

        boolean isAuthor = comment.getAuthor().getUsername().equals(username);
        boolean isAdmin = requester.getRole() == User.Role.ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new TaskFlowException.AccessDeniedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted by {}", commentId, username);
    }
}
