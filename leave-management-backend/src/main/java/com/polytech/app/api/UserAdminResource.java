package com.polytech.app.api;

import com.polytech.app.dto.UserAdminDTO;
import com.polytech.app.dto.UserAdminRequest;
import com.polytech.app.service.UserAdminService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.util.List;

@Path("/admin/users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("HR")
public class UserAdminResource {

	@Inject
	UserAdminService userAdminService;

	@GET
	public List<UserAdminDTO> getAll() {
		return userAdminService.getAllUsersForAdmin();
	}

	@POST
	public Response create(UserAdminRequest req) {
		UserAdminDTO created = userAdminService.createUser(req);
		return Response.created(URI.create("/admin/users/" + created.id)).entity(created).build();
	}

	@PUT
	@Path("{id}")
	public UserAdminDTO update(@PathParam("id") String id, UserAdminRequest req) {
		return userAdminService.updateUser(id, req);
	}
}