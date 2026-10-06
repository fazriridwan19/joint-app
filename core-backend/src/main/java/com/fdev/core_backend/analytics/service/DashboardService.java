package com.fdev.core_backend.analytics.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.analytics.api.DashboardDtos;
import com.fdev.core_backend.application.domain.ApplicationEnums.Status;
import com.fdev.core_backend.application.domain.Company;
import com.fdev.core_backend.application.domain.JobApplication;
import com.fdev.core_backend.application.repository.CompanyRepository;
import com.fdev.core_backend.application.repository.JobApplicationRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final JobApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;

    public DashboardService(JobApplicationRepository applicationRepository,
            CompanyRepository companyRepository) {
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
    }

    // ─── Summary ──────────────────────────────────────────────────────────────

    public DashboardDtos.Summary summary(UUID userId) {
        return new DashboardDtos.Summary(
                applicationRepository.countByUserIdAndDeletedAtIsNull(userId),
                applicationRepository.countByUserIdAndDeletedAtIsNullAndArchivedFalse(userId),
                applicationRepository.countByUserIdAndDeletedAtIsNullAndStatus(userId, Status.INTERVIEW),
                applicationRepository.countByUserIdAndDeletedAtIsNullAndStatus(userId, Status.ASSESSMENT),
                applicationRepository.countByUserIdAndDeletedAtIsNullAndStatus(userId, Status.OFFER),
                applicationRepository.countByUserIdAndDeletedAtIsNullAndStatus(userId, Status.HIRED),
                applicationRepository.countByUserIdAndDeletedAtIsNullAndStatus(userId, Status.REJECTED),
                applicationRepository.countByUserIdAndDeletedAtIsNullAndStatus(userId, Status.GHOSTED));
    }

    // ─── Funnel ───────────────────────────────────────────────────────────────

    public DashboardDtos.Funnel funnel(UUID userId) {
        long applied = applicationRepository.countByUserIdAndDeletedAtIsNull(userId);

        // Each funnel stage with its count and conversion rate from total applied
        record Stage(String label, Status status) {}
        List<Stage> stages = List.of(
                new Stage("In Review",          Status.IN_REVIEW),
                new Stage("Assessment",          Status.ASSESSMENT),
                new Stage("Interview",           Status.INTERVIEW),
                new Stage("Offer",               Status.OFFER),
                new Stage("Hired",               Status.HIRED));

        List<DashboardDtos.FunnelStage> funnelStages = stages.stream()
                .map(s -> {
                    long count = applicationRepository.countByUserIdAndDeletedAtIsNullAndStatus(userId, s.status());
                    double rate = applied == 0 ? 0 : Math.round(count * 1000.0 / applied) / 10.0;
                    return new DashboardDtos.FunnelStage(s.label(), count, rate);
                })
                .toList();

        return new DashboardDtos.Funnel(applied, funnelStages);
    }

    // ─── Upcoming ─────────────────────────────────────────────────────────────

    public DashboardDtos.Upcoming upcoming(UUID userId) {
        // Fetch top 10 active applications most recently updated
        List<JobApplication> apps = applicationRepository
                .findActiveOrderByUpdatedAt(userId, PageRequest.of(0, 10))
                .getContent();

        if (apps.isEmpty()) return new DashboardDtos.Upcoming(List.of());

        // Batch-fetch companies to avoid N+1
        Map<UUID, Company> companyMap = companyRepository
                .findAllById(apps.stream().map(JobApplication::getCompanyId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Company::getId, Function.identity()));

        List<DashboardDtos.UpcomingItem> items = apps.stream()
                .map(a -> {
                    String companyName = companyMap.containsKey(a.getCompanyId())
                            ? companyMap.get(a.getCompanyId()).getName()
                            : "—";
                    return new DashboardDtos.UpcomingItem(
                            a.getId(),
                            companyName,
                            a.getPosition(),
                            a.getStatus().name(),
                            a.getAppliedDate(),
                            a.getUpdatedAt().toString());
                })
                .toList();

        return new DashboardDtos.Upcoming(items);
    }
}
