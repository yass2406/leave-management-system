package com.polytech.app.dto;

import java.util.List;

public record TeamLeaveSummaryDTO(int teamSize, List<TeamLeaveRequestDTO> requests) {
}