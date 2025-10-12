package com.studygroup.backend.repository;

import com.studygroup.backend.entity.Course;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.entity.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {
    List<UserCourse> findByUser(User user);
    List<UserCourse> findByCourse(Course course);
    Optional<UserCourse> findByUserAndCourse(User user, Course course);
    boolean existsByUserAndCourse(User user, Course course);

    @Query("SELECT uc.course FROM UserCourse uc WHERE uc.user = :user")
    List<Course> findCoursesByUser(@Param("user") User user);

    @Query("SELECT uc.user FROM UserCourse uc WHERE uc.course = :course AND uc.user != :currentUser")
    List<User> findPeersByCourse(@Param("course") Course course, @Param("currentUser") User currentUser);

    @Query("SELECT DISTINCT uc.user FROM UserCourse uc WHERE uc.course IN :courses AND uc.user != :currentUser")
    List<User> findPeersByCourses(@Param("courses") List<Course> courses, @Param("currentUser") User currentUser);
}