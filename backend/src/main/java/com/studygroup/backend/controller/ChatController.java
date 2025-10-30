// ChatController.java (Updated with link support)
package com.studygroup.backend.controller;

import com.studygroup.backend.entity.*;
import com.studygroup.backend.service.ChatService;
import com.studygroup.backend.service.GroupService;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @MessageMapping("/chat/{groupId}/send")
    public void sendMessage(@DestinationVariable Long groupId,
                            @Payload ChatMessageRequest messageRequest) {
        try {
            ChatMessage message = chatService.saveMessage(groupId, messageRequest);

            // sned the message to all members of this group
            messagingTemplate.convertAndSend("/topic/group/" + groupId, message);

        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
    }

    // message history
    @GetMapping("/{groupId}/messages")
    public ResponseEntity<?> getGroupMessages(@AuthenticationPrincipal UserDetails userDetails,
                                              @PathVariable Long groupId,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "50") int size) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is member of the group
            GroupMember membership = groupService.getUserMembershipStatus(user.getId(), groupId);
            if (membership == null || membership.getStatus() != GroupMemberStatus.ACTIVE) {
                throw new RuntimeException("You are not a member of this group");
            }

            List<ChatMessage> messages = chatService.getGroupMessages(groupId, page, size);

            return ResponseEntity.ok(Map.of(
                    "message", "Messages retrieved successfully",
                    "messages", messages
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/upload-file")
    public ResponseEntity<?> uploadChatFile(@AuthenticationPrincipal UserDetails userDetails,
                                            @PathVariable Long groupId,
                                            @RequestBody FileUploadRequest request) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));


            GroupMember membership = groupService.getUserMembershipStatus(user.getId(), groupId);
            if (membership == null || membership.getStatus() != GroupMemberStatus.ACTIVE) {
                throw new RuntimeException("You are not a member of this group");
            }

            ChatMessage fileMessage = chatService.saveFileMessage(groupId, user.getId(), request);

            // send file to all members
            messagingTemplate.convertAndSend("/topic/group/" + groupId, fileMessage);

            return ResponseEntity.ok(Map.of(
                    "message", "File uploaded and sent successfully",
                    "chatMessage", fileMessage
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/share-link")
    public ResponseEntity<?> shareLink(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long groupId,
                                       @RequestBody ShareLinkRequest request) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));


            GroupMember membership = groupService.getUserMembershipStatus(user.getId(), groupId);
            if (membership == null || membership.getStatus() != GroupMemberStatus.ACTIVE) {
                throw new RuntimeException("You are not a member of this group");
            }

            ChatMessage linkMessage = chatService.saveLinkMessage(groupId, user.getId(),
                    request.getUrl(), request.getTitle());

            // send the link message to all members
            messagingTemplate.convertAndSend("/topic/group/" + groupId, linkMessage);

            return ResponseEntity.ok(Map.of(
                    "message", "Link shared successfully",
                    "chatMessage", linkMessage
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request classes
    public static class ChatMessageRequest {
        private Long senderId;
        private String content;
        private MessageType type = MessageType.TEXT;
        private String fileUrl;
        private String fileName;
        private String fileType;
        private Long fileSize;

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public MessageType getType() { return type; }
        public void setType(MessageType type) { this.type = type; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    }

    public static class FileUploadRequest {
        private String fileUrl;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String caption;

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }
    }

    public static class ShareLinkRequest {
        private String url;
        private String title;

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }
}