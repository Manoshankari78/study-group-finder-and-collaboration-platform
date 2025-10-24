package com.studygroup.backend.repository;

import com.studygroup.backend.entity.Message;
import com.studygroup.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByGroupOrderByTimestampDesc(Group group);

    List<Message> findByGroupAndTimestampAfterOrderByTimestampAsc(
            Group group, LocalDateTime timestamp);

    @Query("SELECT m FROM Message m WHERE m.group = :group " +
            "AND m.content LIKE %:searchTerm% ORDER BY m.timestamp DESC")
    List<Message> searchMessagesInGroup(
            @Param("group") Group group,
            @Param("searchTerm") String searchTerm);
}