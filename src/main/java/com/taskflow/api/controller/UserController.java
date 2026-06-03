package com.taskflow.api.controller;

import com.taskflow.api.dto.response.ApiResponse;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.User;
import com.taskflow.api.exception.TaskFlowException;
import com.taskflow.api.repository.UserRepository;
import com.taskflow.api.util.MapperUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management and profile endpoints")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<ResponseDTOs.UserSummary>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException(
                        "User", "username", userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(MapperUtil.toUserSummary(user)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users (Admin only)")
    public ResponseEntity<ApiResponse<List<ResponseDTOs.UserSummary>>> getAllUsers() {
        List<ResponseDTOs.UserSummary> users = userRepository.findByIsActiveTrue()
                .stream()
                .map(MapperUtil::toUserSummary)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<ResponseDTOs.UserSummary>> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(ApiResponse.success(MapperUtil.toUserSummary(user)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate user (Admin only)")
    public ResponseEntity<ApiResponse<ResponseDTOs.UserSummary>> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("User", "id", id));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", MapperUtil.toUserSummary(user)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role (Admin only)")
    public ResponseEntity<ApiResponse<ResponseDTOs.UserSummary>> updateRole(
            @PathVariable Long id,
            @RequestParam User.Role role) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new TaskFlowException.ResourceNotFoundException("User", "id", id));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Role updated", MapperUtil.toUserSummary(user)));
    }
}
