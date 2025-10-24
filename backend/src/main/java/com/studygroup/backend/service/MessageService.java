package com.studygroup.backend.service;

import com.studygroup.backend.entity.*;
import com.studygroup.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.studygroup.backend.dto.MessageRequest;
@Service
@Transactional
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public Message saveMessage(Long groupId, String senderEmail, MessageRequest request) {
        // Verify group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Verify sender exists
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify sender is a member of the group
        if (!groupMemberRepository.existsByGroupAndUser(group, sender)) {
            throw new RuntimeException("User is not a member of this group");
        }

        // Create and save message
        Message message = new Message();
        message.setGroup(group);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setType(request.getType());
        message.setFileUrl(request.getFileUrl());
        message.setFileName(request.getFileName());

        return messageRepository.save(message);
    }

    public List<Message> getMessages(Long groupId, Long afterMessageId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (afterMessageId != null) {
            Message afterMessage = messageRepository.findById(afterMessageId)
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            return messageRepository.findByGroupAndTimestampAfterOrderByTimestampAsc(
                    group, afterMessage.getTimestamp());
        }

        // Return last 50 messages
        List<Message> messages = messageRepository.findByGroupOrderByTimestampDesc(group);
        return messages.stream()
                .limit(50)
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .collect(Collectors.toList());
    }

    public void markAsRead(Long messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        message.getReadBy().add(user.getId());
        messageRepository.save(message);
    }

    public Message editMessage(Long messageId, String content, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own messages");
        }

        message.setContent(content);
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public void deleteMessage(Long messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Allow deletion by sender or group admin
        boolean isAdmin = groupMemberRepository.findByGroupAndUser(message.getGroup(), user)
                .map(gm -> gm.getRole() == GroupMemberRole.ADMIN)
                .orElse(false);

        if (!message.getSender().getId().equals(user.getId()) && !isAdmin) {
            throw new RuntimeException("You don't have permission to delete this message");
        }

        messageRepository.delete(message);
    }

    public List<Message> searchMessages(Long groupId, String searchTerm) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return messageRepository.searchMessagesInGroup(group, searchTerm);
    }
}