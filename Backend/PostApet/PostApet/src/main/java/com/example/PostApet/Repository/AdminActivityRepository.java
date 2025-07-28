package com.example.PostApet.Repository;

import com.example.PostApet.Model.AdminActivity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminActivityRepository extends JpaRepository<AdminActivity, Long> {
    default List<AdminActivity> findRecent(int limit) {
        PageRequest request = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "id"));
        return findAll(request).getContent();
    }
}
