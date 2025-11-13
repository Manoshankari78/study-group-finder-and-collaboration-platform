package com.studygroup.backend.service;

import com.studygroup.backend.entity.*;
import com.studygroup.backend.repository.NotificationRepository;
import com.studygroup.backend.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public Notification createNotification(User user, String title, String message, NotificationType type, Long eventId, Long groupId) {
        Notification notification = new Notification(user, title, message, type, eventId, groupId);
        return notificationRepository.save(notification);
    }

    public void notifyGroupMembers(Long groupId, String title, String message, NotificationType type, Long eventId) {
        List<GroupMember> groupMembers = groupMemberRepository.findByGroupIdAndStatus(groupId, GroupMemberStatus.ACTIVE);

        for (GroupMember member : groupMembers) {
            createNotification(member.getUser(), title, message, type, eventId, groupId);
        }
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadUserNotifications(User user) {
        return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
    }

    public Long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    @Transactional
    public Notification markAsRead(Long notificationId, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // if the notification belongs to the current user
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to access this notification");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void deleteNotification(Long notificationId, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // if the notification belongs to the current user
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteAllUserNotifications(User user) {
        List<Notification> userNotifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notificationRepository.deleteAll(userNotifications);
    }

    public boolean isNotificationOwner(Long notificationId, Long userId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> notification.getUser().getId().equals(userId))
                .orElse(false);
    }
}