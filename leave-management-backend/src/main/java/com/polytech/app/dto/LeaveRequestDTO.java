package com.polytech.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.domain.LeaveType;

public class LeaveRequestDTO {
    public String id;
    public String requestNumber;
    public String leaveTypeId;
    public String leaveTypeName;
    public String leaveTypeCode;
    public String startDate;
    public String endDate;
    public String status;
    public BigDecimal totalDays;
    public String reason;
    
    public LeaveRequestDTO() {}
    
    public LeaveRequestDTO(String id, String requestNumber, LeaveType leaveType,
            LocalDate startDate, LocalDate endDate, LeaveRequest.Status status,
            BigDecimal totalDays, String reason) {
        this.id = id;
		this.requestNumber = requestNumber;
		this.leaveTypeId = leaveType.getId();
		this.leaveTypeName = leaveType.getName();
        this.leaveTypeCode = leaveType.getCode(); 
		this.startDate = startDate.toString();
		this.endDate = endDate.toString();
		this.status = formatStatus(status);
		this.totalDays = totalDays;
		this.reason = reason;
    }
    
    private String formatStatus(LeaveRequest.Status s) {
        return switch(s) {
            case PENDING -> "Pending";
            case APPROVED -> "Approved"; 
            case REJECTED -> "Rejected";
            case CANCELLED -> "Cancelled";
            default -> s.name();
        };
    }
}