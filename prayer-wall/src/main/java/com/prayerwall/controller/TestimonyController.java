package com.prayerwall.controller;

import com.prayerwall.dto.PrayerRequestDTO;
import com.prayerwall.service.PrayerRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testimonies")
@RequiredArgsConstructor
public class TestimonyController {

    private final PrayerRequestService service;

    @GetMapping
    public List<PrayerRequestDTO> getAll() {
        return service.getAnswered();
    }
}
