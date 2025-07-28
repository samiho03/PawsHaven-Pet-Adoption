package com.example.PostApet.Controller;

import com.example.PostApet.Model.User;
import com.example.PostApet.Service.FavoriteService;
import com.example.PostApet.dto.PetDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {
    private final FavoriteService favoriteService;

    @Autowired
    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public ResponseEntity<List<PetDto>> getUserFavorites(Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(favoriteService.getUserFavorites(userId));
    }

    @PostMapping("/{petId}")
    public ResponseEntity<Void> addFavorite(
            @PathVariable Long petId,
            Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        favoriteService.addFavorite(userId, petId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long petId,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            favoriteService.removeFavorite(user.getId(), petId);
            return ResponseEntity.ok().build();
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{petId}/status")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable Long petId,
            Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(favoriteService.isFavorite(userId, petId));
    }
}
