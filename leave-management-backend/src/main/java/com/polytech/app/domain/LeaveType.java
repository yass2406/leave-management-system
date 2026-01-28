package com.polytech.app.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "leave_types")
public class LeaveType {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", length = 36, nullable = false, updatable = false)
	private String id;

	@Column(name = "code", length = 20, nullable = false, unique = true)
	private String code;

	@Column(name = "name", length = 50, nullable = false)
	private String name;

	@Column(name = "max_days_per_year", nullable = false)
	private Integer maxDaysPerYear;

	@Column(name = "is_paid", nullable = true)
	private Boolean isPaid;

	@Column(name = "requires_approval", nullable = true)
	private Boolean requiresApproval;

	@Column(name = "accrual_rate", precision = 5, scale = 2)
	private BigDecimal accrualRate;

	@Column(name = "color", length = 7)
	private String color;

	@Column(name = "is_active", nullable = false)
	private Boolean active = Boolean.TRUE;

	@PrePersist
	public void prePersist() {
		if (id == null || id.isEmpty()) {
			id = java.util.UUID.randomUUID().toString();
		}
		if (maxDaysPerYear == null) {
			maxDaysPerYear = 25;
		}
		if (isPaid == null) {
			isPaid = Boolean.TRUE;
		}
		if (requiresApproval == null) {
			requiresApproval = Boolean.TRUE;
		}
		if (color == null) {
			color = "#3498db";
		}
	}

	public String getId() {
		return id;
	}

	public Integer getMaxDaysPerYear() {
		return maxDaysPerYear;
	}

	public void setMaxDaysPerYear(Integer maxDaysPerYear) {
		this.maxDaysPerYear = maxDaysPerYear;
	}

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public Boolean getIsPaid() {
		return isPaid;
	}

	public void setIsPaid(Boolean isPaid) {
		this.isPaid = isPaid;
	}

	public Boolean getRequiresApproval() {
		return requiresApproval;
	}

	public void setRequiresApproval(Boolean requiresApproval) {
		this.requiresApproval = requiresApproval;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
