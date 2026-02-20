package com.dailychallenge;

import com.dailychallenge.config.AppDailyProperties;
import com.dailychallenge.config.AppUploadsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({ AppDailyProperties.class, AppUploadsProperties.class })
public class ServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServerApplication.class, args);
    }
}

