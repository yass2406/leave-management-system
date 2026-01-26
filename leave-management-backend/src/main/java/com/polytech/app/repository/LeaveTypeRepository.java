package com.polytech.app.repository;

import com.polytech.app.domain.LeaveType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
@Named
@Transactional
public class LeaveTypeRepository {
	@PersistenceContext
	EntityManager em;

	public List<LeaveType> findAll() {
		return em.createQuery("select lt from LeaveType lt order by lt.name", LeaveType.class).getResultList();
	}

	public Optional<LeaveType> findById(String id) {
		return Optional.ofNullable(em.find(LeaveType.class, id));
	}

	public Optional<LeaveType> findByCode(String code) {
		var list = em.createQuery("SELECT lt FROM LeaveType lt WHERE lt.code = :code", LeaveType.class)
				.setParameter("code", code).getResultList();
		return list.stream().findFirst();
	}

	public LeaveType save(LeaveType lt) {
		if (lt.getId() == null) {
			em.persist(lt);
			return lt;
		} else {
			return em.merge(lt);
		}
	}
}
