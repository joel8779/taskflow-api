package com.taskflow.api.service;

import com.taskflow.api.dto.request.AuthRequest;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.User;
import com.taskflow.api.exception.TaskFlowException;
import com.taskflow.api.repository.UserRepository;
import com.taskflow.api.security.JwtUtils;
import com.taskflow.api.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private AuthRequest.Register registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new AuthRequest.Register();
        registerRequest.setUsername("newuser");
        registerRequest.setEmail("newuser@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("New User");
        registerRequest.setDepartment("Engineering");
    }

    @Test
    @DisplayName("Register succeeds with unique username and email")
    void register_withValidData_returnsAuthResponse() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(1L).username("newuser").email("newuser@example.com")
                .password("encodedPassword").fullName("New User")
                .role(User.Role.USER).isActive(true).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtils.generateToken(anyString(), anyMap())).thenReturn("mock-jwt-token");
        when(jwtUtils.getExpirationMs()).thenReturn(86400000L);

        ResponseDTOs.AuthResponse result = authService.register(registerRequest);

        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("mock-jwt-token");
        assertThat(result.getUser().getUsername()).isEqualTo("newuser");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register fails when username already taken")
    void register_withDuplicateUsername_throwsDuplicateException() {
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(TaskFlowException.DuplicateResourceException.class)
                .hasMessageContaining("Username");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register fails when email already registered")
    void register_withDuplicateEmail_throwsDuplicateException() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(TaskFlowException.DuplicateResourceException.class)
                .hasMessageContaining("Email");
    }
}
