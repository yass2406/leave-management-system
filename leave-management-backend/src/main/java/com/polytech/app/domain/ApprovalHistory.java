package com.polytech.app.domain;

import java.time.OffsetDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "approval_history")
public class ApprovalHistory {

	public enum Action {
		CREATED, SUBMITTED, APPROVED, REJECTED, ESCALATED, CANCELLED, COMMENTED
	}

	@Id
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "leave_request_id", nullable = false)
	private LeaveRequest leaveRequest;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "approver_id", nullable = false)
	private User approver;

	@Enumerated(EnumType.STRING)
	@Column(name = "action", nullable = false, length = 20)
	private Action action;

	@Column(name = "comments")
	private String comments;

	@Column(name = "level", nullable = false)
	private Integer level;

	@Column(name = "created_at")
	private java.time.OffsetDateTime createdAt;

	@PrePersist
	public void prePersist() {
		if (id == null || id.isEmpty()) {
			id = java.util.UUID.randomUUID().toString();
		}
		if (createdAt == null) {
			createdAt = java.time.OffsetDateTime.now();
		}
	}
	
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LeaveRequest getLeaveRequest() {
        return leaveRequest;
    }

    public void setLeaveRequest(LeaveRequest leaveRequest) {
        this.leaveRequest = leaveRequest;
    }

    public User getApprover() {
        return approver;
    }

    public void setApprover(User approver) {
        this.approver = approver;
    }

    public Action getAction() {
        return action;
    }

    public void setAction(Action action) {
        this.action = action;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
