package com.studygroup.backend.controller;

import com.studygroup.backend.entity.User;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class ProfileController {

    @Autowired
    private UserService userService;

    // GET user profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(Map.of(
                    "message", "Profile retrieved successfully",
                    "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT update profile (existing code)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody ProfileUpdateRequest request) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update all fields
            user.setName(request.getName());
            user.setSecondarySchool(request.getSecondarySchool());
            user.setSecondarySchoolPassingYear(request.getSecondarySchoolPassingYear());
            user.setSecondarySchoolPercentage(request.getSecondarySchoolPercentage());
            user.setHigherSecondarySchool(request.getHigherSecondarySchool());
            user.setHigherSecondaryPassingYear(request.getHigherSecondaryPassingYear());
            user.setHigherSecondaryPercentage(request.getHigherSecondaryPercentage());
            user.setUniversityName(request.getUniversityName());
            user.setUniversityPassingYear(request.getUniversityPassingYear());
            user.setUniversityPassingGPA(request.getUniversityPassingGPA());
            user.setBio(request.getBio());

            User updatedUser = userService.updateUserProfile(user.getId(), user);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully",
                    "user", updatedUser
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Existing ProfileUpdateRequest class
    public static class ProfileUpdateRequest {
        private String name;
        private String secondarySchool;
        private Integer secondarySchoolPassingYear;
        private Float secondarySchoolPercentage;
        private String higherSecondarySchool;
        private Integer higherSecondaryPassingYear;
        private Float higherSecondaryPercentage;
        private String universityName;
        private Integer universityPassingYear;
        private Float universityPassingGPA;
        private String bio;

        // Getters and setters (keep your existing ones)
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

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

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
    }
}