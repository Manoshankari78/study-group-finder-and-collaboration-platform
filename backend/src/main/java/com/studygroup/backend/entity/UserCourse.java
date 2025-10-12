package com.studygroup.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_courses", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "course_id"})
})
public class UserCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDateTime enrolledAt;

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
    }

    // Constructors
    public UserCourse() {}

    public UserCourse(User user, Course course) {
        this.user = user;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
}