package com.prayerwall.repository;

import com.prayerwall.model.Prayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface PrayerRepository extends JpaRepository<Prayer, Long> {

    long countByCreatedAtAfter(LocalDateTime since);

    @Query("SELECT COUNT(p) FROM Prayer p WHERE p.createdAt >= :start AND p.createdAt < :end")
    long countToday(LocalDateTime start, LocalDateTime end);
}
