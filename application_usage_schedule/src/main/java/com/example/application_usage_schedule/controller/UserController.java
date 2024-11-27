package com.example.application_usage_schedule.controller;

import com.example.application_usage_schedule.model.User;
import com.example.application_usage_schedule.repository.ScheduleRepository;
import com.example.application_usage_schedule.repository.UserRepository;
import com.example.application_usage_schedule.repository.NotificationRepository;
import com.example.application_usage_schedule.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;  // Import @Transactional

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private ScheduleRepository  scheduleRepository;

    // Đăng ký người dùng
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody UserRegistrationRequest request) {
        Map<String, String> response = new HashMap<>();
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            response.put("status", "0");
            response.put("message", "Mật khẩu nhập lại không khớp");
            return response;
        }
        try {
            userService.registerUser(request.getUsername(), request.getEmail(), request.getPassword());
            response.put("status", "1");
            response.put("message", "Đăng ký thành công");
            return response;
        } catch (RuntimeException e) {
            response.put("status", "0");
            response.put("message", e.getMessage());
            return response;
        }
    }

    // Đăng nhập người dùng
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody UserLoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userService.loginUser(request.getUsername(), request.getPassword());
            response.put("status", "1");
            response.put("userId", user.getId());
            response.put("message", "Đăng nhập thành công");
            return response;
        } catch (RuntimeException e) {
            response.put("status", "0");
            response.put("message", e.getMessage());
            return response;
        }
    }

    // Xem thông tin tài khoản
    @GetMapping("/{id}")
    public Map<String, Object> getUserInfo(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        User userInfo = userService.getUserById(id);
        if (userInfo != null) {
            response.put("status", "1");
            response.put("user", userInfo);
            response.put("message", "Thông tin người dùng");
        } else {
            response.put("status", "0");
            response.put("message", "Không tìm thấy người dùng");
        }
        return response;
    }


    // Cập nhật thông tin tài khoản
    @PutMapping("/{id}")
    public Map<String, Object> updateUserInfo(@PathVariable Long id, @RequestBody User userDetails) {
        Map<String, Object> response = new HashMap<>();
        User existingUser = userService.getUserById(id);

        if (existingUser != null) {
            // Cập nhật các trường thông tin người dùng
            existingUser.setUsername(userDetails.getUsername());
            existingUser.setEmail(userDetails.getEmail());

            // Mã hóa mật khẩu trước khi lưu
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(userDetails.getPassword());
                existingUser.setPassword(encodedPassword);
            }

            // Lưu thông tin đã được cập nhật
            userRepository.save(existingUser);

            response.put("status", "1");
            response.put("message", "Thông tin người dùng đã được cập nhật");
        } else {
            response.put("status", "0");
            response.put("message", "Không tìm thấy người dùng");
        }
        return response;
    }

    @PostMapping("/loginadmin")
    public Map<String, Object> loginAdmin(@RequestBody UserLoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Đăng nhập người dùng và lấy thông tin người dùng
            User user = userService.loginUser(request.getUsername(), request.getPassword());

            // Kiểm tra nếu ID người dùng là 1 (admin)
            if (user.getId().equals(1L)) {
                response.put("status", "1");
                response.put("userId", user.getId());
                response.put("message", "Đăng nhập thành công với quyền Admin.");
            } else {
                response.put("status", "0");
                response.put("message", "Tài khoản không phải admin.");
            }
            return response;
        } catch (RuntimeException e) {
            response.put("status", "0");
            response.put("message", e.getMessage());
            return response;
        }
    }
    @GetMapping("/all")
    public Map<String, Object> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<User> users = userRepository.findAll(); // Lấy tất cả người dùng từ cơ sở dữ liệu
            response.put("status", "1");
            response.put("users", users);
            response.put("message", "Danh sách người dùng");
        } catch (Exception e) {
            response.put("status", "0");
            response.put("message", "Lỗi khi lấy danh sách người dùng: " + e.getMessage());
        }
        return response;
    }
    @Transactional  // Đảm bảo phương thức chạy trong transaction
    @DeleteMapping("/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            // Kiểm tra xem người dùng có tồn tại không
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                // Xóa tất cả các lịch liên quan đến người dùng
                scheduleRepository.deleteByUserId(id);  // Thực hiện xóa tất cả lịch của người dùng

                // Xóa các bản ghi trong bảng notification mà tham chiếu đến user
                notificationRepository.deleteByUserId(id);  // Thực hiện xóa thông báo

                // Xóa người dùng
                userRepository.delete(user);  // Xóa người dùng

                response.put("status", "1");
                response.put("message", "Người dùng và các thông tin liên quan đã được xóa thành công.");
            } else {
                response.put("status", "0");
                response.put("message", "Không tìm thấy người dùng với ID " + id);
            }
        } catch (Exception e) {
            response.put("status", "0");
            response.put("message", "Lỗi khi xóa người dùng: " + e.getMessage());
        }
        return response;
    }


}
