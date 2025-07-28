package com.example.PostApet.Service.auth;


import com.example.PostApet.Enum.UserRole;
import com.example.PostApet.dto.SignupRequest;
import com.example.PostApet.dto.UserDto;
import com.example.PostApet.Model.User;
import com.example.PostApet.Repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityExistsException;
//import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service

public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void createAnAdminAccount(){
        Optional<User> adminAccount = userRepository.findByUserRole(UserRole.ADMIN);
        if(adminAccount.isEmpty()){
            User user=new User();
            user.setEmail("admin123@gmail.com");
            user.setName("Admin");
            user.setUserRole(UserRole.ADMIN);
            user.setPassword(new BCryptPasswordEncoder().encode("admin"));
            // Save the admin user to the database
            userRepository.save(user);
            System.out.println("Admin account created successfully");
        }else{
            System.out.println("Admin account already exists");
        }

    }

    public UserDto createUser (SignupRequest signupRequest){
        if(userRepository.findFirstByEmail(signupRequest.getEmail()).isPresent()){
            throw new EntityExistsException("User Already exists with email"+signupRequest.getEmail());

        }
        User user=new User();
        user.setEmail(signupRequest.getEmail());
        user.setName(signupRequest.getName());
        user.setUserRole(UserRole.USER);
        user.setPassword(new BCryptPasswordEncoder().encode(signupRequest.getPassword()));
        // Save the user and map to UserDto
        User createdUser = userRepository.save(user);
        return createdUser.getUserDto();

    }



}
