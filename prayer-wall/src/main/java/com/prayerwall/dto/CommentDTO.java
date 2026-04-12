package com.prayerwall.dto;

import com.prayerwall.model.Comment;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentDTO {
    private Long id;
    private String authorName;
    private String text;
    private LocalDateTime createdAt;

    public static CommentDTO from(Comment c) {
        CommentDTO dto = new CommentDTO();
        dto.id = c.getId();
        dto.authorName = c.getUser().getName();
        dto.text = c.getText();
        dto.createdAt = c.getCreatedAt();
        return dto;
    }
}
