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

	@POST
	@RolesAllowed("HR")
	public LeaveType create(LeaveType dto) {
		dto.setCode(dto.getCode().toUpperCase());

		// default values if omitted
		if (dto.getMaxDaysPerYear() == null) {
			dto.setMaxDaysPerYear(25);
		}
		if (dto.getIsPaid() == null) {
			dto.setIsPaid(Boolean.TRUE);
		}
		if (dto.getRequiresApproval() == null) {
			dto.setRequiresApproval(Boolean.TRUE);
		}
		if (dto.getColor() == null || dto.getColor().isBlank()) {
			dto.setColor("#3498db");
		}
		if (dto.getActive() == null) {
		    dto.setActive(Boolean.TRUE);
		  }
		return leaveTypeRepository.save(dto);
	}

	@PUT
	@Path("/{id}")
	@RolesAllowed("HR")
	public LeaveType update(@PathParam("id") String id, LeaveType dto) {
		LeaveType existing = leaveTypeRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Leave type not found"));

		boolean isSpecial = "ANNUAL".equals(existing.getCode()) || "SICK".equals(existing.getCode());

		if (!isSpecial && dto.getCode() != null) {
			existing.setCode(dto.getCode().toUpperCase());
		}

		if (dto.getName() != null) {
			existing.setName(dto.getName());
		}
		if (dto.getMaxDaysPerYear() != null) {
			existing.setMaxDaysPerYear(dto.getMaxDaysPerYear());
		}
		if (dto.getIsPaid() != null) {
			existing.setIsPaid(dto.getIsPaid());
		}
		if (dto.getRequiresApproval() != null) {
			existing.setRequiresApproval(dto.getRequiresApproval());
		}
		if (dto.getColor() != null) {
			existing.setColor(dto.getColor());
		}

		return leaveTypeRepository.save(existing);
	}

	@PUT
	@Path("/{id}/toggle-active")
	@RolesAllowed("HR")
	public LeaveType toggleActive(@PathParam("id") String id) {
		LeaveType existing = leaveTypeRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Leave type not found"));
		existing.setActive(!Boolean.TRUE.equals(existing.getActive()));
		return leaveTypeRepository.save(existing);
	}
}
