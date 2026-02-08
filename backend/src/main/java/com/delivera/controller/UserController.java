package com.delivera.controller;

import com.delivera.dto.ProfileResponse;
import com.delivera.repository.UserRepository;
import com.delivera.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Token no proporcionado"));
        }

        try {
            String email = jwtService.parseToken(authHeader.substring(7));

            return userRepository.findByEmail(email)
                    .map(user -> ResponseEntity.ok(new ProfileResponse(
                            user.getId(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getPhone(),
                            user.getCreatedAt()
                    )))
                    .orElse(ResponseEntity.status(404).body(null));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Token inválido o expirado"));
        }
    }
}
