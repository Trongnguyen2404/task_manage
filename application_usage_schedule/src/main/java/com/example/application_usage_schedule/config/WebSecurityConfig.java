package com.example.application_usage_schedule.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .cors().and()
                .authorizeHttpRequests()
                .requestMatchers("/api/user/register", "/api/user/login", "/api/schedule/**").permitAll()  // Các endpoint công khai
                .requestMatchers("/api/user/**").permitAll()  // Cho phép tất cả mọi người truy cập vào /api/user/*
                .requestMatchers("/api/notification/**").permitAll() // Thêm cấu hình cho /api/notification/*
                .anyRequest().authenticated();  // Các yêu cầu khác yêu cầu xác thực
        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); // Cho phép tất cả các nguồn gốc
        config.addAllowedHeader("*"); // Cho phép tất cả các header
        config.addAllowedMethod("*"); // Cho phép tất cả các phương thức
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
