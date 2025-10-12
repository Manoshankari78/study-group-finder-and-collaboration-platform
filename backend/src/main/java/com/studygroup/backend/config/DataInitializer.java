package com.studygroup.backend.config;

import com.studygroup.backend.entity.Course;
import com.studygroup.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public void run(String... args) throws Exception {
        // predefined courses
        if (courseRepository.count() == 0) {
            Course course1 = new Course("CS 101", "Introduction to Computer Science",
                    "Fundamental concepts of computer science and programming", 3, "Computer Science");

            Course course2 = new Course("MATH 201", "Calculus I",
                    "Differential and integral calculus of one variable", 4, "Mathematics");

            Course course3 = new Course("PHYS 101", "General Physics I",
                    "Mechanics, heat, and waves", 4, "Physics");

            Course course4 = new Course("CHEM 101", "General Chemistry",
                    "Basic principles of chemistry", 3, "Chemistry");

            Course course5 = new Course("ENG 102", "English Composition",
                    "College-level writing and composition", 3, "English");

            Course course6 = new Course("CS 201", "Data Structures",
                    "Fundamental data structures and algorithms", 3, "Computer Science");

            Course course7 = new Course("MATH 202", "Calculus II",
                    "Advanced integration techniques and series", 4, "Mathematics");

            Course course8 = new Course("PHYS 102", "General Physics II",
                    "Electricity, magnetism, and optics", 4, "Physics");

            courseRepository.save(course1);
            courseRepository.save(course2);
            courseRepository.save(course3);
            courseRepository.save(course4);
            courseRepository.save(course5);
            courseRepository.save(course6);
            courseRepository.save(course7);
            courseRepository.save(course8);

            System.out.println("Sample courses initialized");
        }
    }
}