package com.fdev.core_backend.cv.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import com.fdev.core_backend.cv.domain.CandidateCvProfile;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;

public interface CandidateCvProfileRepository extends JpaRepository<CandidateCvProfile, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({ @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000") })
    @Query("""
            SELECT p FROM CandidateCvProfile p
            WHERE p.status = :status
              AND p.stage = :stage
              AND p.retryCount < :maxRetry
            ORDER BY p.createdAt ASC
            """)
    List<CandidateCvProfile> findPendingForExtraction(
            @Param("status") CandidateCvProfile.Status status,
            @Param("stage") CandidateCvProfile.StageProcess stage,
            @Param("maxRetry") int maxRetry,
            Pageable pageable);

    List<CandidateCvProfile> findAllByApplicationId(UUID applicationId);
}
