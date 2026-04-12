package com.prayerwall.dto;

import lombok.Getter;
import lombok.Setter;

// Sent by the author when marking a prayer request as answered
@Getter @Setter
public class AnswerRequestDTO {
    private String testimony;
}
