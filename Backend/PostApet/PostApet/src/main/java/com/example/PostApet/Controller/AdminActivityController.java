package com.example.PostApet.Controller;

import com.example.PostApet.Model.AdminActivity;
import com.example.PostApet.Service.AdminActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/activity")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminActivityController {
    private final AdminActivityService service;

    @Autowired
    public AdminActivityController(AdminActivityService service) {
        this.service = service;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AdminActivity>> getRecentActivities(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(service.getRecentActivities(limit));
    }
}
