package com.dailychallenge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for local file uploads (e.g. profile images).
 */
@ConfigurationProperties(prefix = "app.uploads")
public class AppUploadsProperties {

    /**
     * Directory on the file system for uploaded files. Default: ./uploads
     */
    private String dir = "./uploads";

    /**
     * Public base URL for building profile image URLs (e.g. http://localhost:8080).
     */
    private String publicBaseUrl = "http://localhost:8080";

    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
    }

    public String getPublicBaseUrl() {
        return publicBaseUrl;
    }

    public void setPublicBaseUrl(String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl;
    }
}
