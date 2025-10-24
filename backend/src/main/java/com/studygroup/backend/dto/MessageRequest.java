package com.studygroup.backend.dto;
import com.studygroup.backend.entity.MessageType;

public class MessageRequest {
    private String content;
    private MessageType type = MessageType.TEXT;
    private String fileUrl;
    private String fileName;

    // Getters and setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}

