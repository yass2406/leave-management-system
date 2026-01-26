package com.polytech.app.service;

import com.polytech.app.repository.UserRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class EmployeeCodeGenerator {

	@Inject
	UserRepository userRepository;

	public String generateNextCode() {
		int max = userRepository.findMaxEmployeeNumber();
		int next = max + 1;
		return String.format("EMP%03d", next);
	}
}
