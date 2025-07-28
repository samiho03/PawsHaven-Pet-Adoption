package com.example.PostApet.Service.jwt;

import com.example.PostApet.Model.User;
import com.example.PostApet.Repository.UserRepository;
import com.example.PostApet.dto.UpdateProfileRequest;
import com.example.PostApet.dto.UserDto;
import com.example.PostApet.util.FileUploadUtil;
import com.example.PostApet.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }



    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }


    public User getUserByEmail(String email) {
        return userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public UserDto getUserProfile(String email) {
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.getUserDto();
    }


    public UserDto updateProfile(String email, UpdateProfileRequest updateRequest) {
        User user = getUserByEmail(email);

        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getNic() != null) {
            user.setNic(updateRequest.getNic());
        }
        if (updateRequest.getPhone() != null) {
            user.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getLocation() != null) {
            user.setLocation(updateRequest.getLocation());
        }
        if (updateRequest.getProfileImage() != null) {
            user.setProfileImage(updateRequest.getProfileImage());
        }

        User updatedUser = userRepository.save(user);

        emailService.sendEmail(user.getEmail(),
                "Profile Updated",
                "Your profile information has been updated.");

        return updatedUser.getUserDto();
    }


    public UserDto updatePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        User updatedUser = userRepository.save(user);

        emailService.sendEmail(user.getEmail(),
                "Password Changed",
                "Your password has been changed successfully.");

        return updatedUser.getUserDto();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Delete a user profile by ID and notify the user via email.
     *
     * @param userId ID of the user to delete
     */
    public void deleteUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        emailService.sendEmail(user.getEmail(),
                "Account Deleted",
                "Your profile has been deleted from the system.");

        userRepository.delete(user);
    }

    public boolean deleteAccount(String email, String password) {
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password");
        }


        // Delete user
        emailService.sendEmail(user.getEmail(),
                "Account Deleted",
                "Your profile has been deleted from the system.");

        userRepository.delete(user);
        return true;
    }
}