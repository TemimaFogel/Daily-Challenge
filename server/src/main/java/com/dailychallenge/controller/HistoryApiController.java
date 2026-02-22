package com.dailychallenge.controller;

import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.service.CurrentUserService;
import com.dailychallenge.service.HistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryApiController {

    private final HistoryService historyService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get activity history", description = "Returns entries and daily summaries for the given date range (in user's timezone). Current user only.")
    public ResponseEntity<HistoryService.HistoryResponse> getHistory(
            @Parameter(description = "Start date (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "End date (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        UUID userId = requireCurrentUserId();
        if (from.isAfter(to)) {
            return ResponseEntity.badRequest().build();
        }
        HistoryService.HistoryResponse response = historyService.getHistory(userId, from, to);
        return ResponseEntity.ok(response);
    }

    private UUID requireCurrentUserId() {
        UUID userId = currentUserService.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
