package com.studygroup.backend.controller;

import com.studygroup.backend.entity.User;
import com.studygroup.backend.entity.UserPreferences;
import com.studygroup.backend.service.UserPreferencesService;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/preferences")
@CrossOrigin(origins = "http://localhost:5173")
public class UserPreferencesController {

    @Autowired
    private UserPreferencesService userPreferencesService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getUserPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserPreferences preferences = userPreferencesService.getUserPreferences(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Preferences retrieved successfully",
                    "preferences", preferences
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateUserPreferences(@AuthenticationPrincipal UserDetails userDetails,
                                                   @RequestBody UserPreferences newPreferences) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserPreferences updatedPreferences = userPreferencesService.updateUserPreferences(user, newPreferences);

            return ResponseEntity.ok(Map.of(
                    "message", "Preferences updated successfully",
                    "preferences", updatedPreferences
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}