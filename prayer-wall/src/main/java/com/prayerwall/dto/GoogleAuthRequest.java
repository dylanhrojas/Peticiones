package com.prayerwall.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequest {
    private String credential; // The id_token from Google Identity Services
}
