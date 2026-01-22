package com.polytech.app.api;

import java.util.List;

import com.polytech.app.domain.User;
import com.polytech.app.dto.UserTeamDTO;
import com.polytech.app.repository.UserRepository;
import com.polytech.app.service.UserService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

@Path("/users")
@RolesAllowed({ "EMPLOYEE", "MANAGER", "HR" })
public class UserResource {

	@Inject
	UserRepository userRepo;
	@Inject
	UserService userService;

	@GET
	@Path("/team")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getTeam(@Context SecurityContext ctx) {
		User current = userService.getCurrentUser(ctx.getUserPrincipal())
				.orElseThrow(() -> new NotFoundException("User not found"));

		List<User> team = userRepo.findTeamForUser(current);

		List<UserTeamDTO> dtos = team.stream().map(UserTeamDTO::fromEntity)
				.collect(java.util.stream.Collectors.toList());

		GenericEntity<List<UserTeamDTO>> entity = new GenericEntity<>(dtos) {
		};
		return Response.ok(entity).build();
	}
}