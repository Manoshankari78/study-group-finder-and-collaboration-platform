package com.studygroup.backend.service;

import com.studygroup.backend.entity.*;
import com.studygroup.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@Transactional
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Document uploadDocument(Long groupId, String userEmail, MultipartFile file, String description) {
        // Verify group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Verify user exists
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user is a member of the group
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("User is not a member of this group");
        }

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > 50 * 1024 * 1024) { // 50MB limit
            throw new RuntimeException("File size exceeds 50MB limit");
        }

        try {
            // Upload file to Cloudinary
            String fileUrl = cloudinaryService.uploadDocument(file);

            // Create document record
            Document document = new Document();
            document.setGroup(group);
            document.setUploadedBy(user);
            document.setFileName(file.getOriginalFilename());
            document.setFileUrl(fileUrl);
            document.setFileSize(file.getSize());
            document.setFileType(file.getContentType());
            document.setDescription(description);

            return documentRepository.save(document);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        }
    }

    public List<Document> getGroupDocuments(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return documentRepository.findByGroupOrderByUploadedAtDesc(group);
    }

    public void deleteDocument(Long documentId, String userEmail) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Allow deletion by uploader or group admin
        boolean isAdmin = groupMemberRepository.findByGroupAndUser(document.getGroup(), user)
                .map(gm -> gm.getRole() == GroupMemberRole.ADMIN)
                .orElse(false);

        if (!document.getUploadedBy().getId().equals(user.getId()) && !isAdmin) {
            throw new RuntimeException("You don't have permission to delete this document");
        }

        // Delete from Cloudinary
        cloudinaryService.deleteDocument(document.getFileUrl());

        // Delete from database
        documentRepository.delete(document);
    }

    public Document updateDocumentDescription(Long documentId, String description, String userEmail) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!document.getUploadedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Only the uploader can update the description");
        }

        document.setDescription(description);
        return documentRepository.save(document);
    }
}