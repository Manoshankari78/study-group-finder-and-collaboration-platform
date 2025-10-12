package com.studygroup.backend.controller;

import com.studygroup.backend.entity.Course;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.service.CourseService;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // Get all courses
    @GetMapping
    public ResponseEntity<?> getAllCourses(@RequestParam(required = false) String search) {
        try {
            List<Course> courses;
            if (search != null && !search.trim().isEmpty()) {
                courses = courseService.searchCourses(search);
            } else {
                courses = courseService.getAllCourses();
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Courses retrieved successfully",
                    "courses", courses
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get course by ID
    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourse(@PathVariable Long courseId) {
        try {
            Course course = courseService.getCourseById(courseId);
            return ResponseEntity.ok(Map.of(
                    "message", "Course retrieved successfully",
                    "course", course
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get user's enrolled courses
    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCourses(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Course> enrolledCourses = courseService.getUserEnrolledCourses(user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Enrolled courses retrieved successfully",
                    "courses", enrolledCourses
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Enroll in a course
    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<?> enrollInCourse(@AuthenticationPrincipal UserDetails userDetails,
                                            @PathVariable Long courseId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            courseService.enrollUserInCourse(user.getId(), courseId);

            return ResponseEntity.ok(Map.of(
                    "message", "Successfully enrolled in course"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Unenroll from a course
    @DeleteMapping("/{courseId}/unenroll")
    public ResponseEntity<?> unenrollFromCourse(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable Long courseId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            courseService.unenrollUserFromCourse(user.getId(), courseId);

            return ResponseEntity.ok(Map.of(
                    "message", "Successfully unenrolled from course"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get peers in same courses
    @GetMapping("/peers")
    public ResponseEntity<?> getCoursePeers(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Map<String, Object>> peers = courseService.getPeersInSameCourses(user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Peers retrieved successfully",
                    "peers", peers
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get peers in specific course
    @GetMapping("/{courseId}/peers")
    public ResponseEntity<?> getPeersInCourse(@AuthenticationPrincipal UserDetails userDetails,
                                              @PathVariable Long courseId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<User> peers = courseService.getPeersInCourse(user.getId(), courseId);

            return ResponseEntity.ok(Map.of(
                    "message", "Course peers retrieved successfully",
                    "peers", peers
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin endpoints
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        try {
            Course createdCourse = courseService.createCourse(course);
            return ResponseEntity.ok(Map.of(
                    "message", "Course created successfully",
                    "course", createdCourse
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<?> updateCourse(@PathVariable Long courseId, @RequestBody Course courseDetails) {
        try {
            Course updatedCourse = courseService.updateCourse(courseId, courseDetails);
            return ResponseEntity.ok(Map.of(
                    "message", "Course updated successfully",
                    "course", updatedCourse
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long courseId) {
        try {
            courseService.deleteCourse(courseId);
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}