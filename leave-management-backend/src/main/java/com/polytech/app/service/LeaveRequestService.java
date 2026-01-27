package com.polytech.app.service;

import java.math.BigDecimal;
import java.time.Instant;

import com.polytech.app.domain.ApprovalHistory;
import com.polytech.app.domain.LeaveBalance;
import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.domain.LeaveType;
import com.polytech.app.domain.Role;
import com.polytech.app.domain.User;
import com.polytech.app.repository.ApprovalHistoryRepository;
import com.polytech.app.repository.LeaveBalanceRepository;
import com.polytech.app.repository.LeaveRequestRepository;
import com.polytech.app.repository.UserRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
@Transactional
public class LeaveRequestService {

	@PersistenceContext
	EntityManager em;

	@Inject
	LeaveRequestRepository leaveRequestRepository;

	@Inject
	LeaveBalanceRepository leaveBalanceRepository;

	@Inject
	UserRepository userRepository;

	@Inject
	ApprovalHistoryRepository approvalHistoryRepository;

	public String generateRequestNumber() {
		int year = java.time.Year.now().getValue();
		String prefix = "REQ-" + year + "-";

		for (int attempts = 0; attempts < 10; attempts++) {
			int random = (int) (Math.random() * 1000); // 0–999
			String candidate = String.format("%s%03d", prefix, random);

			boolean exists = !em
					.createQuery("SELECT lr.id FROM LeaveRequest lr WHERE lr.requestNumber = :rn", String.class)
					.setParameter("rn", candidate).getResultList().isEmpty();

			if (!exists) {
				return candidate;
			}
		}

		throw new IllegalStateException("Could not generate unique request number after 10 attempts");
	}

	public void validateBalance(String employeeId, LeaveType leaveType, BigDecimal totalDays) {
		LeaveBalance balance = leaveBalanceRepository.findCurrentYear(employeeId, leaveType.getId())
				.orElseThrow(() -> new BadRequestException("No balance for this leave type"));

		if (balance.getRemainingDays().compareTo(totalDays) < 0) {
			throw new BadRequestException("Insufficient balance: " + balance.getRemainingDays() + " days remaining");
		}
	}

	public LeaveRequest createWithManager(String employeeId, LeaveRequest request) {
		validateBalance(employeeId, request.getLeaveType(), request.getTotalDays());

		User employee = userRepository.findById(employeeId)
				.orElseThrow(() -> new NotFoundException("Employee not found"));

		User manager = employee.getManager();
	    if (manager == null) {
	        throw new BadRequestException("No manager assigned to employee");
	    }

	    request.setCurrentApproverId(manager.getId());
		request.setRequestNumber(generateRequestNumber());

		em.persist(request);
		em.flush();
		return request;
	}

	public void approveRequest(User approver, String requestId, String comment) {
		LeaveRequest request = leaveRequestRepository.findEntityById(requestId)
				.orElseThrow(() -> new NotFoundException("Leave request not found"));

		if (request.getStatus() != LeaveRequest.Status.PENDING) {
			throw new BadRequestException("Only pending requests can be approved");
		}

		User employee = userRepository.findById(request.getEmployee().getId())
				.orElseThrow(() -> new NotFoundException("Employee not found"));

		// Manager can only approve direct reports; HR can approve all
		if (approver.getRole() == Role.MANAGER && !approver.getId().equals(employee.getManager().getId())) {
			throw new ForbiddenException("Not allowed to approve this user's leave request");
		}

		// Re‑validate balance for safety
		int year = request.getStartDate().getYear();
		LeaveBalance balance = leaveBalanceRepository
				.findByUserTypeYear(employee.getId(), request.getLeaveType().getId(), year)
				.orElseThrow(() -> new BadRequestException("No leave balance for this type/year"));

		if (balance.getRemainingDays().compareTo(request.getTotalDays()) < 0) {
			throw new BadRequestException("Insufficient balance to approve this request");
		}

		// Adjust balance: increase takenDays, DB will recompute remainingDays
		balance.setTakenDays(balance.getTakenDays().add(request.getTotalDays()));
		leaveBalanceRepository.update(balance);

		// Update request
		request.setStatus(LeaveRequest.Status.APPROVED);
		request.setCurrentApproverId(null);
		request.setApprovedAt(Instant.now());
		request.setUpdatedAt(Instant.now());
		leaveRequestRepository.update(request);

		// History entry
		ApprovalHistory history = new ApprovalHistory();
		history.setLeaveRequest(request);
		history.setApprover(approver);
		history.setAction(ApprovalHistory.Action.APPROVED);
		history.setComments(comment);
		history.setLevel(request.getApprovalLevel() != null ? request.getApprovalLevel() : 1);
		approvalHistoryRepository.save(history);
	}

	public void rejectRequest(User approver, String requestId, String comment) {
		LeaveRequest request = leaveRequestRepository.findEntityById(requestId)
				.orElseThrow(() -> new NotFoundException("Leave request not found"));

		if (request.getStatus() != LeaveRequest.Status.PENDING) {
			throw new BadRequestException("Only pending requests can be rejected");
		}

		User employee = userRepository.findById(request.getEmployee().getId())
				.orElseThrow(() -> new NotFoundException("Employee not found"));

		if (approver.getRole() == Role.MANAGER && !approver.getId().equals(employee.getManager().getId())) {
			throw new ForbiddenException("Not allowed to reject this user's leave request");
		}

		request.setStatus(LeaveRequest.Status.REJECTED);
		request.setCurrentApproverId(null);
		request.setRejectedAt(Instant.now());
		request.setUpdatedAt(Instant.now());
		leaveRequestRepository.update(request);

		ApprovalHistory history = new ApprovalHistory();
		history.setLeaveRequest(request);
		history.setApprover(approver);
		history.setAction(ApprovalHistory.Action.REJECTED);
		history.setComments(comment);
		history.setLevel(request.getApprovalLevel() != null ? request.getApprovalLevel() : 1);
		approvalHistoryRepository.save(history);
	}
}
