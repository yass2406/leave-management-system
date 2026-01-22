package com.polytech.app.repository;

import com.polytech.app.domain.ApprovalHistory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@ApplicationScoped
public class ApprovalHistoryRepository {
    @PersistenceContext(unitName = "leavePU")
    EntityManager em;

    public void save(ApprovalHistory history) {
        em.persist(history);
    }
}