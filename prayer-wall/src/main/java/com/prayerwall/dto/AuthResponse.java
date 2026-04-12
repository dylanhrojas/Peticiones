package com.prayerwall.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String token;
    private String name;
    private String email;
    private String country;
    private String photoUrl;
}
