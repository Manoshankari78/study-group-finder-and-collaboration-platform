package com.studygroup.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Boolean eventNotifications = true;

    @Column(nullable = false)
    private Boolean eventReminders = true;

    @Column(nullable = false)
    private Boolean emailNotifications = true;

    public UserPreferences() {}

    public UserPreferences(User user) {
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean getEventNotifications() {
        return eventNotifications;
    }

    public void setEventNotifications(Boolean eventNotifications) {
        this.eventNotifications = eventNotifications;
    }

    public Boolean getEventReminders() {
        return eventReminders;
    }

    public void setEventReminders(Boolean eventReminders) {
        this.eventReminders = eventReminders;
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }
}