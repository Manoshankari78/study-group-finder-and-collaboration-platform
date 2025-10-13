package com.studygroup.backend.service;

import com.studygroup.backend.entity.*;
import com.studygroup.backend.repository.GroupRepository;
import com.studygroup.backend.repository.GroupMemberRepository;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseService courseService;

    public Group createGroup(Group group, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(group.getCourse().getId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if user is enrolled in the course
        if (!isUserEnrolledInCourse(userId, course.getId())) {
            throw new RuntimeException("You must be enrolled in the course to create a group for it");
        }

        group.setCreatedBy(user);
        group.setCourse(course);
        group.setCurrentMembers(1);

        Group savedGroup = groupRepository.save(group);

        // Add creator as admin member
        GroupMember creatorMember = new GroupMember(savedGroup, user, GroupMemberRole.ADMIN);
        groupMemberRepository.save(creatorMember);

        return savedGroup;
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public List<Group> searchGroups(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllGroups();
        }
        return groupRepository.searchGroups(searchTerm.trim());
    }

    public List<Group> getGroupsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return groupRepository.findByCourse(course);
    }

    public List<Group> getUserGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return groupMemberRepository.findActiveGroupsByUser(user);
    }

    public List<Group> getRecommendedGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's enrolled courses
        List<Course> userCourses = getEnrolledCourses(userId);

        if (userCourses.isEmpty()) {
            return List.of();
        }

        // Get groups from user's courses that have available slots
        List<Group> courseGroups = groupRepository.findByCourses(userCourses);
        return courseGroups.stream()
                .filter(group -> group.getCurrentMembers() < group.getMaxMembers())
                .filter(group -> !isUserMemberOfGroup(userId, group.getId()))
                .collect(Collectors.toList());
    }

    public GroupMember joinGroup(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user is already a member
        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are already a member of this group");
        }

        // Check if user is enrolled in the course
        if (!isUserEnrolledInCourse(userId, group.getCourse().getId())) {
            throw new RuntimeException("You must be enrolled in the course to join this group");
        }

        // Check if group has available slots
        if (group.getCurrentMembers() >= group.getMaxMembers()) {
            throw new RuntimeException("Group is full");
        }

        GroupMemberStatus status = group.getPrivacy() == GroupPrivacy.PUBLIC ?
                GroupMemberStatus.ACTIVE : GroupMemberStatus.PENDING;

        GroupMember groupMember = new GroupMember(group, user, GroupMemberRole.MEMBER);
        groupMember.setStatus(status);

        // If public group, update member count
        if (status == GroupMemberStatus.ACTIVE) {
            group.setCurrentMembers(group.getCurrentMembers() + 1);
            groupRepository.save(group);
        }

        return groupMemberRepository.save(groupMember);
    }

    public void leaveGroup(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        GroupMember groupMember = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        // If user is admin and last admin, delete group
        if (groupMember.getRole() == GroupMemberRole.ADMIN) {
            long adminCount = groupMemberRepository.findByGroup(group).stream()
                    .filter(member -> member.getRole() == GroupMemberRole.ADMIN)
                    .count();

            if (adminCount == 1) {
                groupRepository.delete(group);
                return;
            }
        }

        groupMemberRepository.delete(groupMember);

        // Update member count if active member
        if (groupMember.getStatus() == GroupMemberStatus.ACTIVE) {
            group.setCurrentMembers(group.getCurrentMembers() - 1);
            groupRepository.save(group);
        }
    }

    public GroupMember updateMemberStatus(Long groupId, Long userId, GroupMemberStatus status, Long adminUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if admin user is actually an admin of the group
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        GroupMember adminMember = groupMemberRepository.findByGroupAndUser(group, adminUser)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (adminMember.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Only group admins can update member status");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMember groupMember = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        groupMember.setStatus(status);

        // If approved, update member count
        if (status == GroupMemberStatus.ACTIVE) {
            group.setCurrentMembers(group.getCurrentMembers() + 1);
            groupRepository.save(group);
        }

        return groupMemberRepository.save(groupMember);
    }

    public List<User> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return groupMemberRepository.findActiveMembersByGroup(group);
    }

    public List<GroupMember> getPendingRequests(Long groupId, Long adminUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Verify admin privileges
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMember adminMember = groupMemberRepository.findByGroupAndUser(group, adminUser)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (adminMember.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Only group admins can view pending requests");
        }

        return groupMemberRepository.findByGroupAndStatus(group, GroupMemberStatus.PENDING);
    }

    public Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public Group updateGroup(Long groupId, Group groupDetails, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user is admin of the group
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMember adminMember = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (adminMember.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Only group admins can update the group");
        }

        group.setName(groupDetails.getName());
        group.setDescription(groupDetails.getDescription());
        group.setPrivacy(groupDetails.getPrivacy());
        group.setMaxMembers(groupDetails.getMaxMembers());

        return groupRepository.save(group);
    }

    public void deleteGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if user is admin of the group
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMember adminMember = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (adminMember.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Only group admins can delete the group");
        }

        groupRepository.delete(group);
    }

    private boolean isUserEnrolledInCourse(Long userId, Long courseId) {
        return courseService.isUserEnrolledInCourse(userId, courseId);
    }

    private boolean isUserMemberOfGroup(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return groupMemberRepository.existsByGroupAndUser(group, user);
    }

    private List<Course> getEnrolledCourses(Long userId) {
        return courseService.getEnrolledCourses(userId);
    }
}