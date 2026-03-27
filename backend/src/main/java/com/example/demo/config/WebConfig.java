package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    // ä½ å¯ä»¥æ? allowedOrigins å¯«æ­»ï¼Œæ??¯ç”¨è¨­å?æª”æ³¨??    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // ?™é??‘å€‘å?è¨±æ??‰ç?ä¾†æ?ï¼Œé€™æ¨£ä½ ç? GitHub Pages ?èƒ½?¼å«
                // å¦‚æ?è¦æ›´å®‰å…¨ï¼Œå¯ä»¥åªå¯«ä? GitHub Pages ?„ç¶²?€
                .allowedOriginPatterns("*") 
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
