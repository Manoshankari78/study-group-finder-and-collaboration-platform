package com.studygroup.backend.repository;

import com.studygroup.backend.entity.ChatMessage;
import com.studygroup.backend.entity.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByGroupOrderByTimestampDesc(Group group);

    Page<ChatMessage> findByGroupOrderByTimestampDesc(Group group, Pageable pageable);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.group = :group ORDER BY cm.timestamp DESC")
    List<ChatMessage> findLatestMessages(@Param("group") Group group, Pageable pageable);

    void deleteByGroup(Group group);
}