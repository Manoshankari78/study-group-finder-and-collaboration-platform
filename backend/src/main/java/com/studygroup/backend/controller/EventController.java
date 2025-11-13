package com.studygroup.backend.controller;

import com.studygroup.backend.entity.Event;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.service.EventService;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createEvent(@AuthenticationPrincipal UserDetails userDetails,
                                         @RequestBody Event event) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Event createdEvent = eventService.createEvent(event, user.getId(), event.getGroup().getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Event created successfully",
                    "event", createdEvent
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-events")
    public ResponseEntity<?> getMyEvents(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Event> events = eventService.getUserEvents(user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Events retrieved successfully",
                    "events", events
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupEvents(@PathVariable Long groupId) {
        try {
            List<Event> events = eventService.getGroupEvents(groupId);

            return ResponseEntity.ok(Map.of(
                    "message", "Group events retrieved successfully",
                    "events", events
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEvent(@PathVariable Long eventId) {
        try {
            Event event = eventService.getEvent(eventId);

            return ResponseEntity.ok(Map.of(
                    "message", "Event retrieved successfully",
                    "event", event
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteEvent(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long eventId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            eventService.deleteEvent(eventId, user.getId());

            return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}