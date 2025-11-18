package com.leaguerank.lolplayer;

import org.springframework.boot.SpringApplication;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableCaching
public class LolPlayerTrackerApplication {

    public static void main(String[] args) {
        loadEnvIfPresent();
        SpringApplication.run(LolPlayerTrackerApplication.class, args);
    }

    private static void loadEnvIfPresent() {
        loadEnvFile(".env", false);
        loadEnvFile(".env.local", true);
    }

    private static void loadEnvFile(String filename, boolean overrideExisting) {
        Dotenv dotenv = Dotenv.configure()
            .filename(filename)
            .ignoreIfMissing()
            .ignoreIfMalformed()
            .load();

        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            if (System.getenv(key) != null) {
                return; // real environment variable already provided
            }

            if (!overrideExisting && System.getProperty(key) != null) {
                return;
            }

            System.setProperty(key, entry.getValue());
        });
    }
}
