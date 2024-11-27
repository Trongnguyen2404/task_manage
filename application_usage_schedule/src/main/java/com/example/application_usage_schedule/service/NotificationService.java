package com.example.application_usage_schedule.service;

import com.example.application_usage_schedule.model.Notification;
import com.example.application_usage_schedule.model.User;
import com.example.application_usage_schedule.repository.NotificationRepository;
import com.example.application_usage_schedule.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public Notification createNotification(String title, String message, String timestamp, Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTimestamp(timestamp);
        notification.setUser(userOpt.get());
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUser_Id(userId);
    }

    public Notification updateNotification(Long id, String title, String message, String timestamp) {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);

        if (notificationOpt.isEmpty()) {
            throw new RuntimeException("Notification not found");
        }

        Notification notification = notificationOpt.get();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTimestamp(timestamp);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
