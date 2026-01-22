package com.polytech.app.dto;

import java.math.BigDecimal;

public record LeaveBalanceDTO(String leaveTypeId, String leaveTypeCode, String leaveTypeName, int year,
		BigDecimal entitledDays, BigDecimal carriedOver, BigDecimal takenDays, BigDecimal remainingDays) {
}