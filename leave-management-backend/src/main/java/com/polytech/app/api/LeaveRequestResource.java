package com.polytech.app.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.domain.LeaveType;
import com.polytech.app.dto.LeaveRequestCreateDTO;
import com.polytech.app.dto.LeaveRequestDTO;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
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
	@RolesAllowed("EMPLOYEE")
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
	public List<LeaveRequestDTO> getMyRequests(@Context SecurityContext securityContext,
			@QueryParam("status") String status, @QueryParam("startDateFrom") String startDateFrom,
			@QueryParam("leaveTypeId") String leaveTypeId) {

		var principal = securityContext.getUserPrincipal();
		String userId = userService.getCurrentUser(principal).orElseThrow(() -> new ForbiddenException("Unknown user"))
				.getId();

		return leaveRequestRepository.findByEmployeeId(userId, status, startDateFrom, leaveTypeId);
	}

	@GET
	@Path("/year/{year}")
	public List<LeaveRequestDTO> getRequestsByYear(@PathParam("year") int year, @Context SecurityContext sc) {
		var principal = sc.getUserPrincipal();
		String userId = userService.getCurrentUser(principal).orElseThrow(() -> new ForbiddenException("Unknown user"))
				.getId();
		return leaveRequestRepository.findByEmployeeIdAndYear(userId, year);
	}
}
