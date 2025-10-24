package com.studygroup.backend.controller;

import com.studygroup.backend.entity.Document;
import com.studygroup.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("groupId") Long groupId,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Document document = documentService.uploadDocument(
                    groupId,
                    userDetails.getUsername(),
                    file,
                    description
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Document uploaded successfully",
                    "document", document
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupDocuments(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Document> documents = documentService.getGroupDocuments(groupId);
            return ResponseEntity.ok(Map.of(
                    "documents", documents,
                    "count", documents.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            documentService.deleteDocument(documentId, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{documentId}/description")
    public ResponseEntity<?> updateDescription(
            @PathVariable Long documentId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Document document = documentService.updateDocumentDescription(
                    documentId,
                    request.get("description"),
                    userDetails.getUsername()
            );
            return ResponseEntity.ok(Map.of(
                    "message", "Description updated successfully",
                    "document", document
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}