package com.fdev.core_backend.analytics.api;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdev.core_backend.analytics.service.DashboardService;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiResponse;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    ApiResponse<DashboardDtos.Summary> summary(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.success(service.summary(p.getId()));
    }

    @GetMapping("/funnel")
    ApiResponse<DashboardDtos.Funnel> funnel(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.success(service.funnel(p.getId()));
    }

    @GetMapping("/upcoming")
    ApiResponse<DashboardDtos.Upcoming> upcoming(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.success(service.upcoming(p.getId()));
    }
}
