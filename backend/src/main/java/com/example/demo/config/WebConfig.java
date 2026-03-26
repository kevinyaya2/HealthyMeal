package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    // 你可以把 allowedOrigins 寫死，或是用設定檔注入
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 這邊我們允許所有的來源，這樣你的 GitHub Pages 才能呼叫
                // 如果要更安全，可以只寫你 GitHub Pages 的網址
                .allowedOriginPatterns("*") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
