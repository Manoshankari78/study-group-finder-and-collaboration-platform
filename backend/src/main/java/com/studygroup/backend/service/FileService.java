package com.studygroup.backend.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
@Service
public class FileService {

    @Autowired
    private CloudinaryService cloudinaryService;
    public String uploadFile(MultipartFile file, Long groupId) {
        try {
            // ✅ Call the correct method from CloudinaryService
            return cloudinaryService.uploadDocument(file);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            cloudinaryService.deleteDocument(fileUrl);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }
}