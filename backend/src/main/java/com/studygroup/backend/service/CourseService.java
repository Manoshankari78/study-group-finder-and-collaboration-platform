package com.studygroup.backend.service;

import com.studygroup.backend.entity.Course;
import com.studygroup.backend.entity.Group;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.entity.UserCourse;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.UserCourseRepository;
import com.studygroup.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserCourseRepository userCourseRepository;

    @Autowired
    private UserRepository userRepository;


    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> searchCourses(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllCourses();
        }
        return courseRepository.searchCourses(searchTerm.trim());
    }

    public List<Course> getCoursesByDepartment(String department) {
        return courseRepository.findByDepartment(department);
    }

    public Course createCourse(Course course) {
        // Check if course code already exists
        if (courseRepository.findByCourseCode(course.getCourseCode()).isPresent()) {
            throw new RuntimeException("Course with code " + course.getCourseCode() + " already exists");
        }
        return courseRepository.save(course);
    }

    public Course updateCourse(Long courseId, Course courseDetails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if new course code conflicts with existing course
        if (!course.getCourseCode().equals(courseDetails.getCourseCode())) {
            Optional<Course> existingCourse = courseRepository.findByCourseCode(courseDetails.getCourseCode());
            if (existingCourse.isPresent() && !existingCourse.get().getId().equals(courseId)) {
                throw new RuntimeException("Course code " + courseDetails.getCourseCode() + " already exists");
            }
        }

        course.setCourseCode(courseDetails.getCourseCode());
        course.setCourseName(courseDetails.getCourseName());
        course.setDescription(courseDetails.getDescription());
        course.setCredits(courseDetails.getCredits());
        course.setDepartment(courseDetails.getDepartment());

        return courseRepository.save(course);
    }

    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if any users are enrolled in this course
        List<UserCourse> enrollments = userCourseRepository.findByCourse(course);
        if (!enrollments.isEmpty()) {
            throw new RuntimeException("Cannot delete course with enrolled students");
        }

        courseRepository.delete(course);
    }

    public List<Course> getUserEnrolledCourses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userCourseRepository.findCoursesByUser(user);
    }

    public UserCourse enrollUserInCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if already enrolled
        if (userCourseRepository.existsByUserAndCourse(user, course)) {
            throw new RuntimeException("User is already enrolled in this course");
        }

        UserCourse userCourse = new UserCourse(user, course);
        return userCourseRepository.save(userCourse);
    }

    public void unenrollUserFromCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        UserCourse userCourse = userCourseRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("User is not enrolled in this course"));

        userCourseRepository.delete(userCourse);
    }

    public List<Map<String, Object>> getPeersInSameCourses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Course> userCourses = userCourseRepository.findCoursesByUser(user);
        if (userCourses.isEmpty()) {
            return List.of();
        }

        List<User> peers = userCourseRepository.findPeersByCourses(userCourses, user);

        // Create response with common courses
        return peers.stream().map(peer -> {
            List<Course> peerCourses = userCourseRepository.findCoursesByUser(peer);
            List<Course> commonCourses = userCourses.stream()
                    .filter(peerCourses::contains)
                    .collect(Collectors.toList());

            Map<String, Object> peerData = new HashMap<>();
            peerData.put("user", peer);
            peerData.put("commonCourses", commonCourses);
            return peerData;
        }).collect(Collectors.toList());
    }

    public List<User> getPeersInCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return userCourseRepository.findPeersByCourse(course, user);
    }

    public Course getCourseById(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public boolean isUserEnrolledInCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return userCourseRepository.existsByUserAndCourse(user, course);
    }

    public List<Course> getEnrolledCourses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userCourseRepository.findCoursesByUser(user);
    }
}