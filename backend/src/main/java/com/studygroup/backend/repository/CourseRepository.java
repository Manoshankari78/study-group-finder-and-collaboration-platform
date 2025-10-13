package com.studygroup.backend.repository;

import com.studygroup.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByCourseNameContainingIgnoreCase(String courseName);
    List<Course> findByDepartmentContainingIgnoreCase(String department);

    @Query("SELECT c FROM Course c WHERE LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.courseName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Course> searchCourses(@Param("search") String search);

    List<Course> findByDepartment(String department);
}