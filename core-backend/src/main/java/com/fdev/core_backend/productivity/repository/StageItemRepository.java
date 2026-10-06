package com.fdev.core_backend.productivity.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fdev.core_backend.productivity.domain.StageItem;

import jakarta.persistence.LockModeType;

public interface StageItemRepository extends JpaRepository<StageItem, UUID> {

    List<StageItem> findAllByJobApplicationIdAndRoadmapStageIdOrderByScheduledAtAscStartTimeAsc(
            UUID applicationId,
            UUID roadmapStageId);

    List<StageItem> findAllByJobApplicationIdOrderByScheduledAtAscStartTimeAsc(UUID applicationId);

    List<StageItem> findAllByRoadmapStageId(UUID roadmapStageId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s
            FROM StageItem s
            WHERE s.status NOT IN ('DONE', 'CANCELLED')
            AND s.scheduledAt BETWEEN :today AND :maxDate
            AND (s.remindedAt IS NULL OR s.remindedAt < :today)
            ORDER BY s.scheduledAt ASC, s.startTime ASC
            """)
    List<StageItem> findAllAndLockUpcomingReminderTasks(
            @Param("today") LocalDate today,
            @Param("maxDate") LocalDate maxDate);
}
