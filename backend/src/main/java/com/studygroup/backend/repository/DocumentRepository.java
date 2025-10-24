package com.studygroup.backend.repository;

import com.studygroup.backend.entity.Document;
import com.studygroup.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByGroupOrderByUploadedAtDesc(Group group);
    List<Document> findByFileNameContainingIgnoreCase(String fileName);
}