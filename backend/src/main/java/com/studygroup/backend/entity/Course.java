package com.studygroup.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Course code is required")
    @Size(max = 20, message = "Course code must not exceed 20 characters")
    @Column(unique = true, nullable = false)
    private String courseCode;

    @NotBlank(message = "Course name is required")
    @Size(max = 100, message = "Course name must not exceed 100 characters")
    @Column(nullable = false)
    private String courseName;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private Integer credits;
    private String department;

    // Constructors
    public Course() {}

    public Course(String courseCode, String courseName, String description, Integer credits, String department) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.description = description;
        this.credits = credits;
        this.department = department;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}