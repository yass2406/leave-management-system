package com.polytech.app.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.domain.LeaveType;
import com.polytech.app.domain.Role;
import com.polytech.app.domain.User;
import com.polytech.app.dto.ApprovalDecisionDTO;
import com.polytech.app.dto.LeaveRequestCreateDTO;
import com.polytech.app.dto.LeaveRequestDTO;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import com.polytech.app.repository.LeaveRequestRepository;
import com.polytech.app.repository.LeaveTypeRepository;
import com.polytech.app.service.LeaveRequestService;
import com.polytech.app.service.UserService;

@Path("/leaves")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LeaveRequestResource {

	@Inject
	LeaveRequestRepository leaveRequestRepository;

	@Inject
	UserService userService;

	@Inject
	LeaveTypeRepository leaveTypeRepository;

	@Inject
	LeaveRequestService leaveRequestService;

	private BigDecimal calculateDays(LocalDate start, LocalDate end) {
		return BigDecimal.valueOf(java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1);
	}

	@POST
	@RolesAllowed({ "EMPLOYEE", "MANAGER", "HR" })
	public LeaveRequestDTO create(@Valid LeaveRequestCreateDTO dto, @Context SecurityContext securityContext) {

		var principal = securityContext.getUserPrincipal();
		String employeeId = userService.getCurrentUser(principal)
				.orElseThrow(() -> new ForbiddenException("Unknown user")).getId();

		LeaveType leaveType = leaveTypeRepository.findById(dto.leaveTypeId)
				.orElseThrow(() -> new NotFoundException("Leave type not found"));

		LeaveRequest request = new LeaveRequest();
		request.setEmployeeId(employeeId);
		request.setLeaveType(leaveType);
		request.setStartDate(dto.startDate);
		request.setEndDate(dto.endDate);
		request.setReason(dto.reason);
		request.setTotalDays(calculateDays(dto.startDate, dto.endDate));

		request = leaveRequestService.createWithManager(employeeId, request);

		LeaveRequestDTO responseDto = new LeaveRequestDTO();
		responseDto.id = request.getId();
		responseDto.requestNumber = request.getRequestNumber();
		responseDto.leaveTypeId = request.getLeaveType().getId();
		responseDto.startDate = request.getStartDate().toString();
		responseDto.endDate = request.getEndDate().toString();
		responseDto.status = request.getStatus().name();
		responseDto.totalDays = request.getTotalDays();
		responseDto.reason = request.getReason();

		return responseDto;
	}

	@GET
	@RolesAllowed({ "EMPLOYEE", "MANAGER", "HR" })
	public List<LeaveRequestDTO> getRequests(@Context SecurityContext securityContext,
			@QueryParam("employeeId") String employeeId, @QueryParam("status") String status,
			@QueryParam("startDateFrom") String startDateFrom, @QueryParam("leaveTypeId") String leaveTypeId) {

		var principal = securityContext.getUserPrincipal();
		var currentUser = userService.getCurrentUser(principal)
				.orElseThrow(() -> new ForbiddenException("Unknown user"));

		String currentUserId = currentUser.getId();
		var currentRole = currentUser.getRole();

		String effectiveEmployeeId;

		// 1) No employeeId: always self-view (everyone can see their own requests)
		if (employeeId == null) {
			effectiveEmployeeId = currentUserId;
		} else {
			// 2) EMPLOYEE: cannot view others
			if (currentRole == Role.EMPLOYEE && !employeeId.equals(currentUserId)) {
				throw new ForbiddenException("Not allowed to view other employees' leave requests");
			}

			// 3) MANAGER rules
			if (currentRole == Role.MANAGER && !employeeId.equals(currentUserId)) {
				// Load target user
				var targetUser = userService.findById(employeeId)
						.orElseThrow(() -> new NotFoundException("Target user not found"));

				// Cannot view HR or another manager
				if (targetUser.getRole() == Role.HR || targetUser.getRole() == Role.MANAGER) {
					throw new ForbiddenException("Not allowed to view HR or manager leave requests");
				}

				// Must be a direct report
				if (!currentUserId.equals(targetUser.getManager().getId())) {
					throw new ForbiddenException("Not allowed to view this user's leave requests");
				}
			}

			// 4) HR can view anyone (no extra restriction)
			effectiveEmployeeId = employeeId;
		}

		return leaveRequestRepository.findByEmployeeId(effectiveEmployeeId, status, startDateFrom, leaveTypeId);
	}

	@GET
	@Path("/year/{year}")
	public List<LeaveRequestDTO> getRequestsByYear(@PathParam("year") int year, @Context SecurityContext sc) {
		var principal = sc.getUserPrincipal();
		String userId = userService.getCurrentUser(principal).orElseThrow(() -> new ForbiddenException("Unknown user"))
				.getId();
		return leaveRequestRepository.findByEmployeeIdAndYear(userId, year);
	}

	@POST
	@Path("/{id}/approve")
	@RolesAllowed({ "MANAGER", "HR" })
	@Consumes(MediaType.APPLICATION_JSON)
	public Response approve(@PathParam("id") String id, ApprovalDecisionDTO dto, @Context SecurityContext sc) {

		var principal = sc.getUserPrincipal();
		User approver = userService.getCurrentUser(principal).orElseThrow(() -> new ForbiddenException("Unknown user"));

		leaveRequestService.approveRequest(approver, id, dto != null ? dto.comment : null);

		return Response.noContent().build();
	}

	@POST
	@Path("/{id}/reject")
	@RolesAllowed({ "MANAGER", "HR" })
	@Consumes(MediaType.APPLICATION_JSON)
	public Response reject(@PathParam("id") String id, ApprovalDecisionDTO dto, @Context SecurityContext sc) {

		var principal = sc.getUserPrincipal();
		User approver = userService.getCurrentUser(principal).orElseThrow(() -> new ForbiddenException("Unknown user"));

		leaveRequestService.rejectRequest(approver, id, dto != null ? dto.comment : null);

		return Response.noContent().build();
	}

}
