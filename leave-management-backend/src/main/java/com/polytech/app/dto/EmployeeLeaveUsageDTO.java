package com.polytech.app.dto;

public class EmployeeLeaveUsageDTO {

	private String employeeId;
	private String employeeCode;
	private String fullName;
	private String departmentCode;
	private double totalLeaveDays;

	public EmployeeLeaveUsageDTO() {
	}

	public EmployeeLeaveUsageDTO(String employeeId, String employeeCode, String fullName, String departmentCode,
			double totalLeaveDays) {
		this.employeeId = employeeId;
		this.employeeCode = employeeCode;
		this.fullName = fullName;
		this.departmentCode = departmentCode;
		this.totalLeaveDays = totalLeaveDays;
	}

	public String getEmployeeId() {
		return employeeId;
	}

	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
	}

	public String getEmployeeCode() {
		return employeeCode;
	}

	public void setEmployeeCode(String employeeCode) {
		this.employeeCode = employeeCode;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getDepartmentCode() {
		return departmentCode;
	}

	public void setDepartmentCode(String departmentCode) {
		this.departmentCode = departmentCode;
	}

	public double getTotalLeaveDays() {
		return totalLeaveDays;
	}

	public void setTotalLeaveDays(double totalLeaveDays) {
		this.totalLeaveDays = totalLeaveDays;
	}
}
