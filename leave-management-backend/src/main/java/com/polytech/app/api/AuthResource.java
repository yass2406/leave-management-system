package com.polytech.app.api;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;
import com.polytech.app.dto.UserDTO;
import com.polytech.app.service.UserService;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    private UserService userService;

    @GET
    @Path("/me")
    @RolesAllowed({"EMPLOYEE","MANAGER","HR"})
    public UserDTO me(@Context SecurityContext securityContext) {
        var principal = securityContext.getUserPrincipal();
        var userOpt = userService.getCurrentUser(principal)
                                 .orElseThrow(() -> new jakarta.ws.rs.ForbiddenException("Unknown user"));

        var dto = new UserDTO();
        dto.id = userOpt.getId();
        dto.employeeCode = userOpt.getEmployeeCode();
        dto.firstName = userOpt.getFirstName();
        dto.lastName = userOpt.getLastName();
        dto.role = userOpt.getRole();
        dto.departmentId = userOpt.getDepartmentId();
        return dto;
    }
}
