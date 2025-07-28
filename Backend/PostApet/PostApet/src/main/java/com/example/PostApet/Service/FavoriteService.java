package com.example.PostApet.Service;

import com.example.PostApet.Model.Favorite;
import com.example.PostApet.Repository.FavoriteRepository;
import com.example.PostApet.Service.jwt.UserService;
import com.example.PostApet.dto.PetDto;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final PetService petService;
    private final UserService userService;

    @Autowired
    public FavoriteService(FavoriteRepository favoriteRepository,
                           PetService petService,
                           UserService userService) {
        this.favoriteRepository = favoriteRepository;
        this.petService = petService;
        this.userService = userService;
    }

    public List<PetDto> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(favorite -> petService.getPetById(favorite.getPet().getId()))
                .collect(Collectors.toList());
    }

    public void addFavorite(Long userId, Long petId) {
        if (!favoriteRepository.existsByUserIdAndPetId(userId, petId)) {
            Favorite favorite = new Favorite();
            favorite.setUser(userService.getUserById(userId));
            favorite.setPet(petService.getPetEntityById(petId));
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long petId) {
        favoriteRepository.deleteByUserIdAndPetId(userId, petId);
    }

    public boolean isFavorite(Long userId, Long petId) {
        return favoriteRepository.existsByUserIdAndPetId(userId, petId);
    }
}
