package com.example.PostApet.Service;

import com.example.PostApet.Model.AdminActivity;
import com.example.PostApet.Repository.AdminActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminActivityService {
    private final AdminActivityRepository repository;

    @Autowired
    public AdminActivityService(AdminActivityRepository repository) {
        this.repository = repository;
    }

    public void logActivity(String message) {
        AdminActivity activity = new AdminActivity();
        activity.setMessage(message);
        repository.save(activity);
    }

    public List<AdminActivity> getRecentActivities(int limit) {
        return repository.findRecent(limit);
    }
}
