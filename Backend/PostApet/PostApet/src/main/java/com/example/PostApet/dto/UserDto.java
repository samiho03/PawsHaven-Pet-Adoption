package com.example.PostApet.dto;

import com.example.PostApet.Enum.UserRole;
import lombok.Data;



@Data
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private UserRole userRole;
    private String nic;
    private String phone;
    private String location;
    private String profileImage;

    public UserDto(Long id, String email, String name, UserRole userRole, String nic, String phone, String location, String profileImage) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.userRole = userRole;
        this.nic = nic;
        this.phone = phone;
        this.location = location;
        this.profileImage = profileImage;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        // Ensure consistent URL format
        if (profileImage != null && !profileImage.isEmpty()) {
            // Remove any existing base URL
            String cleanPath = profileImage.replace("http://localhost:8080", "");
            // Ensure it starts with /uploads
            if (!cleanPath.startsWith("/uploads")) {
                cleanPath = "/uploads" + cleanPath;
            }
            this.profileImage = "http://localhost:8080" + cleanPath;
        } else {
            this.profileImage = null;
        }
    }


    public UserDto() {
    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }


}