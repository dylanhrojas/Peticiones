package com.prayerwall.controller;

import com.prayerwall.dto.AuthResponse;
import com.prayerwall.dto.UpdateProfileRequest;
import com.prayerwall.model.User;
import com.prayerwall.repository.UserRepository;
import com.prayerwall.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(
                user.getId(), token, user.getName(), user.getEmail(), user.getCountry(), user.getPhotoUrl()));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestBody UpdateProfileRequest dto,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName().trim());
        }
        if (dto.getCountry() != null) {
            user.setCountry(dto.getCountry().trim());
        }

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(
                user.getId(), token, user.getName(), user.getEmail(), user.getCountry(), user.getPhotoUrl()));
    }
}
