package com.prayerwall.service;

import com.prayerwall.dto.*;
import com.prayerwall.model.*;
import com.prayerwall.model.PrayerRequest.Status;
import com.prayerwall.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrayerRequestService {

    private final PrayerRequestRepository prayerRequestRepository;
    private final PrayerRepository prayerRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public List<PrayerRequestDTO> getActive(String sort, String category, int page, int size) {
        // Clamp size to prevent abuse
        int clampedSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), clampedSize);

        List<PrayerRequest> requests;

        if (category != null) {
            requests = prayerRequestRepository.findByStatusAndCategoryOrderByCreatedAtDesc(
                Status.ACTIVE, Category.valueOf(category.toUpperCase()), pageable
            );
        } else if ("prayed".equals(sort)) {
            requests = prayerRequestRepository.findByStatusOrderByPrayerCountDesc(Status.ACTIVE, pageable);
        } else {
            requests = prayerRequestRepository.findByStatusOrderByCreatedAtDesc(Status.ACTIVE, pageable);
        }

        return toDtos(requests);
    }

    public List<PrayerRequestDTO> getAnswered() {
        return toDtos(prayerRequestRepository.findByStatusOrderByCreatedAtDesc(Status.ANSWERED));
    }

    public PrayerRequestDTO getById(Long id) {
        return toDto(findActive(id));
    }

    @Transactional
    public PrayerRequestDTO create(CreatePrayerRequestDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PrayerRequest request = new PrayerRequest();
        request.setUser(user);
        request.setText(dto.getText());
        request.setCategory(dto.getCategory());
        request.setLatitude(dto.getLatitude());
        request.setLongitude(dto.getLongitude());
        request.setCountry(dto.getCountry());
        request.setAnonymous(dto.isAnonymous());

        return toDto(prayerRequestRepository.save(request));
    }

    @Transactional
    public PrayerRequestDTO pray(Long requestId, Long userId) {
        PrayerRequest request = findActive(requestId);

        Prayer prayer = new Prayer();
        prayer.setPrayerRequest(request);
        if (userId != null) {
            userRepository.findById(userId).ifPresent(prayer::setUser);
        }
        prayerRepository.save(prayer);

        request.setPrayerCount(request.getPrayerCount() + 1);
        request.setLastPrayedAt(LocalDateTime.now());
        return toDto(prayerRequestRepository.save(request));
    }

    @Transactional
    public PrayerRequestDTO markAsAnswered(Long requestId, AnswerRequestDTO dto, Long userId) {
        PrayerRequest request = findActive(requestId);

        if (!request.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the author can mark a request as answered");
        }

        request.setStatus(Status.ANSWERED);
        request.setTestimony(dto.getTestimony());
        request.setAnsweredAt(LocalDateTime.now());
        return toDto(prayerRequestRepository.save(request));
    }

    @Transactional
    public CommentDTO addComment(Long requestId, String text, Long userId) {
        PrayerRequest request = prayerRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Prayer request not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setPrayerRequest(request);
        comment.setUser(user);
        comment.setText(text);
        return CommentDTO.from(commentRepository.save(comment));
    }

    public List<CommentDTO> getComments(Long requestId) {
        return commentRepository.findByPrayerRequestIdOrderByCreatedAtAsc(requestId)
                .stream().map(CommentDTO::from).toList();
    }

    private PrayerRequest findActive(Long id) {
        return prayerRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prayer request not found"));
    }

    // Map a single request to its DTO with commentCount populated.
    private PrayerRequestDTO toDto(PrayerRequest r) {
        PrayerRequestDTO dto = PrayerRequestDTO.from(r);
        dto.setCommentCount((int) commentRepository.countByPrayerRequestId(r.getId()));
        return dto;
    }

    // Map a list of requests to DTOs, batch-fetching comment counts in one query
    // to avoid N+1 on the feed path.
    private List<PrayerRequestDTO> toDtos(List<PrayerRequest> requests) {
        if (requests.isEmpty()) return List.of();
        List<Long> ids = requests.stream().map(PrayerRequest::getId).toList();
        Map<Long, Integer> counts = new HashMap<>();
        for (Object[] row : commentRepository.countByPrayerRequestIds(ids)) {
            counts.put((Long) row[0], ((Long) row[1]).intValue());
        }
        return requests.stream().map(r -> {
            PrayerRequestDTO dto = PrayerRequestDTO.from(r);
            dto.setCommentCount(counts.getOrDefault(r.getId(), 0));
            return dto;
        }).collect(Collectors.toList());
    }
}
