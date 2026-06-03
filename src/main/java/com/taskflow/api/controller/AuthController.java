package com.taskflow.api.controller;

import com.taskflow.api.dto.request.AuthRequest;
import com.taskflow.api.dto.response.ApiResponse;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration and login endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new USER account and returns JWT token")
    public ResponseEntity<ApiResponse<ResponseDTOs.AuthResponse>> register(
            @Valid @RequestBody AuthRequest.Register request) {

        ResponseDTOs.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate with username/email and password")
    public ResponseEntity<ApiResponse<ResponseDTOs.AuthResponse>> login(
            @Valid @RequestBody AuthRequest.Login request) {

        ResponseDTOs.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
