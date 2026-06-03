package com.taskflow.api.controller;

import com.taskflow.api.dto.request.CommentRequest;
import com.taskflow.api.dto.response.ApiResponse;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.exception.TaskFlowException;
import com.taskflow.api.repository.TaskRepository;
import com.taskflow.api.service.CommentService;
import com.taskflow.api.util.MapperUtil;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Comments & History", description = "Task comments and change history")
public class CommentController {

    private final CommentService commentService;
    private final TaskRepository taskRepository;

    // ── COMMENTS ─────────────────────────────────────────────────────

    @PostMapping("/{taskId}/comments")
    @Operation(summary = "Add comment to task")
    public ResponseEntity<ApiResponse<ResponseDTOs.CommentResponse>> addComment(
            @PathVariable Long taskId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResponseDTOs.CommentResponse comment =
                commentService.addComment(taskId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Comment added", comment));
    }

    @GetMapping("/{taskId}/comments")
    @Operation(summary = "Get task comments (paginated)")
    public ResponseEntity<ApiResponse<Page<ResponseDTOs.CommentResponse>>> getComments(
            @PathVariable Long taskId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(
                commentService.getComments(taskId, pageable)));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        commentService.deleteComment(commentId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    // ── HISTORY ──────────────────────────────────────────────────────

    @GetMapping("/{taskId}/history")
    @Operation(summary = "Get task change history audit trail")
    public ResponseEntity<ApiResponse<List<ResponseDTOs.HistoryResponse>>> getHistory(
            @PathVariable Long taskId) {

        var task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("Task", "id", taskId));

        List<ResponseDTOs.HistoryResponse> history = task.getHistory()
                .stream()
                .map(MapperUtil::toHistoryResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
