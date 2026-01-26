package com.polytech.app.dto;

import com.polytech.app.domain.Role;

public class UserDTO {
    public String id;
    public String employeeCode;
    public String firstName;
    public String lastName;
    public Role role;
    public String departmentId;
	public boolean mustChangePassword;
}
