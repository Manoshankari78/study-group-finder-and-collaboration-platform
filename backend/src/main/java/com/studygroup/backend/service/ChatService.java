package com.studygroup.backend.service;

import com.studygroup.backend.entity.*;
import com.studygroup.backend.repository.ChatMessageRepository;
import com.studygroup.backend.repository.GroupRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.controller.ChatController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
@Transactional
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupService groupService;

    // URL pattern for detecting link
    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(https?://)?([\\w-]+\\.)+[\\w-]+(/[\\w- ./?%&=]*)?$",
            Pattern.CASE_INSENSITIVE
    );

    public ChatMessage saveMessage(Long groupId, ChatController.ChatMessageRequest messageRequest) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User sender = userRepository.findById(messageRequest.getSenderId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify sender is a member of the group
        GroupMember membership = groupService.getUserMembershipStatus(sender.getId(), groupId);
        if (membership == null || membership.getStatus() != GroupMemberStatus.ACTIVE) {
            throw new RuntimeException("User is not an active member of this group");
        }

        ChatMessage message = new ChatMessage();
        message.setGroup(group);
        message.setSender(sender);
        message.setContent(messageRequest.getContent());

        // Auto-detect link type if not specified
        MessageType messageType = messageRequest.getType();
        if (messageType == MessageType.TEXT && isLink(messageRequest.getContent())) {
            messageType = MessageType.LINK;
        }
        message.setType(messageType);

        // Set file properties only for file types (not for links)
        if (messageRequest.getType() != MessageType.TEXT && messageRequest.getType() != MessageType.LINK) {
            message.setFileUrl(messageRequest.getFileUrl());
            message.setFileName(messageRequest.getFileName());
            message.setFileType(messageRequest.getFileType());
            message.setFileSize(messageRequest.getFileSize());
        }

        return chatMessageRepository.save(message);
    }

    public ChatMessage saveFileMessage(Long groupId, Long userId, ChatController.FileUploadRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check message type according to file type
        MessageType messageType = determineMessageType(request.getFileType());

        ChatMessage message = new ChatMessage();
        message.setGroup(group);
        message.setSender(sender);
        message.setContent(request.getCaption() != null ? request.getCaption() : "Shared a file");
        message.setType(messageType);
        message.setFileUrl(request.getFileUrl());
        message.setFileName(request.getFileName());
        message.setFileType(request.getFileType());
        message.setFileSize(request.getFileSize());

        return chatMessageRepository.save(message);
    }

    public ChatMessage saveLinkMessage(Long groupId, Long userId, String linkUrl, String title) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatMessage message = new ChatMessage();
        message.setGroup(group);
        message.setSender(sender);
        message.setContent(linkUrl);
        message.setType(MessageType.LINK);

        // store the title in the fileName field for convenience for link
        if (title != null && !title.trim().isEmpty()) {
            message.setFileName(title);
        }

        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getGroupMessages(Long groupId, int page, int size) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return chatMessageRepository.findByGroupOrderByTimestampDesc(group, pageable).getContent();
    }

    private MessageType determineMessageType(String fileType) {
        if (fileType == null) {
            return MessageType.TEXT;
        }

        String lowerFileType = fileType.toLowerCase();

        if (lowerFileType.startsWith("image/")) {
            return MessageType.IMAGE;
        } else if (lowerFileType.equals("application/pdf")) {
            return MessageType.PDF;
        } else if (lowerFileType.contains("word") ||
                lowerFileType.equals("application/msword") ||
                lowerFileType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            return MessageType.DOCUMENT;
        } else if (lowerFileType.contains("excel") ||
                lowerFileType.contains("spreadsheet") ||
                lowerFileType.equals("application/vnd.ms-excel") ||
                lowerFileType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            return MessageType.EXCEL;
        } else if (lowerFileType.contains("powerpoint") ||
                lowerFileType.contains("presentation") ||
                lowerFileType.equals("application/vnd.ms-powerpoint") ||
                lowerFileType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation")) {
            return MessageType.POWERPOINT;
        } else {
            return MessageType.TEXT;
        }
    }

    private boolean isLink(String content) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }

        String trimmedContent = content.trim();

        // Simple URL validation
        return URL_PATTERN.matcher(trimmedContent).matches() ||
                trimmedContent.startsWith("http://") ||
                trimmedContent.startsWith("https://") ||
                trimmedContent.startsWith("www.");
    }

    public void deleteGroupMessages(Group group) {
        chatMessageRepository.deleteByGroup(group);
    }
}