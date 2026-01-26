package com.polytech.app.dto;

import com.polytech.app.domain.Role;

public class UserAdminRequest {
	public String employeeCode;
	public String firstName;
	public String lastName;
	public String email;
	public Role role;
	public String departmentId;
	public boolean active;
}
