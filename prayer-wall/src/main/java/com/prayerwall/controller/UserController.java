package com.prayerwall.controller;

import com.prayerwall.dto.AuthResponse;
import com.prayerwall.dto.MissionaryDTO;
import com.prayerwall.dto.MissionaryStatsDTO;
import com.prayerwall.dto.UpdateProfileRequest;
import com.prayerwall.model.User;
import com.prayerwall.repository.UserRepository;
import com.prayerwall.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
                user.getId(), token, user.getName(), user.getEmail(), user.getCountry(), user.getPhotoUrl(), user.getIsMissionary(), user.getMissionaryCountry(), user.getBio()));
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
        if (dto.getIsMissionary() != null) {
            user.setIsMissionary(dto.getIsMissionary());
        }
        if (dto.getMissionaryCountry() != null) {
            user.setMissionaryCountry(dto.getMissionaryCountry().trim());
        }
        if (dto.getBio() != null) {
            user.setBio(dto.getBio().trim());
        }

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(
                user.getId(), token, user.getName(), user.getEmail(), user.getCountry(), user.getPhotoUrl(), user.getIsMissionary(), user.getMissionaryCountry(), user.getBio()));
    }

    @GetMapping("/missionaries")
    public ResponseEntity<List<MissionaryStatsDTO>> getMissionariesByCountry() {
        List<User> missionaries = userRepository.findByIsMissionaryTrue();

        Map<String, List<User>> groupedByCountry = missionaries.stream()
                .filter(m -> m.getMissionaryCountry() != null && !m.getMissionaryCountry().isEmpty())
                .collect(Collectors.groupingBy(User::getMissionaryCountry));

        List<MissionaryStatsDTO> stats = groupedByCountry.entrySet().stream()
                .map(entry -> {
                    String country = entry.getKey();
                    List<User> users = entry.getValue();
                    List<MissionaryDTO> missionaryDTOs = users.stream()
                            .map(u -> new MissionaryDTO(
                                    u.getId(),
                                    u.getName(),
                                    u.getEmail(),
                                    u.getCountry(),
                                    u.getPhotoUrl(),
                                    u.getMissionaryCountry(),
                                    u.getBio()
                            ))
                            .collect(Collectors.toList());
                    return new MissionaryStatsDTO(country, users.size(), missionaryDTOs);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(stats);
    }
}
