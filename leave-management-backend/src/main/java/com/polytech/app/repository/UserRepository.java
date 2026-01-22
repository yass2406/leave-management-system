package com.polytech.app.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.polytech.app.domain.Role;
import com.polytech.app.domain.User;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserRepository {

	@PersistenceContext(unitName = "leavePU")
	private EntityManager em;

	public Optional<User> findByEmployeeCode(String employeeCode) {
		var list = em.createQuery("SELECT u FROM User u WHERE u.employeeCode = :code", User.class)
				.setParameter("code", employeeCode).getResultList();
		return list.stream().findFirst();
	}

	public Optional<User> findById(String id) {
		return Optional.ofNullable(em.find(User.class, id));
	}

	public List<User> findTeamForUser(User currentUser) {
		String currentId = currentUser.getId();
		String managerId = currentUser.getManagerId();
		Role role = currentUser.getRole();

		// HR: managers who report to this HR
		if (role == Role.HR) {
			return em
					.createQuery("SELECT u FROM User u "
							+ "WHERE u.managerId = :currentId AND u.role = :managerRole AND u.active = true "
							+ "ORDER BY u.lastName, u.firstName", User.class)
					.setParameter("currentId", currentId).setParameter("managerRole", Role.MANAGER).getResultList();
		}

		// MANAGER: employees who report to this Manager
		if (role == Role.MANAGER) {
			return em
					.createQuery("SELECT u FROM User u "
							+ "WHERE u.managerId = :currentId AND u.role = :employeeRole AND u.active = true "
							+ "ORDER BY u.lastName, u.firstName", User.class)
					.setParameter("currentId", currentId).setParameter("employeeRole", Role.EMPLOYEE).getResultList();
		}

		// EMPLOYEE: manager + fellow employees under same manager
		if (role == Role.EMPLOYEE && managerId != null) {
			return em
					.createQuery("SELECT u FROM User u " + "WHERE u.active = true AND (" + " u.id = :managerId "
							+ "   OR (u.managerId = :managerId AND u.role = :employeeRole)"
							+ ") ORDER BY u.role DESC, u.lastName, u.firstName", User.class)
					.setParameter("managerId", managerId).setParameter("employeeRole", Role.EMPLOYEE).getResultList();
		}

		// No manager, or unknown role -> empty team
		return java.util.Collections.emptyList();
	}

	public long countAll() {
		return em.createQuery("SELECT COUNT(u) FROM User u", Long.class).getSingleResult();
	}

	public long countByRole(Role role) {
		return em.createQuery("SELECT COUNT(u) FROM User u WHERE u.role = :role", Long.class).setParameter("role", role)
				.getSingleResult();
	}
}
