package com.prayerwall.controller;

import com.prayerwall.dto.StatsDTO;
import com.prayerwall.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    public StatsDTO getStats() {
        return statsService.getStats();
    }
}
