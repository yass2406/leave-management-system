package com.polytech.app.dto;

import java.math.BigDecimal;

public class DepartmentLeaveUtilizationDTO {

	private String departmentId;
	private String departmentCode;
	private String departmentName;
	private long headcount;
	private double totalApprovedLeaveDays;
	private double averageLeaveDaysPerEmployee;
	private double utilizationRate;

	public DepartmentLeaveUtilizationDTO() {
	}

	public DepartmentLeaveUtilizationDTO(String departmentId, String departmentCode, String departmentName,
			Long headcount, BigDecimal totalApprovedLeaveDays) {
		this.departmentId = departmentId;
		this.departmentCode = departmentCode;
		this.departmentName = departmentName;
		this.headcount = headcount != null ? headcount : 0L;
		this.totalApprovedLeaveDays = totalApprovedLeaveDays != null ? totalApprovedLeaveDays.doubleValue() : 0.0;
	}

	public String getDepartmentId() {
		return departmentId;
	}

	public void setDepartmentId(String departmentId) {
		this.departmentId = departmentId;
	}

	public String getDepartmentCode() {
		return departmentCode;
	}

	public void setDepartmentCode(String departmentCode) {
		this.departmentCode = departmentCode;
	}

	public String getDepartmentName() {
		return departmentName;
	}

	public void setDepartmentName(String departmentName) {
		this.departmentName = departmentName;
	}

	public long getHeadcount() {
		return headcount;
	}

	public void setHeadcount(long headcount) {
		this.headcount = headcount;
	}

	public double getTotalApprovedLeaveDays() {
		return totalApprovedLeaveDays;
	}

	public void setTotalApprovedLeaveDays(double totalApprovedLeaveDays) {
		this.totalApprovedLeaveDays = totalApprovedLeaveDays;
	}

	public double getAverageLeaveDaysPerEmployee() {
		return averageLeaveDaysPerEmployee;
	}

	public void setAverageLeaveDaysPerEmployee(double averageLeaveDaysPerEmployee) {
		this.averageLeaveDaysPerEmployee = averageLeaveDaysPerEmployee;
	}

	public double getUtilizationRate() {
		return utilizationRate;
	}

	public void setUtilizationRate(double utilizationRate) {
		this.utilizationRate = utilizationRate;
	}
}
