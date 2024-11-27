package com.example.application_usage_schedule.repository;

import com.example.application_usage_schedule.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_Id(Long userId);
    void deleteByUserId(Long userId);
}
