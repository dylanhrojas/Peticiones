package com.prayerwall.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.prayerwall.dto.AuthResponse;
import com.prayerwall.dto.LoginRequest;
import com.prayerwall.dto.RegisterRequest;
import com.prayerwall.model.User;
import com.prayerwall.repository.UserRepository;
import com.prayerwall.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id:REPLACE_ME}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe una cuenta con este correo");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCountry(request.getCountry());
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(user.getId(), token, user.getName(), user.getEmail(), user.getCountry(), user.getPhotoUrl());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Correo o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Correo o contraseña incorrectos");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(user.getId(), token, user.getName(), user.getEmail(), user.getCountry(), user.getPhotoUrl());
    }

    public AuthResponse googleAuth(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Token de Google inválido");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String photoUrl = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name != null ? name : "Usuario");
                newUser.setPhotoUrl(photoUrl);
                newUser.setProvider(User.AuthProvider.GOOGLE);
                return userRepository.save(newUser);
            });

            // Update photo if changed
            if (photoUrl != null && !photoUrl.equals(user.getPhotoUrl())) {
                user.setPhotoUrl(photoUrl);
                userRepository.save(user);
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            return new AuthResponse(user.getId(), token, user.getName(), user.getEmail(), user.getCountry(), user.getPhotoUrl());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar token de Google", e);
        }
    }
}
