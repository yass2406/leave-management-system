package com.polytech.app.dto;

public class LeaveTypeDistributionDTO {

	private String leaveTypeCode;
	private String leaveTypeName;
	private double totalLeaveDays;

	public LeaveTypeDistributionDTO() {
	}

	public LeaveTypeDistributionDTO(String leaveTypeCode, String leaveTypeName, double totalLeaveDays) {
		this.leaveTypeCode = leaveTypeCode;
		this.leaveTypeName = leaveTypeName;
		this.totalLeaveDays = totalLeaveDays;
	}

	public String getLeaveTypeCode() {
		return leaveTypeCode;
	}

	public void setLeaveTypeCode(String leaveTypeCode) {
		this.leaveTypeCode = leaveTypeCode;
	}

	public String getLeaveTypeName() {
		return leaveTypeName;
	}

	public void setLeaveTypeName(String leaveTypeName) {
		this.leaveTypeName = leaveTypeName;
	}

	public double getTotalLeaveDays() {
		return totalLeaveDays;
	}

	public void setTotalLeaveDays(double totalLeaveDays) {
		this.totalLeaveDays = totalLeaveDays;
	}
}