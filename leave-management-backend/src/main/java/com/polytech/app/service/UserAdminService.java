package com.polytech.app.service;

import com.polytech.app.domain.User;
import com.polytech.app.domain.Department;
import com.polytech.app.dto.UserAdminDTO;
import com.polytech.app.dto.UserAdminRequest;
import com.polytech.app.repository.UserRepository;
import com.polytech.app.repository.DepartmentRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import javax.naming.NamingException;

@ApplicationScoped
@Transactional
public class UserAdminService {

	@Inject
	UserRepository userRepository;

	@Inject
	DepartmentRepository departmentRepository;

	@Inject
	LdapProvisioningService ldapProvisioningService;

	@Inject
	EmployeeCodeGenerator employeeCodeGenerator;

	public List<UserAdminDTO> getAllUsersForAdmin() {
		return userRepository.findAllWithDepartment().stream().map(this::toDto).collect(Collectors.toList());
	}

	public UserAdminDTO createUser(UserAdminRequest req) {
		Department dept = departmentRepository.findById(req.departmentId)
				.orElseThrow(() -> new IllegalArgumentException("Department not found"));

		String employeeCode = employeeCodeGenerator.generateNextCode();
		String initialPassword = (req.firstName + req.lastName).replace(" ", "");
		boolean ldapCreated = false;

		try {
			ldapProvisioningService.createLdapUser(employeeCode, req.firstName, req.lastName, initialPassword,
					req.role.name());

			ldapCreated = true;

			User u = new User();
			u.setEmployeeCode(employeeCode);
			u.setFirstName(req.firstName);
			u.setLastName(req.lastName);
			u.setRole(req.role);
			u.setDepartment(dept);
			u.setActive(req.active);
			u.setHireDate(LocalDate.now());
			u.setMustChangePassword(true);
			
			if (dept.getManager() != null) {
		        u.setManager(dept.getManager());
		    }

			userRepository.save(u);

			return toDto(u);
		} catch (NamingException e) {
			if (ldapCreated) {
				try {
					ldapProvisioningService.deleteLdapUser(employeeCode);
				} catch (Exception ignore) {
				}
			}
			throw new RuntimeException("Failed to create user", e);
		}
	}

	public UserAdminDTO updateUser(String id, UserAdminRequest req) {
		User u = userRepository.findByIdWithDepartment(id)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));

		Department dept = departmentRepository.findById(req.departmentId)
				.orElseThrow(() -> new IllegalArgumentException("Department not found"));

		u.setFirstName(req.firstName);
		u.setLastName(req.lastName);
		u.setRole(req.role);
		u.setDepartment(dept);
		u.setActive(req.active);

		userRepository.update(u);
		return toDto(u);
	}

	private UserAdminDTO toDto(User u) {
		UserAdminDTO dto = new UserAdminDTO();
		dto.id = u.getId();
		dto.employeeCode = u.getEmployeeCode();
		dto.firstName = u.getFirstName();
		dto.lastName = u.getLastName();
		dto.role = u.getRole();
		if (u.getDepartment() != null) {
			dto.departmentId = u.getDepartment().getId();
			dto.departmentName = u.getDepartment().getName();
		}
		dto.active = u.getActive();
		return dto;
	}

}