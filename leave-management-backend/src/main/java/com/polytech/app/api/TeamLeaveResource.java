package com.polytech.app.api;

import java.util.List;

import com.polytech.app.dto.TeamLeaveRequestDTO;
import com.polytech.app.dto.TeamLeaveSummaryDTO;
import com.polytech.app.repository.LeaveRequestRepository;
import com.polytech.app.repository.UserRepository;
import com.polytech.app.service.UserService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

@Path("/leaves/team")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TeamLeaveResource {

	@Inject
	UserService userService;

	@Inject
	LeaveRequestRepository leaveRequestRepo;

	@Inject
	UserRepository userRepository;

	@GET
	@Path("/year/{year}")
	@RolesAllowed({ "MANAGER", "HR" })
	public TeamLeaveSummaryDTO getTeamRequestsForYear(@PathParam("year") int year, @Context SecurityContext sc) {

		var principal = sc.getUserPrincipal();
		var manager = userService.getCurrentUser(principal).orElseThrow(() -> new ForbiddenException("Unknown user"));

		var list = leaveRequestRepo.findTeamRequestsForYear(manager.getId(), year);

		List<TeamLeaveRequestDTO> dtos = list.stream().map(lr -> {
			var employee = userRepository.findById(lr.getEmployee().getId())
					.orElseThrow(() -> new NotFoundException("Employee not found: " + lr.getEmployee().getId()));

			String employeeName = employee.getFirstName() + " " + employee.getLastName();

			return new TeamLeaveRequestDTO(lr.getId(), lr.getRequestNumber(), employee.getId(),
					employee.getEmployeeCode(), employeeName, lr.getLeaveType().getId(), lr.getLeaveType().getName(),
					lr.getLeaveType().getCode(), lr.getStatus().name(), lr.getTotalDays(), lr.getStartDate(),
					lr.getEndDate(), lr.getCreatedAt());
		}).toList();

		int teamSize = (int) list.stream().map(lr -> lr.getEmployee().getId()).distinct().count();

		return new TeamLeaveSummaryDTO(teamSize, dtos);
	}
}
