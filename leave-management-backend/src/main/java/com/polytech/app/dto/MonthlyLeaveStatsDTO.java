package com.polytech.app.dto;

import java.math.BigDecimal;

public class MonthlyLeaveStatsDTO {
	private int month;
	private double totalLeaveDays;

	public MonthlyLeaveStatsDTO() {
	}

	public MonthlyLeaveStatsDTO(Integer month, BigDecimal totalLeaveDays) {
		this.month = month != null ? month : 0;
		this.totalLeaveDays = totalLeaveDays != null ? totalLeaveDays.doubleValue() : 0.0;
	}

	public MonthlyLeaveStatsDTO(int month, double totalLeaveDays) {
		this.month = month;
		this.totalLeaveDays = totalLeaveDays;
	}

	public int getMonth() {
		return month;
	}

	public void setMonth(int month) {
		this.month = month;
	}

	public double getTotalLeaveDays() {
		return totalLeaveDays;
	}

	public void setTotalLeaveDays(double totalLeaveDays) {
		this.totalLeaveDays = totalLeaveDays;
	}
}
