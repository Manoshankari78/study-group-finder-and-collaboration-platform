package com.studygroup.backend.repository;

import com.studygroup.backend.entity.Group;
import com.studygroup.backend.entity.Course;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.entity.GroupPrivacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCourse(Course course);

    List<Group> findByCreatedBy(User createdBy);

    List<Group> findByPrivacy(GroupPrivacy privacy);

    @Query("SELECT g FROM Group g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Group> searchGroups(@Param("search") String search);

    @Query("SELECT g FROM Group g WHERE g.course = :course AND (LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Group> searchGroupsByCourse(@Param("course") Course course, @Param("search") String search);

    List<Group> findByCourseAndPrivacy(Course course, GroupPrivacy privacy);

    @Query("SELECT g FROM Group g WHERE g.currentMembers < g.maxMembers")
    List<Group> findGroupsWithAvailableSlots();

    @Query("SELECT g FROM Group g WHERE g.course IN :courses")
    List<Group> findByCourses(@Param("courses") List<Course> courses);
}