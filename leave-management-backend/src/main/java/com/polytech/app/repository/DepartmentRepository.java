package com.polytech.app.repository;

import com.polytech.app.domain.Department;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
@Transactional
public class DepartmentRepository {

	@PersistenceContext
	EntityManager em;

	public Optional<Department> findById(String id) {
		Department dept = em.find(Department.class, id);
		return Optional.ofNullable(dept);
	}

	public Optional<Department> findByCode(String code) {
		List<Department> result = em.createQuery("SELECT d FROM Department d WHERE d.code = :code", Department.class)
				.setParameter("code", code).setMaxResults(1).getResultList();
		return result.stream().findFirst();
	}

	public List<Department> findAll() {
		return em.createQuery("SELECT d FROM Department d ORDER BY d.name", Department.class).getResultList();
	}

	public void save(Department department) {
		em.persist(department);
	}

	public Department update(Department department) {
		return em.merge(department);
	}
}