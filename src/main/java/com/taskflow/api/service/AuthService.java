package com.taskflow.api.service;

import com.taskflow.api.dto.request.AuthRequest;
import com.taskflow.api.dto.response.ResponseDTOs;

public interface AuthService {
    ResponseDTOs.AuthResponse register(AuthRequest.Register request);
    ResponseDTOs.AuthResponse login(AuthRequest.Login request);
}
