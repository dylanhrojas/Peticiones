package com.prayerwall.controller;

import com.prayerwall.dto.AuthResponse;
import com.prayerwall.dto.GoogleAuthRequest;
import com.prayerwall.dto.LoginRequest;
import com.prayerwall.dto.RegisterRequest;
import com.prayerwall.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.googleAuth(request.getCredential()));
    }
}
