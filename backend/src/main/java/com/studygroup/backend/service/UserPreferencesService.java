package com.studygroup.backend.service;

import com.studygroup.backend.entity.User;
import com.studygroup.backend.entity.UserPreferences;
import com.studygroup.backend.repository.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserPreferencesService {

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    public UserPreferences getUserPreferences(User user) {
        return userPreferencesRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));
    }

    public UserPreferences updateUserPreferences(User user, UserPreferences newPreferences) {
        UserPreferences existingPreferences = getUserPreferences(user);

        existingPreferences.setEventNotifications(newPreferences.getEventNotifications());
        existingPreferences.setEventReminders(newPreferences.getEventReminders());
        existingPreferences.setEmailNotifications(newPreferences.getEmailNotifications());

        return userPreferencesRepository.save(existingPreferences);
    }

    private UserPreferences createDefaultPreferences(User user) {
        UserPreferences preferences = new UserPreferences(user);
        return userPreferencesRepository.save(preferences);
    }
}