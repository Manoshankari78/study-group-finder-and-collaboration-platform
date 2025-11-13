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
import java.util.Optional;
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

        // Check if user already has a membership record
        Optional<GroupMember> existingMember = groupMemberRepository.findByGroupAndUser(group, user);

        if (existingMember.isPresent()) {
            GroupMember member = existingMember.get();

            // If user is already active, throw error
            if (member.getStatus() == GroupMemberStatus.ACTIVE) {
                throw new RuntimeException("You are already a member of this group");
            }

            // If user was rejected, allow them to re-apply by updating the status to PENDING
            if (member.getStatus() == GroupMemberStatus.REJECTED) {
                member.setStatus(GroupMemberStatus.PENDING);
                return groupMemberRepository.save(member);
            }

            // If user already has a pending request
            if (member.getStatus() == GroupMemberStatus.PENDING) {
                throw new RuntimeException("You already have a pending join request for this group");
            }
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

        // If public group, update member count immediately
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

        // if user is admin
        if (groupMember.getRole() == GroupMemberRole.ADMIN) {
            List<GroupMember> activeAdmins = groupMemberRepository.findByGroup(group).stream()
                    .filter(member -> member.getRole() == GroupMemberRole.ADMIN &&
                            member.getStatus() == GroupMemberStatus.ACTIVE)
                    .collect(Collectors.toList());

            // promote another member
            if (activeAdmins.size() == 1 && activeAdmins.get(0).getId().equals(groupMember.getId())) {
                // Find another active member to promote (excluding the leaving admin)
                List<GroupMember> activeMembers = groupMemberRepository.findByGroup(group).stream()
                        .filter(member -> member.getStatus() == GroupMemberStatus.ACTIVE &&
                                !member.getId().equals(groupMember.getId()))
                        .collect(Collectors.toList());

                if (!activeMembers.isEmpty()) {
                    GroupMember newAdmin = activeMembers.get(0);
                    newAdmin.setRole(GroupMemberRole.ADMIN);
                    groupMemberRepository.save(newAdmin);
                } else {
                    groupMemberRepository.deleteAll(groupMemberRepository.findByGroup(group));
                    groupRepository.delete(group);
                    return;
                }
            }
        }

        groupMemberRepository.delete(groupMember);

        // update member count
        if (groupMember.getStatus() == GroupMemberStatus.ACTIVE) {
            group.setCurrentMembers(group.getCurrentMembers() - 1);
            groupRepository.save(group);
        }
    }

    public GroupMember getUserMembershipStatus(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return groupMemberRepository.findByGroupAndUser(group, user)
                .orElse(null);
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

    public List<Map<String, Object>> getGroupMembersWithRoles(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<GroupMember> groupMembers = groupMemberRepository.findByGroupAndStatus(group, GroupMemberStatus.ACTIVE);

        return groupMembers.stream().map(member -> {
            Map<String, Object> memberData = new HashMap<>();
            memberData.put("id", member.getUser().getId());
            memberData.put("name", member.getUser().getName());
            memberData.put("email", member.getUser().getEmail());
            memberData.put("avatarUrl", member.getUser().getAvatarUrl());
            memberData.put("role", member.getRole().toString());
            return memberData;
        }).collect(Collectors.toList());
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

    public void removeMember(Long groupId, Long userId, Long adminUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if admin user is actually an admin of the group
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        GroupMember adminMember = groupMemberRepository.findByGroupAndUser(group, adminUser)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (adminMember.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Only group admins can remove members");
        }

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to remove not found"));

        GroupMember memberToRemove = groupMemberRepository.findByGroupAndUser(group, userToRemove)
                .orElseThrow(() -> new RuntimeException("Member not found in this group"));

        // Cannot remove yourself using this method - use leaveGroup instead
        if (userToRemove.getId().equals(adminUserId)) {
            throw new RuntimeException("Cannot remove yourself. Use leave group instead.");
        }

        // Cannot remove other admins
        if (memberToRemove.getRole() == GroupMemberRole.ADMIN) {
            throw new RuntimeException("Cannot remove other admins from the group");
        }

        groupMemberRepository.delete(memberToRemove);

        // Update member count if active member
        if (memberToRemove.getStatus() == GroupMemberStatus.ACTIVE) {
            group.setCurrentMembers(group.getCurrentMembers() - 1);
            groupRepository.save(group);
        }
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