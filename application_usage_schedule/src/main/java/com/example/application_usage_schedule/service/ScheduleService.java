package com.example.application_usage_schedule.service;

import com.example.application_usage_schedule.controller.ScheduleRequest;
import com.example.application_usage_schedule.model.Schedule;
import com.example.application_usage_schedule.model.User;
import com.example.application_usage_schedule.repository.ScheduleRepository;
import com.example.application_usage_schedule.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    // Lưu lịch mới
    public Schedule saveSchedule(Long userId, String eventName, String timeStart, String timeEnd, String dayStart, String location, String content, Long groupId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Schedule schedule = new Schedule();
        schedule.setUser(userOpt.get());
        schedule.setEventName(eventName);
        schedule.setTimeStart(timeStart);
        schedule.setTimeEnd(timeEnd);
        schedule.setDayStart(dayStart);
        schedule.setLocation(location);
        schedule.setContent(content);
        schedule.setGroupId(groupId);
        return scheduleRepository.save(schedule);
    }

    // Lấy lịch theo userId
    public List<Schedule> getSchedulesByUserId(Long userId) {
        return scheduleRepository.findByUser_Id(userId);
    }

    // Cập nhật lịch
// Cập nhật lịch
    public Schedule updateSchedule(Long id, ScheduleRequest request) {
        Optional<Schedule> existingScheduleOpt = scheduleRepository.findById(id);

        if (existingScheduleOpt.isEmpty()) {
            throw new RuntimeException("Schedule not found");
        }

        Schedule existingSchedule = existingScheduleOpt.get();

        // Kiểm tra groupId trước khi cho phép sửa
        if (existingSchedule.getGroupId() != null) {
            throw new RuntimeException("Cannot update schedule with a groupId");
        }

        // Cập nhật các thông tin khác
        existingSchedule.setEventName(request.getEventName());
        existingSchedule.setTimeStart(request.getTimeStart());
        existingSchedule.setTimeEnd(request.getTimeEnd());
        existingSchedule.setDayStart(request.getDayStart());
        existingSchedule.setLocation(request.getLocation());
        existingSchedule.setContent(request.getContent());
        existingSchedule.setGroupId(request.getGroupId());

        return scheduleRepository.save(existingSchedule);
    }

    // Xóa lịch
    public void deleteSchedule(Long id) {
        Optional<Schedule> existingScheduleOpt = scheduleRepository.findById(id);

        if (existingScheduleOpt.isEmpty()) {
            throw new RuntimeException("Schedule not found");
        }

        Schedule existingSchedule = existingScheduleOpt.get();

        // Kiểm tra groupId trước khi cho phép xóa
        if (existingSchedule.getGroupId() != null) {
            throw new RuntimeException("Cannot delete schedule with a groupId");
        }

        scheduleRepository.delete(existingSchedule);
    }

    public List<Schedule> getSchedulesByDay(Long userId, LocalDate date) {
        return scheduleRepository.findByUser_IdAndDayStart(userId, date.toString());
    }

    public List<Schedule> getSchedulesByWeek(Long userId, LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(6);
        return scheduleRepository.findByUser_IdAndDayStartBetween(userId, startDate.toString(), endDate.toString());
    }
    public Schedule markScheduleAsComplete(Long id) {
        Optional<Schedule> scheduleOpt = scheduleRepository.findById(id);
        if (scheduleOpt.isEmpty()) {
            throw new RuntimeException("Schedule not found");
        }

        Schedule schedule = scheduleOpt.get();
        schedule.setStatus("complete"); // Đặt trạng thái là "complete"
        return scheduleRepository.save(schedule);
    }
    public long getCompletedSchedulesCount(Long userId, LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(6);
        List<Schedule> completedSchedules = scheduleRepository.findByUser_IdAndDayStartBetweenAndStatus(
                userId, startDate.toString(), endDate.toString(), "complete"
        );
        return completedSchedules.size();
    }

    // Lấy số lượng lịch chưa hoàn thành trong tuần
    public long getUnfinishedSchedulesCount(Long userId, LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(6);
        List<Schedule> unfinishedSchedules = scheduleRepository.findByUser_IdAndDayStartBetweenAndStatus(
                userId, startDate.toString(), endDate.toString(), "unfinished"
        );
        return unfinishedSchedules.size();
    }
    public long countCompletedSchedules(Long userId) {
        return scheduleRepository.countByUser_IdAndStatus(userId, "complete");
    }

    // Đếm số lịch chưa hoàn thành
    public long countUnfinishedSchedules(Long userId) {
        return scheduleRepository.countByUser_IdAndStatus(userId, "unfinished");
    }
    public long countSchedulesByDay(Long userId, LocalDate date) {
        return scheduleRepository.countByUser_IdAndDayStart(userId, date.toString());
    }
}
