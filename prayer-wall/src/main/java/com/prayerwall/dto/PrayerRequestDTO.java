package com.prayerwall.dto;

import com.prayerwall.model.Category;
import com.prayerwall.model.PrayerRequest;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Response DTO — sent to the frontend
@Getter @Setter
public class PrayerRequestDTO {
    private Long id;
    private Long authorId;
    private String authorName;
    private String text;
    private Category category;
    private Double latitude;
    private Double longitude;
    private String country;
    private boolean anonymous;
    private int prayerCount;
    private int commentCount;
    private PrayerRequest.Status status;
    private LocalDateTime createdAt;
    private String testimony;

    public static PrayerRequestDTO from(PrayerRequest r) {
        PrayerRequestDTO dto = new PrayerRequestDTO();
        dto.id = r.getId();
        dto.authorId = r.getUser().getId();
        dto.authorName = r.isAnonymous() ? "Anónimo" : r.getUser().getName();
        dto.text = r.getText();
        dto.category = r.getCategory();
        dto.latitude = r.getLatitude();
        dto.longitude = r.getLongitude();
        dto.country = r.getCountry();
        dto.anonymous = r.isAnonymous();
        dto.prayerCount = r.getPrayerCount();
        dto.status = r.getStatus();
        dto.createdAt = r.getCreatedAt();
        dto.testimony = r.getTestimony();
        return dto;
    }
}
