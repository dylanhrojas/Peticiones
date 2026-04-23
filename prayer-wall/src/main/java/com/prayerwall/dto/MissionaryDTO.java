package com.prayerwall.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MissionaryDTO {
    private Long id;
    private String name;
    private String email;
    private String country;
    private String photoUrl;
    private String missionaryCountry;
    private String bio;
}
