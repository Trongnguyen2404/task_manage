package com.example.application_usage_schedule.controller;

import com.example.application_usage_schedule.model.Notification;
import com.example.application_usage_schedule.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Thêm thông báo mới
    @PostMapping("/add")
    public Notification addNotification(@RequestBody NotificationRequest request) {
        return notificationService.createNotification(
                request.getTitle(),
                request.getMessage(),
                request.getTimestamp(),
                request.getUserId()
        );
    }

    // Lấy thông báo theo userId
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUserId(@PathVariable Long userId) {
        return notificationService.getNotificationsByUserId(userId);
    }

    // Sửa thông báo
    @PutMapping("/update/{id}")
    public Notification updateNotification(@PathVariable Long id, @RequestBody NotificationRequest request) {
        return notificationService.updateNotification(
                id,
                request.getTitle(),
                request.getMessage(),
                request.getTimestamp()
        );
    }

    // Xóa thông báo
    @DeleteMapping("/delete/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}
