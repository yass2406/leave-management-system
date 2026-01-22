package com.polytech.app.api;

import java.util.List;

import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.domain.Role;
import com.polytech.app.dto.HrLeaveRequestDTO;
import com.polytech.app.dto.HrSummaryDTO;
import com.polytech.app.repository.LeaveRequestRepository;
import com.polytech.app.repository.UserRepository;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/hr-dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({ "HR" })
public class HrDashboardResource {

	@Inject
	UserRepository userRepository;

	@Inject
	LeaveRequestRepository leaveRequestRepository;

	@GET
	@Path("/summary")
	public HrSummaryDTO getSummary() {
		long totalEmployees = userRepository.countAll();
		long totalManagers = userRepository.countByRole(Role.MANAGER);
		long totalEmployeesOnly = userRepository.countByRole(Role.EMPLOYEE);
		return new HrSummaryDTO(totalEmployees, totalManagers, totalEmployeesOnly);
	}

	@GET
	@Path("/requests/{year}")
	public List<HrLeaveRequestDTO> getRequests(@PathParam("year") int year) {
		List<LeaveRequest> list = leaveRequestRepository.findAllForYear(year);

		return list.stream().map(lr -> {
			var employee = userRepository.findById(lr.getEmployeeId())
					.orElseThrow(() -> new NotFoundException("Employee not found: " + lr.getEmployeeId()));

			String employeeName = employee.getFirstName() + " " + employee.getLastName();

			return new HrLeaveRequestDTO(lr.getId(), lr.getRequestNumber(), employee.getId(),
					employee.getEmployeeCode(), employeeName, employee.getRole().name(), lr.getLeaveType().getName(),
					lr.getStatus().name(), lr.getTotalDays(), lr.getStartDate(), lr.getEndDate(), lr.getCreatedAt());
		}).toList();
	}
}
