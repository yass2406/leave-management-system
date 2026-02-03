package com.polytech.app.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

	@Id
	@Column(name = "id", length = 36, nullable = false)
	private String id;

	@Column(name = "user_id", length = 36, nullable = false)
	private String userId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "leave_type_id", nullable = false)
	private LeaveType leaveType;

	@Column(name = "`year`", nullable = false)
	private Integer year;

	@Column(name = "entitled_days", nullable = false, precision = 5, scale = 2)
	private BigDecimal entitledDays;

	@Column(name = "taken_days", precision = 5, scale = 2)
	private BigDecimal takenDays;

	@Column(name = "carried_over", precision = 5, scale = 2)
	private BigDecimal carriedOver;

	@Column(name = "total_available", precision = 5, scale = 2, insertable = false, updatable = false)
	private BigDecimal totalAvailable;

	@Column(name = "remaining_days", precision = 5, scale = 2, insertable = false, updatable = false)
	private BigDecimal remainingDays;

	@Column(name = "created_at", insertable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", insertable = false)
	private Instant updatedAt;

	@PrePersist
	public void prePersist() {
		if (id == null || id.isEmpty()) {
			id = java.util.UUID.randomUUID().toString();
		}
		if (takenDays == null) {
			takenDays = BigDecimal.ZERO;
		}
		if (carriedOver == null) {
			carriedOver = BigDecimal.ZERO;
		}
	}

	public String getId() {
		return id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public LeaveType getLeaveType() {
		return leaveType;
	}

	public void setLeaveType(LeaveType leaveType) {
		this.leaveType = leaveType;
	}

	public Integer getYear() {
		return year;
	}

	public void setYear(Integer year) {
		this.year = year;
	}

	public BigDecimal getEntitledDays() {
		return entitledDays;
	}

	public void setEntitledDays(BigDecimal entitledDays) {
		this.entitledDays = entitledDays;
	}

	public BigDecimal getTakenDays() {
		return takenDays;
	}

	public void setTakenDays(BigDecimal takenDays) {
		this.takenDays = takenDays;
	}

	public BigDecimal getCarriedOver() {
		return carriedOver;
	}

	public void setCarriedOver(BigDecimal carriedOver) {
		this.carriedOver = carriedOver;
	}

	public BigDecimal getTotalAvailable() {
		return totalAvailable;
	}

	public void setTotalAvailable(BigDecimal totalAvailable) {
		this.totalAvailable = totalAvailable;
	}

	public BigDecimal getRemainingDays() {
		return remainingDays;
	}

	public void setRemainingDays(BigDecimal remainingDays) {
		this.remainingDays = remainingDays;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}