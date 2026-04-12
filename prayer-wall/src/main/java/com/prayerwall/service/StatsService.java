package com.prayerwall.service;

import com.prayerwall.dto.StatsDTO;
import com.prayerwall.model.PrayerRequest.Status;
import com.prayerwall.repository.PrayerRepository;
import com.prayerwall.repository.PrayerRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final PrayerRepository prayerRepository;
    private final PrayerRequestRepository prayerRequestRepository;

    public StatsDTO getStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long prayersToday = prayerRepository.countToday(startOfDay, endOfDay);
        long totalAnswered = prayerRequestRepository.findByStatusOrderByCreatedAtDesc(Status.ANSWERED).size();
        long totalRequests = prayerRequestRepository.count();

        return new StatsDTO(prayersToday, totalAnswered, totalRequests);
    }
}
