package com.studygroup.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            if (!file.getContentType().startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed");
            }

            // Upload to Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "study-group-avatars",
                            "width", 500,
                            "height", 500,
                            "crop", "limit",
                            "quality", "auto"
                    ));

            // Return secure URL
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.contains("cloudinary.com")) {
                // Extract public ID from URL
                String publicId = extractPublicIdFromUrl(imageUrl);
                if (publicId != null) {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                }
            }
        } catch (Exception e) {
            // Log error but don't throw - deletion failure shouldn't break the app
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // URL format: https://res.cloudinary.com/cloudname/image/upload/v1234567/folder/public_id.jpg
            String[] parts = imageUrl.split("/");
            String filename = parts[parts.length - 1];
            String publicIdWithVersion = parts[parts.length - 2] + "/" + filename.split("\\.")[0];
            return publicIdWithVersion;
        } catch (Exception e) {
            return null;
        }
    }
}