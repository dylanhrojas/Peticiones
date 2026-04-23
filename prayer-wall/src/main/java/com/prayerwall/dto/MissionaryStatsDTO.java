package com.prayerwall.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class MissionaryStatsDTO {
    private String country;
    private Integer count;
    private List<MissionaryDTO> missionaries;
}
