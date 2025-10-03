package com.studygroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(toEmail);
            message.setSubject("Password Reset - Study Group Platform");

            String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
            String emailText = buildEmailText(resetLink, resetToken);

            message.setText(emailText);

            mailSender.send(message);

            System.out.println("Password reset email sent to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new RuntimeException("Failed to send email");
        }
    }

    private String buildEmailText(String resetLink, String resetToken) {
        return """
            Password Reset Request
            
            You requested to reset your password for the Study Group Platform.
            
            Click this link to reset your password:%s
            
            Or use this token manually: %s
            
            This link will expire in 24 hours.
            
            If you didn't request this, please ignore this email.
            
            Thanks,
            Study Group Platform Team
            """.formatted(resetLink, resetToken);
    }
}