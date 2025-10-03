package com.studygroup.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    private String secondarySchool;
    private Integer secondarySchoolPassingYear;
    private Float secondarySchoolPercentage;
    private String higherSecondarySchool;
    private Integer higherSecondaryPassingYear;
    private Float higherSecondaryPercentage;
    private String universityName;
    private Integer universityPassingYear;
    private Float universityPassingGPA;
    private String avatarUrl;
    private String bio;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public User() {}

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getSecondarySchool() { return secondarySchool; }
    public void setSecondarySchool(String secondarySchool) { this.secondarySchool = secondarySchool; }

    public Integer getSecondarySchoolPassingYear() { return secondarySchoolPassingYear; }
    public void setSecondarySchoolPassingYear(Integer secondarySchoolPassingYear) { this.secondarySchoolPassingYear = secondarySchoolPassingYear; }

    public Float getSecondarySchoolPercentage() { return secondarySchoolPercentage; }
    public void setSecondarySchoolPercentage(Float secondarySchoolPercentage) { this.secondarySchoolPercentage = secondarySchoolPercentage; }

    public String getHigherSecondarySchool() { return higherSecondarySchool; }
    public void setHigherSecondarySchool(String higherSecondarySchool) { this.higherSecondarySchool = higherSecondarySchool; }

    public Integer getHigherSecondaryPassingYear() { return higherSecondaryPassingYear; }
    public void setHigherSecondaryPassingYear(Integer higherSecondaryPassingYear) { this.higherSecondaryPassingYear = higherSecondaryPassingYear; }

    public Float getHigherSecondaryPercentage() { return higherSecondaryPercentage; }
    public void setHigherSecondaryPercentage(Float higherSecondaryPercentage) { this.higherSecondaryPercentage = higherSecondaryPercentage; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public Integer getUniversityPassingYear() { return universityPassingYear; }
    public void setUniversityPassingYear(Integer universityPassingYear) { this.universityPassingYear = universityPassingYear; }

    public Float getUniversityPassingGPA() { return universityPassingGPA; }
    public void setUniversityPassingGPA(Float universityPassingGPA) { this.universityPassingGPA = universityPassingGPA; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

}
