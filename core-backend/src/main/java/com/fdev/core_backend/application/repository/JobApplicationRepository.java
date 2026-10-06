package com.fdev.core_backend.application.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fdev.core_backend.application.domain.ApplicationEnums.Status;
import com.fdev.core_backend.application.domain.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    Optional<JobApplication> findByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);
    Page<JobApplication> findByUserIdAndDeletedAtIsNullAndArchivedFalse(UUID userId, Pageable pageable);
    Page<JobApplication> findByUserIdAndDeletedAtIsNullAndArchived(UUID userId, boolean archived, Pageable pageable);
    Page<JobApplication> findByUserIdAndDeletedAtIsNullAndStatusAndArchived(UUID userId, Status status, boolean archived, Pageable pageable);

    /** Search by position OR company name (case-insensitive), scoped to user + archived flag. */
    @Query("""
            SELECT a FROM JobApplication a
            JOIN Company c ON c.id = a.companyId
            WHERE a.userId = :userId
              AND a.deletedAt IS NULL
              AND a.archived = :archived
              AND (LOWER(a.position) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(c.name)    LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<JobApplication> searchByPositionOrCompanyName(
            @Param("userId") UUID userId,
            @Param("query") String query,
            @Param("archived") boolean archived,
            Pageable pageable);

    long countByUserIdAndDeletedAtIsNull(UUID userId);
    long countByUserIdAndDeletedAtIsNullAndArchivedFalse(UUID userId);
    long countByUserIdAndDeletedAtIsNullAndStatus(UUID userId, Status status);

    /** Active applications (not archived, not deleted, not terminal status) ordered by most recently updated. */
    @Query("""
            SELECT a FROM JobApplication a
            WHERE a.userId = :userId
              AND a.deletedAt IS NULL
              AND a.archived = false
              AND a.status NOT IN ('HIRED', 'REJECTED', 'WITHDRAWN')
            ORDER BY a.updatedAt DESC
            """)
    Page<JobApplication> findActiveOrderByUpdatedAt(@Param("userId") UUID userId, Pageable pageable);
}