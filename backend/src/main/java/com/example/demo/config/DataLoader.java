package com.example.demo.config;

import com.example.demo.auth.model.UserAccount;
import com.example.demo.auth.model.UserRole;
import com.example.demo.auth.model.UserStatus;
import com.example.demo.auth.repository.UserAccountRepository;
import com.example.demo.model.MenuItem;
import com.example.demo.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.Locale;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner loadData(
            MenuItemRepository repository,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (repository.count() == 0) {
                MenuItem m1 = new MenuItem(); m1.setName("雞胸肉餐盒"); m1.setPrice(180); m1.setCategory("高蛋白"); m1.setImage("image/chicken.webp");
                MenuItem m2 = new MenuItem(); m2.setName("牛排餐盒"); m2.setPrice(250); m2.setCategory("高蛋白"); m2.setImage("image/beef.webp");
                MenuItem m3 = new MenuItem(); m3.setName("藜麥沙拉"); m3.setPrice(150); m3.setCategory("低糖"); m3.setImage("image/quinoa_salad.webp");
                MenuItem m4 = new MenuItem(); m4.setName("糙米壽司"); m4.setPrice(120); m4.setCategory("低糖"); m4.setImage("image/brown_rice_sushi.webp");
                MenuItem m5 = new MenuItem(); m5.setName("綠色蔬菜拼盤"); m5.setPrice(130); m5.setCategory("均衡飲食"); m5.setImage("image/green_vegetables.webp");
                MenuItem m6 = new MenuItem(); m6.setName("鮭魚餐盒"); m6.setPrice(220); m6.setCategory("均衡飲食"); m6.setImage("image/salmon_meal.webp");

                repository.saveAll(Arrays.asList(m1, m2, m3, m4, m5, m6));
            }

            repository.findAll().forEach(item -> {
                boolean changed = false;

                String normalizedCategory = normalizeCategory(item.getCategory());
                if (!normalizedCategory.equals(item.getCategory())) {
                    item.setCategory(normalizedCategory);
                    changed = true;
                }

                String localizedName = normalizeNameByImage(item.getImage(), item.getName());
                if (!localizedName.equals(item.getName())) {
                    item.setName(localizedName);
                    changed = true;
                }

                if (item.getActive() == null) {
                    item.setActive(true);
                    changed = true;
                }

                if (changed) {
                    repository.save(item);
                }
            });

            if (!userAccountRepository.existsByEmailIgnoreCase("demo@healthymeal.com")) {
                UserAccount demo = new UserAccount();
                demo.setDisplayName("HealthyMeal Demo");
                demo.setEmail("demo@healthymeal.com");
                demo.setUsername("demo");
                demo.setPasswordHash(passwordEncoder.encode("healthy1234"));
                demo.setSecurityQuestion("What is your favorite food?");
                demo.setSecurityAnswerHash(passwordEncoder.encode("salad"));
                demo.setRole(UserRole.ADMIN);
                demo.setStatus(UserStatus.ACTIVE);
                userAccountRepository.save(demo);
            }

            userAccountRepository.findAll().forEach(user -> {
                boolean changed = false;

                if (user.getUsername() == null || user.getUsername().isBlank()) {
                    String candidate = buildUsernameCandidate(user.getDisplayName(), user.getEmail());
                    String unique = makeUniqueUsername(candidate, userAccountRepository);
                    user.setUsername(unique);
                    changed = true;
                }

                if (user.getDisplayName() == null || user.getDisplayName().isBlank()) {
                    user.setDisplayName(user.getUsername());
                    changed = true;
                }

                if (user.getRole() == null) {
                    user.setRole("demo@healthymeal.com".equalsIgnoreCase(user.getEmail()) ? UserRole.ADMIN : UserRole.USER);
                    changed = true;
                }

                if (user.getStatus() == null) {
                    user.setStatus(UserStatus.ACTIVE);
                    changed = true;
                }

                if (changed) {
                    userAccountRepository.save(user);
                }
            });
        };
    }

    private String buildUsernameCandidate(String displayName, String email) {
        String raw = (displayName != null && !displayName.isBlank()) ? displayName : email;
        String normalized = raw == null ? "user" : raw.toLowerCase(Locale.ROOT);
        normalized = normalized.replaceAll("[^a-z0-9_]", "_");
        normalized = normalized.replaceAll("_+", "_");
        normalized = normalized.replaceAll("^_+|_+$", "");
        if (normalized.length() < 3) {
            normalized = "user";
        }
        if (normalized.length() > 20) {
            normalized = normalized.substring(0, 20);
        }
        return normalized;
    }

    private String makeUniqueUsername(String base, UserAccountRepository repository) {
        if (!repository.existsByUsernameIgnoreCase(base)) {
            return base;
        }

        int counter = 1;
        while (counter < 10000) {
            String suffix = "_" + counter;
            int maxBaseLen = Math.max(1, 20 - suffix.length());
            String trimmedBase = base.length() > maxBaseLen ? base.substring(0, maxBaseLen) : base;
            String candidate = trimmedBase + suffix;
            if (!repository.existsByUsernameIgnoreCase(candidate)) {
                return candidate;
            }
            counter++;
        }
        return "user_" + System.currentTimeMillis() % 100000;
    }

    private String normalizeCategory(String category) {
        if (category == null) return "均衡飲食";

        return switch (category.trim().toLowerCase(Locale.ROOT)) {
            case "protein", "高蛋白" -> "高蛋白";
            case "low sugar", "low_sugar", "低糖" -> "低糖";
            case "balanced", "均衡", "均衡飲食" -> "均衡飲食";
            default -> category;
        };
    }

    private String normalizeNameByImage(String image, String currentName) {
        if (image == null) return currentName;

        return switch (image.trim()) {
            case "image/chicken.webp" -> "雞胸肉餐盒";
            case "image/beef.webp" -> "牛排餐盒";
            case "image/quinoa_salad.webp" -> "藜麥沙拉";
            case "image/brown_rice_sushi.webp" -> "糙米壽司";
            case "image/green_vegetables.webp" -> "綠色蔬菜拼盤";
            case "image/salmon_meal.webp" -> "鮭魚餐盒";
            default -> currentName;
        };
    }
}
