package com.example.PostApet.Controller;

import com.example.PostApet.Model.User;
import com.example.PostApet.Repository.UserRepository;
import com.example.PostApet.Service.FileStorageService;
import com.example.PostApet.Service.jwt.UserService;
import com.example.PostApet.dto.UpdateProfileRequest;
import com.example.PostApet.dto.UserDto;
import com.example.PostApet.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    @Autowired
    public ProfileController(UserService userService, FileStorageService fileStorageService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/get")
    public ResponseEntity<UserDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a clean DTO without recursion
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setNic(user.getNic());
        userDto.setPhone(user.getPhone());
        userDto.setLocation(user.getLocation());

        // Handle profile image URL
        if (user.getProfileImage() != null) {
            userDto.setProfileImage(
                    user.getProfileImage().startsWith("http")
                            ? user.getProfileImage()
                            : "http://localhost:8080" + user.getProfileImage()
            );
        }

        return ResponseEntity.ok(userDto);
    }
    @GetMapping
    public ResponseEntity<UserDto> getProfile(Principal principal) {
        String email = principal.getName();
        UserDto userDto = userService.getUserProfile(email);

        // Ensure profileImage has full URL
        if (userDto.getProfileImage() != null && !userDto.getProfileImage().startsWith("http")) {
            userDto.setProfileImage("http://localhost:8080" + userDto.getProfileImage());
        }

        return ResponseEntity.ok(userDto);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> updateProfile(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "nic", required = false) String nic,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            Principal principal) throws IOException {

        String email = principal.getName();
        User currentUser = userService.getUserByEmail(email);

        String profileImagePath = currentUser.getProfileImage(); // Keep existing if no new image

        if (profileImage != null && !profileImage.isEmpty()) {
            // Delete old image if exists
            if (currentUser.getProfileImage() != null) {
                fileStorageService.delete(currentUser.getProfileImage());
            }
            // Save new image with user-specific directory
            profileImagePath = fileStorageService.store(profileImage, "profile-images/" + currentUser.getId());
        }

        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setName(name);
        updateRequest.setNic(nic);
        updateRequest.setPhone(phone);
        updateRequest.setLocation(location);
        updateRequest.setProfileImage(profileImagePath);

        UserDto updatedUser = userService.updateProfile(email, updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping(value = "/password", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updatePassword(
            @RequestPart("updateRequest") UpdateProfileRequest updateRequest,
            Principal principal) {

        String email = principal.getName();

        try {
            UserDto updatedUser = userService.updatePassword(
                    email,
                    updateRequest.getCurrentPassword(),
                    updateRequest.getNewPassword()
            );
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount(
            @RequestParam String password,
            Principal principal) {

        String email = principal.getName();

        try {
            boolean deleted = userService.deleteAccount(email, password);
            if (deleted) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.badRequest().body("Failed to delete account");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}