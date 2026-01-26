package com.polytech.app.api;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;
import com.polytech.app.dto.UserDTO;
import com.polytech.app.service.LdapProvisioningService;
import com.polytech.app.service.UserService;
import jakarta.transaction.Status;
import jakarta.transaction.SystemException;
import jakarta.transaction.UserTransaction;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

	@Inject
	private UserService userService;

	@Inject
	private LdapProvisioningService ldapProvisioningService;

	@Inject
	private UserTransaction tx;

	public static class ChangePasswordRequest {
		public String oldPassword;
		public String newPassword;
	}

	@GET
	@Path("/me")
	@RolesAllowed({ "EMPLOYEE", "MANAGER", "HR" })
	public UserDTO me(@Context SecurityContext securityContext) {
		var principal = securityContext.getUserPrincipal();
		var userOpt = userService.getCurrentUser(principal)
				.orElseThrow(() -> new jakarta.ws.rs.ForbiddenException("User disabled or not found"));

		var dto = new UserDTO();
		dto.id = userOpt.getId();
		dto.employeeCode = userOpt.getEmployeeCode();
		dto.firstName = userOpt.getFirstName();
		dto.lastName = userOpt.getLastName();
		dto.role = userOpt.getRole();
		dto.departmentId = userOpt.getDepartment() != null ? userOpt.getDepartment().getId() : null;
		dto.mustChangePassword = Boolean.TRUE.equals(userOpt.getMustChangePassword());
		return dto;
	}

	@POST
	@Path("/change-password")
	@RolesAllowed({ "EMPLOYEE", "MANAGER", "HR" })
	public void changePassword(ChangePasswordRequest req, @Context SecurityContext securityContext)
			throws IllegalStateException, SecurityException, SystemException {
		var principal = securityContext.getUserPrincipal();
		if (principal == null)
			throw new NotAuthorizedException("No principal");

		var user = userService.getCurrentUser(principal)
				.orElseThrow(() -> new ForbiddenException("Unknown or inactive user"));

		String uid = user.getEmployeeCode();

		try {
			tx.begin();
			ldapProvisioningService.changeUserPassword(uid, req.oldPassword, req.newPassword);
			user.setMustChangePassword(false);
			userService.save(user);
			tx.commit();
		} catch (IllegalArgumentException e) {
			if (tx.getStatus() != Status.STATUS_NO_TRANSACTION)
				tx.rollback();
			throw new ForbiddenException("Invalid current password");
		} catch (Exception e) {
			if (tx.getStatus() != Status.STATUS_NO_TRANSACTION)
				tx.rollback();
			throw new InternalServerErrorException("Could not change password");
		}
	}
}
