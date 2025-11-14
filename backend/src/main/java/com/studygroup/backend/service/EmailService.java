package com.studygroup.backend.service;

import com.studygroup.backend.entity.Event;
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
            message.setSubject("Password Reset - Edunion");

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
            
            You requested to reset your password for the Edunion Platform.
            
            Click this link to reset your password:%s
            
            This link will expire in 24 hours.
            
            If you didn't request this, please ignore this email.
            
            Thanks,
            Team Edunion
            """.formatted(resetLink, resetToken);
    }

    public void sendEventNotification(String toEmail, Event event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("New Study Session: " + event.getTitle());

            String emailText = buildEventNotificationText(event);
            message.setText(emailText);

            mailSender.send(message);
            System.out.println("Event notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send event notification: " + e.getMessage());
        }
    }

    public void sendEventReminder(String toEmail, Event event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Reminder: " + event.getTitle() + " starts soon");

            String emailText = buildEventReminderText(event);
            message.setText(emailText);

            mailSender.send(message);
            System.out.println("Event reminder sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send event reminder: " + e.getMessage());
        }
    }

    private String buildEventNotificationText(Event event) {
        return String.format("""
        ──────────────────────────────────
                               🎓 NEW STUDY SESSION               
        ──────────────────────────────────
        
        📚 TITLE: %s
        ──────────────────────────────────
        📖 DESCRIPTION: 
        %s
        ──────────────────────────────────
        📅 DATE:    %s
        ⏰ TIME:    %s to %s
        📍 LOCATION: %s
        👥 GROUP:   %s
        ──────────────────────────────────
        👤 CREATED BY: %s
        ──────────────────────────────────
        
        You're receiving this notification because you're a 
        member of this study group.
        
        Happy Studying! 🎓
        
        Best regards,
        Team Edunion
        """,
                event.getTitle(),
                event.getDescription(),
                event.getStartTime().toLocalDate(),
                event.getStartTime().toLocalTime(),
                event.getEndTime().toLocalTime(),
                event.getLocation(),
                event.getGroup().getName(),
                event.getCreatedBy().getName()
        );
    }

    private String buildEventReminderText(Event event) {
        return String.format("""
        ─────────────────────────────────
                               ⏰ SESSION REMINDER                 
        ─────────────────────────────────
        
        Your study session is starting soon!
        
        📚 TITLE: %s
        ──────────────────────────────────
        📖 DESCRIPTION: 
        %s
        ──────────────────────────────────
        ⏰ TIME:    %s to %s
        📍 LOCATION: %s
        👥 GROUP:   %s
        ──────────────────────────────────
        
        Don't forget to join on time! 🎓
        
        Best regards,
        Team Edunion
        """,
                event.getTitle(),
                event.getDescription(),
                event.getStartTime().toLocalTime(),
                event.getEndTime().toLocalTime(),
                event.getLocation(),
                event.getGroup().getName()
        );
    }
}