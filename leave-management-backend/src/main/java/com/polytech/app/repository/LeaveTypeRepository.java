package com.polytech.app.repository;

import com.polytech.app.domain.LeaveType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
@Named
public class LeaveTypeRepository {
    @PersistenceContext
    EntityManager em;

    public List<LeaveType> findAll() {
        return em.createQuery("select lt from LeaveType lt order by lt.name", LeaveType.class)
                 .getResultList();
    }

    public Optional<LeaveType> findById(String id) {
        return Optional.ofNullable(em.find(LeaveType.class, id));
    }
}
