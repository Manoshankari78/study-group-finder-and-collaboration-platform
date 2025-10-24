package com.studygroup.backend.controller;

import com.studygroup.backend.entity.Message;
import com.studygroup.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRestController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/groups/{groupId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long groupId,
            @RequestParam(required = false) Long afterMessageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Message> messages = messageService.getMessages(groupId, afterMessageId);
            return ResponseEntity.ok(Map.of(
                    "messages", messages,
                    "count", messages.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/messages/{messageId}/edit")
    public ResponseEntity<?> editMessage(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Message message = messageService.editMessage(
                    messageId,
                    request.get("content"),
                    userDetails.getUsername()
            );
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            messageService.deleteMessage(messageId, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/groups/{groupId}/search")
    public ResponseEntity<?> searchMessages(
            @PathVariable Long groupId,
            @RequestParam String query,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Message> messages = messageService.searchMessages(groupId, query);
            return ResponseEntity.ok(Map.of("messages", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}