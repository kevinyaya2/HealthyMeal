package com.example.demo.auth.repository;

import com.example.demo.auth.model.UserAccount;
import com.example.demo.auth.model.UserRole;
import com.example.demo.auth.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);
    Optional<UserAccount> findByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    long countByRole(UserRole role);
    long countByRoleAndStatus(UserRole role, UserStatus status);
}
