package com.polytech.app.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class LeaveRequestViewDto {
    public String id;
    public String requestNumber;
    public String leaveTypeId;
    public String leaveTypeCode;
    public String leaveTypeName;

    public LocalDate startDate;
    public LocalDate endDate;
    public BigDecimal totalDays;

    public String status;
    public String reason;

    public String currentApproverId;
    public Integer approvalLevel;

    public Instant approvedAt;
    public Instant rejectedAt;
    public Instant createdAt;
    public Instant updatedAt;
}