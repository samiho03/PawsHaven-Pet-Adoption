package com.example.PostApet.Controller;

import com.example.PostApet.Model.Species;
import com.example.PostApet.Repository.SpeciesRepository;
import com.example.PostApet.Service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/species")
@CrossOrigin(origins = "http://localhost:3000")
public class SpeciesController {
    private final SpeciesRepository speciesRepository;
    private final FileStorageService fileStorageService;

    public SpeciesController(SpeciesRepository speciesRepository,
                             FileStorageService fileStorageService) {
        this.speciesRepository = speciesRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<Species> getAllSpecies() {
        return speciesRepository.findAllByOrderByNameAsc();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Species> createSpecies(
            @RequestParam("name") String name,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException {

        Species species = new Species();
        species.setName(name);

        if (photo != null && !photo.isEmpty()) {
            String photoPath = fileStorageService.store(photo, "species-images");
            species.setPhoto(photoPath);
        }

        Species savedSpecies = speciesRepository.save(species);
        return ResponseEntity.ok(savedSpecies);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSpecies(@PathVariable Long id) {
        speciesRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/for-quiz")
    public ResponseEntity<List<Map<String, String>>> getSpeciesForQuiz() {
        List<Species> speciesList = speciesRepository.findAllByOrderByNameAsc();

        List<Map<String, String>> quizOptions = speciesList.stream()
                .map(species -> {
                    Map<String, String> option = new HashMap<>();
                    option.put("value", species.getName().toLowerCase());
                    option.put("label", species.getName());
                    return option;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(quizOptions);
    }
}