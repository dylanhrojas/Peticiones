package com.prayerwall.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "prayer_requests")
@Getter @Setter @NoArgsConstructor
public class PrayerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 1000)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    private Double latitude;
    private Double longitude;
    private String country;

    @Column(nullable = false)
    private boolean anonymous = false;

    @Column(nullable = false)
    private int prayerCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    // Resets each time someone prays — used for the 30-day expiry logic
    @Column(nullable = false)
    private LocalDateTime lastPrayedAt = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Written by the author when marking as answered
    @Column(length = 1000)
    private String testimony;

    private LocalDateTime answeredAt;

    public enum Status {
        ACTIVE, ANSWERED, ARCHIVED
    }
}
