package com.polytech.app.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record HrLeaveRequestDTO(String id, String requestNumber, String employeeId, String employeeCode,
		String employeeName, String role, String leaveTypeName, String status, BigDecimal totalDays,
		LocalDate startDate, LocalDate endDate, Instant createdAt) {
}