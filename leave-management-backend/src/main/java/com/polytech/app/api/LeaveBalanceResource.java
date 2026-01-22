package com.polytech.app.api;

import java.util.List;

import com.polytech.app.dto.LeaveBalanceDTO;
import com.polytech.app.repository.LeaveBalanceRepository;
import com.polytech.app.service.UserService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

@Path("/leave-balances")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({ "EMPLOYEE", "MANAGER", "HR" })
public class LeaveBalanceResource {

	@Inject
	UserService userService;
	@Inject
	LeaveBalanceRepository balanceRepo;

	@GET
	@Path("/me/{year}")
	public List<LeaveBalanceDTO> getMyBalances(@PathParam("year") int year, @Context SecurityContext sc) {

		var principal = sc.getUserPrincipal();
		var user = userService.getCurrentUser(principal).orElseThrow(() -> new ForbiddenException("Unknown user"));

		return balanceRepo.findByUserAndYear(user.getId(), year).stream()
				.map(b -> new LeaveBalanceDTO(b.getLeaveType().getId(), b.getLeaveType().getCode(),
						b.getLeaveType().getName(), b.getYear(), b.getEntitledDays(), b.getCarriedOver(),
						b.getTakenDays(), b.getRemainingDays()))
				.toList();
	}
}
