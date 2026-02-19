package com.dailychallenge.controller;

import com.dailychallenge.dto.dashboard.GroupDashboardDTO;
import com.dailychallenge.dto.dashboard.PersonalDashboardDTO;
import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.service.CurrentUserService;
import com.dailychallenge.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardApiController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping("/personal")
    public ResponseEntity<PersonalDashboardDTO> getPersonalDashboard() {
        UUID currentUserId = requireCurrentUserId();
        PersonalDashboardDTO dashboard = dashboardService.buildPersonalDashboard(currentUserId);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/group/{id}")
    public ResponseEntity<GroupDashboardDTO> getGroupDashboard(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        GroupDashboardDTO dashboard = dashboardService.buildGroupDashboard(currentUserId, id);
        return ResponseEntity.ok(dashboard);
    }

    private UUID requireCurrentUserId() {
        UUID userId = currentUserService.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
