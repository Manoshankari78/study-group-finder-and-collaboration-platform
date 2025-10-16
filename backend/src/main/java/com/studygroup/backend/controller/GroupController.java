package com.studygroup.backend.controller;

import com.studygroup.backend.entity.Group;
import com.studygroup.backend.entity.GroupMember;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.entity.GroupMemberStatus;
import com.studygroup.backend.service.GroupService;
import com.studygroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {
    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    // Get all groups
    @GetMapping
    public ResponseEntity<?> getAllGroups(@RequestParam(required = false) String search,
                                          @RequestParam(required = false) Long courseId) {
        try {
            List<Group> groups;
            if (search != null && !search.trim().isEmpty()) {
                groups = groupService.searchGroups(search);
            } else if (courseId != null) {
                groups = groupService.getGroupsByCourse(courseId);
            } else {
                groups = groupService.getAllGroups();
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Groups retrieved successfully",
                    "groups", groups
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get group by ID
    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(@PathVariable Long groupId) {
        try {
            Group group = groupService.getGroupById(groupId);
            return ResponseEntity.ok(Map.of(
                    "message", "Group retrieved successfully",
                    "group", group
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Create new group
    @PostMapping
    public ResponseEntity<?> createGroup(@AuthenticationPrincipal UserDetails userDetails,
                                         @RequestBody Group group) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Group createdGroup = groupService.createGroup(group, user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Group created successfully",
                    "group", createdGroup
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update group
    @PutMapping("/{groupId}")
    public ResponseEntity<?> updateGroup(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long groupId,
                                         @RequestBody Group groupDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Group updatedGroup = groupService.updateGroup(groupId, groupDetails, user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Group updated successfully",
                    "group", updatedGroup
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete group
    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long groupId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            groupService.deleteGroup(groupId, user.getId());

            return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get user's groups
    @GetMapping("/my-groups")
    public ResponseEntity<?> getMyGroups(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Group> userGroups = groupService.getUserGroups(user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "User groups retrieved successfully",
                    "groups", userGroups
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get recommended groups for user
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedGroups(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Group> recommendedGroups = groupService.getRecommendedGroups(user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Recommended groups retrieved successfully",
                    "groups", recommendedGroups
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Join group
    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long groupId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            GroupMember groupMember = groupService.joinGroup(user.getId(), groupId);

            String message = groupMember.getStatus().toString().equals("ACTIVE") ?
                    "Successfully joined the group" : "Join request sent. Waiting for approval";

            return ResponseEntity.ok(Map.of(
                    "message", message,
                    "member", groupMember
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Leave group
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(@AuthenticationPrincipal UserDetails userDetails,
                                        @PathVariable Long groupId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            groupService.leaveGroup(user.getId(), groupId);

            return ResponseEntity.ok(Map.of("message", "Successfully left the group"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get group members
    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long groupId) {
        try {
            List<User> members = groupService.getGroupMembers(groupId);

            return ResponseEntity.ok(Map.of(
                    "message", "Group members retrieved successfully",
                    "members", members
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get pending join requests (for group admins)
    @GetMapping("/{groupId}/pending-requests")
    public ResponseEntity<?> getPendingRequests(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable Long groupId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<GroupMember> pendingRequests = groupService.getPendingRequests(groupId, user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Pending requests retrieved successfully",
                    "requests", pendingRequests
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Approve or reject join request
    @PostMapping("/{groupId}/requests/{userId}")
    public ResponseEntity<?> handleJoinRequest(@AuthenticationPrincipal UserDetails userDetails,
                                               @PathVariable Long groupId,
                                               @PathVariable Long userId,
                                               @RequestBody HandleRequestRequest request) {
        try {
            User adminUser = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            GroupMember updatedMember = groupService.updateMemberStatus(groupId, userId, request.getStatus(), adminUser.getId());

            String action = request.getStatus().toString().equals("ACTIVE") ? "approved" : "rejected";

            return ResponseEntity.ok(Map.of(
                    "message", "Join request " + action + " successfully",
                    "member", updatedMember
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/my-membership")
    public ResponseEntity<?> getMyMembership(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long groupId) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            GroupMember membership = groupService.getUserMembershipStatus(user.getId(), groupId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Membership status retrieved successfully");
            if (membership != null) {
                response.put("membership", membership);
                response.put("status", membership.getStatus());
                response.put("role", membership.getRole());
            } else {
                response.put("membership", null);
                response.put("status", "NOT_MEMBER");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<?> removeMember(@AuthenticationPrincipal UserDetails userDetails,
                                          @PathVariable Long groupId,
                                          @PathVariable Long userId) {
        try {
            User adminUser = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            groupService.removeMember(groupId, userId, adminUser.getId());

            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request classes
    public static class HandleRequestRequest {
        private GroupMemberStatus status;

        public GroupMemberStatus getStatus() {
            return status;
        }

        public void setStatus(GroupMemberStatus status) {
            this.status = status;
        }
    }
}