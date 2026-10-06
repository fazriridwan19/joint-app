package com.fdev.core_backend.identity.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.identity.service.JwtService;
import com.fdev.core_backend.identity.service.UserPrincipalService;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserPrincipalService userPrincipalService;

    public JwtAuthenticationFilter(JwtService jwtService, UserPrincipalService userPrincipalService) {
        this.jwtService = jwtService;
        this.userPrincipalService = userPrincipalService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                UserPrincipal principal = userPrincipalService.loadById(jwtService.parseUserId(header.substring(7)));
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
            } catch (RuntimeException _) {
                request.setAttribute("authError", "TOKEN_INVALID");
            }
        }
        filterChain.doFilter(request, response);
    }
}