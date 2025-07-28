package com.example.PostApet.Repository;

import com.example.PostApet.Model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndPetId(Long userId, Long petId);
    void deleteByUserIdAndPetId(Long userId, Long petId);
    boolean existsByUserIdAndPetId(Long userId, Long petId);
}