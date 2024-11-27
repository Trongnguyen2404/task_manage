package com.example.application_usage_schedule.repository;

import com.example.application_usage_schedule.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    // Tìm lịch theo userId
    List<Schedule> findByUser_Id(Long userId);
    List<Schedule> findByUser_IdAndDayStart(Long userId, String dayStart);

    List<Schedule> findByUser_IdAndDayStartBetween(Long userId, String startDate, String endDate);
    List<Schedule> findByUser_IdAndDayStartBetweenAndStatus(Long userId, String startDate, String endDate, String status);
    long countByUser_IdAndStatus(Long userId, String status);
    long countByUser_IdAndDayStart(Long userId, String dayStart);
    void deleteByUserId(Long userId);
}
