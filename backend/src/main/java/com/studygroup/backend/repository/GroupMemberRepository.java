package com.studygroup.backend.repository;

import com.studygroup.backend.entity.Group;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.entity.GroupMember;
import com.studygroup.backend.entity.GroupMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup(Group group);

    List<GroupMember> findByUser(User user);

    Optional<GroupMember> findByGroupAndUser(Group group, User user);

    boolean existsByGroupAndUser(Group group, User user);

    List<GroupMember> findByGroupAndStatus(Group group, GroupMemberStatus status);

    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group = :group AND gm.status = 'ACTIVE'")
    Integer countActiveMembersByGroup(@Param("group") Group group);

    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.user = :user AND gm.status = 'ACTIVE'")
    List<Group> findActiveGroupsByUser(@Param("user") User user);

    @Query("SELECT gm.user FROM GroupMember gm WHERE gm.group = :group AND gm.status = 'ACTIVE'")
    List<User> findActiveMembersByGroup(@Param("group") Group group);

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    List<GroupMember> findByGroupIdAndStatus(Long groupId, GroupMemberStatus status);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.status = 'ACTIVE'")
    List<GroupMember> findActiveMembersByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId")
    Optional<GroupMember> findByGroupIdAndUserIdWithStatus(@Param("groupId") Long groupId, @Param("userId") Long userId);
}