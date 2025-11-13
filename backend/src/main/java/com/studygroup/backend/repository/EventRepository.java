package com.studygroup.backend.repository;

import com.studygroup.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByGroupIdOrderByStartTimeAsc(Long groupId);

    @Query("SELECT e FROM Event e WHERE e.group.id IN " +
            "(SELECT gm.group.id FROM GroupMember gm WHERE gm.user.id = :userId AND gm.status = 'ACTIVE') " +
            "ORDER BY e.startTime ASC")
    List<Event> findUserEvents(@Param("userId") Long userId);

    @Query("SELECT e FROM Event e WHERE e.startTime BETWEEN :start AND :end " +
            "AND e.group.id IN (SELECT gm.group.id FROM GroupMember gm WHERE gm.user.id = :userId AND gm.status = 'ACTIVE')")
    List<Event> findUserEventsBetweenDates(@Param("userId") Long userId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    List<Event> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}