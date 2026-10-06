package com.fdev.core_backend.analytics.api;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class DashboardDtos {
    private DashboardDtos() {
    }

    public record Summary(
            long totalApplications,
            long activeApplications,
            long interviews,
            long assessments,
            long offers,
            long hired,
            long rejected,
            long ghosted) {
    }

    /** Conversion funnel: each stage shows count and rate relative to total applied. */
    public record FunnelStage(
            String stage,
            long count,
            double rate) {
    }

    public record Funnel(
            long totalApplied,
            List<FunnelStage> stages) {
    }

    /** One application item surfaced on the dashboard for quick action. */
    public record UpcomingItem(
            UUID id,
            String companyName,
            String position,
            String status,
            LocalDate appliedDate,
            String updatedAt) {
    }

    public record Upcoming(List<UpcomingItem> items) {
    }
}
