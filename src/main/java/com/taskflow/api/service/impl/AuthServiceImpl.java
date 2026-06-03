package com.taskflow.api.service.impl;

import com.taskflow.api.dto.request.AuthRequest;
import com.taskflow.api.dto.response.ResponseDTOs;
import com.taskflow.api.entity.User;
import com.taskflow.api.exception.TaskFlowException;
import com.taskflow.api.repository.UserRepository;
import com.taskflow.api.security.JwtUtils;
import com.taskflow.api.security.UserPrincipal;
import com.taskflow.api.service.AuthService;
import com.taskflow.api.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Override
    public ResponseDTOs.AuthResponse register(AuthRequest.Register request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new TaskFlowException.DuplicateResourceException(
                "Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new TaskFlowException.DuplicateResourceException(
                "Email '" + request.getEmail() + "' is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .department(request.getDepartment())
                .role(User.Role.USER)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {} ({})", saved.getUsername(), saved.getEmail());

        String token = jwtUtils.generateToken(
            saved.getUsername(),
            Map.of("role", saved.getRole().name(), "userId", saved.getId())
        );

        return ResponseDTOs.AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtils.getExpirationMs())
                .user(MapperUtil.toUserSummary(saved))
                .build();
    }

    @Override
    public ResponseDTOs.AuthResponse login(AuthRequest.Login request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsernameOrEmail(),
                request.getPassword()
            )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        String token = jwtUtils.generateToken(
            user.getUsername(),
            Map.of("role", user.getRole().name(), "userId", user.getId())
        );

        log.info("User logged in: {}", user.getUsername());

        return ResponseDTOs.AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtils.getExpirationMs())
                .user(MapperUtil.toUserSummary(user))
                .build();
    }
}
