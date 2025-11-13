package com.studygroup.backend.service;

import com.studygroup.backend.entity.*;
import com.studygroup.backend.repository.EventRepository;
import com.studygroup.backend.repository.GroupMemberRepository;
import com.studygroup.backend.repository.GroupRepository;
import com.studygroup.backend.repository.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    public Event createEvent(Event event, Long userId, Long groupId) {
        // verify user is admin of the group
        GroupMember membership = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this group"));

        if (membership.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Only group admins can create events");
        }

        // verify group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // verify user exists
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // set the group and createdBy
        event.setGroup(group);
        event.setCreatedBy(user);

        // validate event times
        if (event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Event start time cannot be in the past");
        }

        if (event.getEndTime().isBefore(event.getStartTime())) {
            throw new RuntimeException("Event end time cannot be before start time");
        }

        Event savedEvent = eventRepository.save(event);

        // send notification emails to all group members
        sendEventCreationNotifications(savedEvent);

        // send immediate reminder if event starts in less than 30 minutes
        sendImmediateRemindersForNewEvent(savedEvent);

        notificationService.notifyGroupMembers(
                groupId,
                "New Study Session: " + event.getTitle(),
                "A new study session '" + event.getTitle() + "' has been scheduled in " + group.getName() + " group.",
                NotificationType.EVENT_CREATED,
                savedEvent.getId()
        );

        return savedEvent;
    }

    public List<Event> getUserEvents(Long userId) {
        return eventRepository.findUserEvents(userId);
    }

    public List<Event> getGroupEvents(Long groupId) {
        return eventRepository.findByGroupIdOrderByStartTimeAsc(groupId);
    }

    public Event getEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public void deleteEvent(Long eventId, Long userId) {
        Event event = getEvent(eventId);

        // verify user is admin of the group
        GroupMember membership = groupMemberRepository.findByGroupIdAndUserId(event.getGroup().getId(), userId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this group"));

        if (membership.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Only group admins can delete events");
        }

        eventRepository.delete(event);
    }

    private void sendEventCreationNotifications(Event event) {
        List<GroupMember> groupMembers = groupMemberRepository.findByGroupIdAndStatus(
                event.getGroup().getId(), GroupMemberStatus.ACTIVE);

        for (GroupMember member : groupMembers) {
            User user = member.getUser();
            Optional<UserPreferences> preferencesOpt = userPreferencesRepository.findByUser(user);

            // default preferences if none exist
            boolean shouldNotify = preferencesOpt.map(UserPreferences::getEventNotifications).orElse(true);
            boolean shouldEmail = preferencesOpt.map(UserPreferences::getEmailNotifications).orElse(true);

            if (shouldNotify && shouldEmail) {
                emailService.sendEventNotification(user.getEmail(), event);
            }
        }
    }

    private void sendImmediateRemindersForNewEvent(Event event) {
        LocalDateTime now = LocalDateTime.now();
        // if event starts in less than 30 mins, send reminder immediately
        if (event.getStartTime().isAfter(now) && event.getStartTime().isBefore(now.plusMinutes(30))) {
            sendRemindersForEvent(event);
        }
    }

    // scheduled task to send reminders exactly 30 mins before events
    @Scheduled(fixedRate = 60000) // run every minute
    public void sendEventReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyMinutesFromNow = now.plusMinutes(30);

        // find events that start exactly between 29-30 mins from now, ensuring only pick up events that are exactly 30 mins away
        List<Event> upcomingEvents = eventRepository.findByStartTimeBetween(
                thirtyMinutesFromNow.minusMinutes(1),
                thirtyMinutesFromNow
        );

        for (Event event : upcomingEvents) {
            // check if this is exactly 30 mins before the event, with 1-minute tolerance
            if (isExactlyThirtyMinutesBefore(event, now)) {
                sendRemindersForEvent(event);
            }
        }
    }

    private boolean isExactlyThirtyMinutesBefore(Event event, LocalDateTime now) {
        LocalDateTime eventStart = event.getStartTime();
        LocalDateTime thirtyMinutesBeforeEvent = eventStart.minusMinutes(30);

        // check if current time is within 1 minute of the 30 mins mark
        return !thirtyMinutesBeforeEvent.isAfter(now) &&
                thirtyMinutesBeforeEvent.plusMinutes(1).isAfter(now);
    }

    private void sendRemindersForEvent(Event event) {
        List<GroupMember> groupMembers = groupMemberRepository.findByGroupIdAndStatus(
                event.getGroup().getId(), GroupMemberStatus.ACTIVE);

        for (GroupMember member : groupMembers) {
            User user = member.getUser();
            Optional<UserPreferences> preferencesOpt = userPreferencesRepository.findByUser(user);

            // default preferences if none exist
            boolean shouldRemind = preferencesOpt.map(UserPreferences::getEventReminders).orElse(true);
            boolean shouldEmail = preferencesOpt.map(UserPreferences::getEmailNotifications).orElse(true);

            if (shouldRemind) {
                // create in-app notification
                notificationService.createNotification(
                        user,
                        "Event Reminder: " + event.getTitle(),
                        "Your study session '" + event.getTitle() + "' starts soon.",
                        NotificationType.EVENT_REMINDER,
                        event.getId(),
                        event.getGroup().getId()
                );

                // send email if enabled
                if (shouldEmail) {
                    emailService.sendEventReminder(user.getEmail(), event);
                }
            }
        }
    }
}