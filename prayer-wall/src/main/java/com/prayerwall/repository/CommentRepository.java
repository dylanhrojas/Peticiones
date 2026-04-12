package com.prayerwall.repository;

import com.prayerwall.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPrayerRequestIdOrderByCreatedAtAsc(Long prayerRequestId);

    long countByPrayerRequestId(Long prayerRequestId);

    @Query("SELECT c.prayerRequest.id, COUNT(c) FROM Comment c " +
           "WHERE c.prayerRequest.id IN :ids GROUP BY c.prayerRequest.id")
    List<Object[]> countByPrayerRequestIds(@Param("ids") List<Long> ids);
}
