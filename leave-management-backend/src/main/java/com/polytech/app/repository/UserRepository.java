package com.polytech.app.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import com.polytech.app.domain.User;

import java.util.Optional;

@ApplicationScoped
public class UserRepository {

    @PersistenceContext(unitName = "leavePU")
    private EntityManager em;

    public Optional<User> findByEmployeeCode(String employeeCode) {
        var list = em.createQuery("SELECT u FROM User u WHERE u.employeeCode = :code", User.class)
                     .setParameter("code", employeeCode)
                     .getResultList();
        return list.stream().findFirst();
    }
}
