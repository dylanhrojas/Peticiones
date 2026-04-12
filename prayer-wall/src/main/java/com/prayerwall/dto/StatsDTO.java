package com.prayerwall.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StatsDTO {
    private long prayersToday;
    private long totalAnswered;
    private long totalRequests;
}
