package com.dailychallenge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the application's "daily" timezone (single source of truth for "today").
 */
@ConfigurationProperties(prefix = "app.daily")
public class AppDailyProperties {

    /**
     * IANA timezone ID for daily boundaries (e.g. Asia/Jerusalem). Default: Asia/Jerusalem.
     */
    private String zone = "Asia/Jerusalem";

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }
}
