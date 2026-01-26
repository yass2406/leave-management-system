package com.polytech.app.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import com.polytech.app.domain.User;
import com.polytech.app.repository.UserRepository;

import java.security.Principal;
import java.util.Optional;

@ApplicationScoped
public class UserService {

	@Inject
	private UserRepository userRepository;

	public Optional<User> getCurrentUser(Principal principal) {
		if (principal == null) {
			return Optional.empty();
		}
		String username = principal.getName();
		return userRepository.findByEmployeeCode(username).filter(u -> Boolean.TRUE.equals(u.getActive()));
	}

	public Optional<User> findById(String employeeId) {
		return userRepository.findById(employeeId);
	}

	public void save(User user) {
		if (user.getId() == null) {
			userRepository.save(user);
		} else {
			userRepository.update(user);
		}
	}

}
