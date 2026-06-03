package com.taskflow.api.service;

import com.taskflow.api.dto.request.CommentRequest;
import com.taskflow.api.dto.response.ResponseDTOs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    ResponseDTOs.CommentResponse addComment(Long taskId, CommentRequest request, String username);
    Page<ResponseDTOs.CommentResponse> getComments(Long taskId, Pageable pageable);
    void deleteComment(Long commentId, String username);
}
