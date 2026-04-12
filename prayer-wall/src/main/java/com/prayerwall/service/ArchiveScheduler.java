package com.prayerwall.service;

import com.prayerwall.repository.PrayerRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ArchiveScheduler {

    private final PrayerRequestRepository prayerRequestRepository;

    @Scheduled(cron = "0 0 3 * * *") // every day at 3 AM
    @Transactional
    public void archiveExpiredRequests() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        int count = prayerRequestRepository.archiveInactive(cutoff);
        if (count > 0) {
            log.info("Archived {} prayer requests inactive since {}", count, cutoff);
        }
    }
}
