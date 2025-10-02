package com.studygroup.backend.controller;

import com.studygroup.backend.service.CloudinaryService;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class AvatarController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserService userService;

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@AuthenticationPrincipal UserDetails userDetails,
                                          @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            // Check file size (5MB limit)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
            }

            // Get current user
            var user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Delete old avatar from Cloudinary if exists
            if (user.getAvatarUrl() != null && user.getAvatarUrl().contains("cloudinary.com")) {
                cloudinaryService.deleteImage(user.getAvatarUrl());
            }

            // Upload new image to Cloudinary
            String imageUrl = cloudinaryService.uploadImage(file);

            // Update user's avatar URL
            user.setAvatarUrl(imageUrl);
            userService.updateUserProfile(user.getId(), user);

            return ResponseEntity.ok(Map.of(
                    "message", "Avatar uploaded successfully",
                    "avatarUrl", imageUrl
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/remove-avatar")
    public ResponseEntity<?> removeAvatar(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            var user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Delete avatar from Cloudinary if exists
            if (user.getAvatarUrl() != null && user.getAvatarUrl().contains("cloudinary.com")) {
                cloudinaryService.deleteImage(user.getAvatarUrl());
            }

            // Remove avatar URL from user
            user.setAvatarUrl(null);
            userService.updateUserProfile(user.getId(), user);

            return ResponseEntity.ok(Map.of("message", "Avatar removed successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}