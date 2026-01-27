package com.polytech.app.api;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import com.polytech.app.domain.LeaveRequest;
import com.polytech.app.domain.Role;
import com.polytech.app.dto.DepartmentLeaveUtilizationDTO;
import com.polytech.app.dto.EmployeeLeaveUsageDTO;
import com.polytech.app.dto.HrLeaveRequestDTO;
import com.polytech.app.dto.HrSummaryDTO;
import com.polytech.app.dto.LeaveTypeDistributionDTO;
import com.polytech.app.dto.MonthlyLeaveStatsDTO;
import com.polytech.app.repository.LeaveRequestRepository;
import com.polytech.app.repository.UserRepository;
import com.polytech.app.service.HrReportService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.ResponseBuilder;

@Path("/hr-dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({ "HR" })
public class HrDashboardResource {

	@Inject
	UserRepository userRepository;

	@Inject
	LeaveRequestRepository leaveRequestRepository;

	@Inject
	HrReportService hrReportService;

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
			var employee = userRepository.findById(lr.getEmployee().getId())
					.orElseThrow(() -> new NotFoundException("Employee not found: " + lr.getEmployee().getId()));

			String employeeName = employee.getFirstName() + " " + employee.getLastName();

			return new HrLeaveRequestDTO(lr.getId(), lr.getRequestNumber(), employee.getId(),
					employee.getEmployeeCode(), employeeName, employee.getRole().name(), lr.getLeaveType().getName(),
					lr.getStatus().name(), lr.getTotalDays(), lr.getStartDate(), lr.getEndDate(), lr.getCreatedAt());
		}).toList();
	}

	@GET
	@Path("/leave-utilization")
	@RolesAllowed("HR")
	public List<DepartmentLeaveUtilizationDTO> getDepartmentLeaveUtilization(@QueryParam("year") Integer year) {
		int targetYear = (year != null ? year : LocalDate.now().getYear());
		return hrReportService.getDepartmentLeaveUtilization(targetYear);
	}

	@GET
	@Path("/leave-utilization/monthly")
	@RolesAllowed("HR")
	public List<MonthlyLeaveStatsDTO> getMonthlyStats(@QueryParam("year") Integer year) {
		int targetYear = year != null ? year : LocalDate.now().getYear();
		return hrReportService.getMonthlyLeaveStats(targetYear);
	}

	@GET
	@Path("/leave-utilization/by-type")
	@RolesAllowed("HR")
	public List<LeaveTypeDistributionDTO> getLeaveTypeDistribution(@QueryParam("year") Integer year) {
		int targetYear = year != null ? year : LocalDate.now().getYear();
		return hrReportService.getLeaveTypeDistribution(targetYear);
	}

	@GET
	@Path("/leave-utilization/top-employees")
	@RolesAllowed("HR")
	public List<EmployeeLeaveUsageDTO> getTopEmployees(@QueryParam("year") Integer year,
			@QueryParam("limit") @DefaultValue("10") int limit) {
		int targetYear = year != null ? year : LocalDate.now().getYear();
		return hrReportService.getTopEmployeeLeaveUsage(targetYear, limit);
	}

	@GET
	@Path("/leave-utilization/pdf")
	@RolesAllowed("HR")
	@Produces("application/pdf")
	public Response getLeaveUtilizationPdf(@QueryParam("year") Integer year) throws IOException {
		int targetYear = (year != null ? year : LocalDate.now().getYear());

		// This should return the PDF bytes (implement in HrReportService)
		byte[] pdfBytes = hrReportService.buildLeaveUtilizationPdf(targetYear);

		if (pdfBytes == null || pdfBytes.length == 0) {
			throw new WebApplicationException("Failed to generate report PDF", Response.Status.INTERNAL_SERVER_ERROR);
		}

		ResponseBuilder response = Response.ok(pdfBytes, "application/pdf");
		response.header("Content-Disposition", "attachment; filename=\"leave-utilization-" + targetYear + ".pdf\"");
		return response.build();
	}
}
