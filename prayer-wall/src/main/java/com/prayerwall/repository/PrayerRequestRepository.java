package com.prayerwall.repository;

import com.prayerwall.model.Category;
import com.prayerwall.model.PrayerRequest;
import com.prayerwall.model.PrayerRequest.Status;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface PrayerRequestRepository extends JpaRepository<PrayerRequest, Long> {

    List<PrayerRequest> findByStatusOrderByCreatedAtDesc(Status status);

    List<PrayerRequest> findByStatusAndCategoryOrderByCreatedAtDesc(Status status, Category category);

    List<PrayerRequest> findByStatusOrderByPrayerCountDesc(Status status);

    List<PrayerRequest> findByUserId(Long userId);

    // Paginated variants
    List<PrayerRequest> findByStatusOrderByCreatedAtDesc(Status status, Pageable pageable);

    List<PrayerRequest> findByStatusAndCategoryOrderByCreatedAtDesc(Status status, Category category, Pageable pageable);

    List<PrayerRequest> findByStatusOrderByPrayerCountDesc(Status status, Pageable pageable);

    // Archive requests that haven't received a prayer in 30 days
    @Modifying
    @Query("UPDATE PrayerRequest r SET r.status = 'ARCHIVED' WHERE r.status = 'ACTIVE' AND r.lastPrayedAt < :cutoff")
    int archiveInactive(LocalDateTime cutoff);
}
