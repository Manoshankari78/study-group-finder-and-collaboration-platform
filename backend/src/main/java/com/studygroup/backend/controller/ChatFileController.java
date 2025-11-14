package com.studygroup.backend.controller;

import com.studygroup.backend.service.CloudinaryService;
import com.studygroup.backend.service.GroupService;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "https://edunion.onrender.com")
public class ChatFileController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @PostMapping("/{groupId}/upload")
    public ResponseEntity<?> uploadChatFile(@AuthenticationPrincipal UserDetails userDetails,
                                            @PathVariable Long groupId,
                                            @RequestParam("file") MultipartFile file,
                                            @RequestParam(value = "caption", required = false) String caption) {
        try {
            // validate user and group membership
            var user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            var membership = groupService.getUserMembershipStatus(user.getId(), groupId);
            if (membership == null || membership.getStatus() != com.studygroup.backend.entity.GroupMemberStatus.ACTIVE) {
                throw new RuntimeException("You are not a member of this group");
            }

            // file validation
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Check file size limit of 10mb
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 10MB"));
            }

            // Upload file to Cloudinary
            String fileUrl = cloudinaryService.uploadFile(file);

            return ResponseEntity.ok(Map.of(
                    "message", "File uploaded successfully",
                    "fileUrl", fileUrl,
                    "fileName", file.getOriginalFilename(),
                    "fileType", file.getContentType(),
                    "fileSize", file.getSize(),
                    "caption", caption
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
