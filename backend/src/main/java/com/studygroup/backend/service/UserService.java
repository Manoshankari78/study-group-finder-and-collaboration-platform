package com.studygroup.backend.service;

import com.studygroup.backend.entity.PasswordResetToken;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.PasswordResetTokenRepository;
import com.studygroup.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;
import com.studygroup.backend.service.EmailService;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Password reset methods
    public void createPasswordResetToken(User user, String token) {
        // Delete existing tokens
        passwordResetTokenRepository.findByUser(user).ifPresent(existing -> {
            passwordResetTokenRepository.delete(existing);
        });

        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(resetToken);
    }

    public String validatePasswordResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired");
        }

        if (resetToken.isUsed()) {
            throw new RuntimeException("Reset token already used");
        }

        return resetToken.getUser().getEmail();
    }

    public void resetPassword(String token, String newPassword) {
        String email = validatePasswordResetToken(token);
        User user = findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token).get();
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    public void updatePassword(String email, String currentPassword, String newPassword) {
        User user = findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void initiatePasswordReset(String email) {
        User user = findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        createPasswordResetToken(user, resetToken);

        emailService.sendPasswordResetEmail(email, resetToken);
    }

    public User updateUserProfile(Long userId, User userDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user details
        user.setName(userDetails.getName());
        user.setSecondarySchool(userDetails.getSecondarySchool());
        user.setSecondarySchoolPassingYear(userDetails.getSecondarySchoolPassingYear());
        user.setSecondarySchoolPercentage(userDetails.getSecondarySchoolPercentage());
        user.setHigherSecondarySchool(userDetails.getHigherSecondarySchool());
        user.setHigherSecondaryPassingYear(userDetails.getHigherSecondaryPassingYear());
        user.setHigherSecondaryPercentage(userDetails.getHigherSecondaryPercentage());
        user.setUniversityName(userDetails.getUniversityName());
        user.setUniversityPassingYear(userDetails.getUniversityPassingYear());
        user.setUniversityPassingGPA(userDetails.getUniversityPassingGPA());
        user.setBio(userDetails.getBio());
        user.setAvatarUrl(userDetails.getAvatarUrl());

        return userRepository.save(user);
    }
}