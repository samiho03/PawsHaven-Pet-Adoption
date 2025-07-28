package com.example.PostApet.Service.auth;


import com.example.PostApet.dto.SignupRequest;
import com.example.PostApet.dto.UserDto;

public interface AuthService {
    UserDto createUser (SignupRequest signupRequest);
}
