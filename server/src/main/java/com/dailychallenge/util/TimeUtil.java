package com.dailychallenge.util;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Time/date helpers. When timezone is null or invalid, falls back to server default.
 */
public final class TimeUtil {

    private TimeUtil() {
    }

    /**
     * Returns "today" in the given timezone. If timezoneId is null or invalid, returns server date.
     */
    public static LocalDate todayInZone(String timezoneId) {
        if (timezoneId == null || timezoneId.isBlank()) {
            return LocalDate.now();
        }
        try {
            return ZonedDateTime.now(ZoneId.of(timezoneId.trim())).toLocalDate();
        } catch (Exception e) {
            return LocalDate.now();
        }
    }
}
