package com.example.application_usage_schedule.controller;


import com.example.application_usage_schedule.model.Schedule;
import com.example.application_usage_schedule.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {
    @Autowired
    private ScheduleService scheduleService;

    // Tạo mới lịch (POST request)
    @PostMapping("/save")
    public Schedule saveSchedule(@RequestBody ScheduleRequest request) {
        return scheduleService.saveSchedule(
                request.getUserId(),
                request.getEventName(),
                request.getTimeStart(),
                request.getTimeEnd(),
                request.getDayStart(),
                request.getLocation(),
                request.getContent(),
                request.getGroupId()
        );
    }

    // Lấy lịch theo userId (GET request)
    @GetMapping("/user/{userId}")
    public List<Schedule> getSchedulesByUserId(@PathVariable Long userId) {
        return scheduleService.getSchedulesByUserId(userId);
    }

    // Cập nhật lịch (PUT request)
    @PutMapping("/update/{id}")
    public Schedule updateSchedule(@PathVariable Long id, @RequestBody ScheduleRequest request) {
        return scheduleService.updateSchedule(id, request);
    }

    // Xóa lịch (DELETE request)
    @DeleteMapping("/delete/{id}")
    public void deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
    }
    @GetMapping("/day/{userId}/{date}")
    public List<Schedule> getSchedulesByDay(@PathVariable Long userId, @PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        return scheduleService.getSchedulesByDay(userId, localDate);
    }

    @GetMapping("/week/{userId}/{startDate}")
    public List<Schedule> getSchedulesByWeek(@PathVariable Long userId, @PathVariable String startDate) {
        LocalDate startLocalDate = LocalDate.parse(startDate);
        return scheduleService.getSchedulesByWeek(userId, startLocalDate);
    }
    @PutMapping("/complete/{id}")
    public Schedule markScheduleAsComplete(@PathVariable Long id) {
        return scheduleService.markScheduleAsComplete(id);
    }
    // API để lấy số lịch hoàn thành trong tuần
    @GetMapping("/completed/week/{userId}/{startDate}")
    public Map<String, Long> getCompletedSchedulesCount(@PathVariable Long userId, @PathVariable String startDate) {
        LocalDate startLocalDate = LocalDate.parse(startDate);
        long count = scheduleService.getCompletedSchedulesCount(userId, startLocalDate);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }

    // API để lấy số lịch chưa hoàn thành trong tuần
    @GetMapping("/unfinished/week/{userId}/{startDate}")
    public Map<String, Long> getUnfinishedSchedulesCount(@PathVariable Long userId, @PathVariable String startDate) {
        LocalDate startLocalDate = LocalDate.parse(startDate);
        long count = scheduleService.getUnfinishedSchedulesCount(userId, startLocalDate);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }
    @GetMapping("/completed/{userId}")
    public Map<String, Long> getCompletedSchedules(@PathVariable Long userId) {
        long count = scheduleService.countCompletedSchedules(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }

    // API để lấy số lượng lịch chưa hoàn thành
    @GetMapping("/unfinished/{userId}")
    public Map<String, Long> getUnfinishedSchedules(@PathVariable Long userId) {
        long count = scheduleService.countUnfinishedSchedules(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }
    @GetMapping("/count/day/{userId}/{date}")
    public Map<String, Long> getSchedulesCountByDay(@PathVariable Long userId, @PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        long count = scheduleService.countSchedulesByDay(userId, localDate);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }
}