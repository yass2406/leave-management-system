package com.polytech.app.api;

import com.polytech.app.domain.LeaveType;
import com.polytech.app.repository.LeaveTypeRepository;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/leave-types")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LeaveTypeResource {

    @Inject
    LeaveTypeRepository leaveTypeRepository;

    @GET
    @RolesAllowed({ "EMPLOYEE", "MANAGER", "HR" })
    public List<LeaveType> getAll() {
        return leaveTypeRepository.findAll();
    }
}
