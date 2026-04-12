package com.prayerwall.controller;

import com.prayerwall.dto.*;
import com.prayerwall.service.PrayerRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prayer-requests")
@RequiredArgsConstructor
public class PrayerRequestController {

    private final PrayerRequestService service;

    @GetMapping
    public List<PrayerRequestDTO> getActive(
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.getActive(sort, category, page, size);
    }

    @GetMapping("/{id}")
    public PrayerRequestDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<PrayerRequestDTO> create(
            @RequestBody CreatePrayerRequestDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(service.create(dto, (Long) auth.getPrincipal()));
    }

    @PostMapping("/{id}/pray")
    public ResponseEntity<PrayerRequestDTO> pray(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = auth != null ? (Long) auth.getPrincipal() : null;
        return ResponseEntity.ok(service.pray(id, userId));
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<PrayerRequestDTO> markAsAnswered(
            @PathVariable Long id,
            @RequestBody AnswerRequestDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(service.markAsAnswered(id, dto, (Long) auth.getPrincipal()));
    }

    @GetMapping("/{id}/comments")
    public List<CommentDTO> getComments(@PathVariable Long id) {
        return service.getComments(id);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(service.addComment(id, body.get("text"), (Long) auth.getPrincipal()));
    }
}
