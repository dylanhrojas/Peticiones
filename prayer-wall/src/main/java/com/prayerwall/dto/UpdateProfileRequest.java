package com.prayerwall.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String name;
    private String country;
    private Boolean isMissionary;
    private String missionaryCountry;
    private String bio;
}
