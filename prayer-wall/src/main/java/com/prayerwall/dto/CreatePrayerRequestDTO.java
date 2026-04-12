package com.prayerwall.dto;

import com.prayerwall.model.Category;
import lombok.Getter;
import lombok.Setter;

// Request DTO — received from the frontend when creating a prayer request
@Getter @Setter
public class CreatePrayerRequestDTO {
    private String text;
    private Category category;
    private Double latitude;
    private Double longitude;
    private String country;
    private boolean anonymous;
}
