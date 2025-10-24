package com.studygroup.backend.dto;

public class TypingIndicator {
    private Long userId;
    private String userName;
    private boolean isTyping;

    // Getters and setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public boolean isTyping() { return isTyping; }
    public void setTyping(boolean typing) { isTyping = typing; }
}