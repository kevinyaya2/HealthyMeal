package com.example.demo.auth;

import com.example.demo.auth.model.UserRole;
import com.example.demo.auth.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        if (!requiresAuth(httpRequest)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeJsonError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7);

        try {
            Long userId = jwtService.extractUserId(token);
            UserRole role = jwtService.extractRole(token);

            httpRequest.setAttribute("authUserId", userId);
            httpRequest.setAttribute("authRole", role);

            if (requiresAdmin(httpRequest) && role != UserRole.ADMIN) {
                writeJsonError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Admin permission required");
                return;
            }

            chain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException ex) {
            writeJsonError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Token invalid or expired");
        }
    }

    private boolean requiresAuth(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return false;
        }

        String path = request.getRequestURI();
        return path.startsWith("/api/orders")
                || path.equals("/api/auth/me")
                || path.startsWith("/api/admin/");
    }

    private boolean requiresAdmin(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/api/admin/");
    }

    private void writeJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
    }
}
