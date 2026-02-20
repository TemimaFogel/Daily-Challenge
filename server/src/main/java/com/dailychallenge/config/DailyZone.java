package com.dailychallenge.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Single source of truth for "today" in the application timezone.
 * Inject this bean where you need the configured daily zone or current local date.
 */
@Component
public class DailyZone {

    private final AppDailyProperties properties;
    private ZoneId zoneId;

    public DailyZone(AppDailyProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        this.zoneId = ZoneId.of(properties.getZone());
    }

    /** Returns the configured daily timezone. */
    public ZoneId zoneId() {
        return zoneId;
    }

    /** Returns today's date in the configured daily timezone. */
    public LocalDate today() {
        return LocalDate.now(zoneId);
    }
}
