package com.studygroup.backend.controller;

import com.studygroup.backend.entity.Message;
import com.studygroup.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import com.studygroup.backend.dto.MessageRequest;
import org.springframework.http.ResponseEntity;
import java.util.*;
import com.studygroup.backend.dto.TypingIndicator;
@Controller
public class ChatController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send/{groupId}")
    public void sendMessage(
            @Payload MessageRequest messageRequest,
            @AuthenticationPrincipal UserDetails userDetails,
            @DestinationVariable Long groupId) {

        Message message = messageService.saveMessage(
                groupId,
                userDetails.getUsername(),
                messageRequest
        );

        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId,
                message
        );
    }

    @MessageMapping("/chat.typing/{groupId}")
    public void userTyping(
            @Payload TypingIndicator indicator,
            @DestinationVariable Long groupId) {

        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId + "/typing",
                indicator
        );
    }

    // REST endpoints for message history
    @GetMapping("/api/messages/{groupId}")
    public ResponseEntity<?> getMessages(
            @PathVariable Long groupId,
            @RequestParam(required = false) Long afterMessageId) {

        List<Message> messages = messageService.getMessages(groupId, afterMessageId);
        return ResponseEntity.ok(Map.of("messages", messages));
    }

    @PostMapping("/api/messages/{messageId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {

        messageService.markAsRead(messageId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
}
