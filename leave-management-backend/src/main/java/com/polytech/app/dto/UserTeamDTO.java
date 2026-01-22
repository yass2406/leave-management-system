package com.polytech.app.dto;

import com.polytech.app.domain.Role;
import com.polytech.app.domain.User;

public record UserTeamDTO(String id, String employeeCode, String firstName, String lastName, Role role) {
	public static UserTeamDTO fromEntity(User u) {
		return new UserTeamDTO(u.getId(), u.getEmployeeCode(), u.getFirstName(), u.getLastName(), u.getRole());
	}

	public String getFullName() {
		return firstName + " " + lastName;
	}
}
