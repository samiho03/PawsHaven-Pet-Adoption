package com.example.PostApet.Controller;

import com.example.PostApet.Model.PetModel;
import com.example.PostApet.Model.Species;
import com.example.PostApet.Model.User;
import com.example.PostApet.Repository.SpeciesRepository;
import com.example.PostApet.Repository.UserRepository;
import com.example.PostApet.Service.FileStorageService;
import com.example.PostApet.Service.PetService;
import com.example.PostApet.Service.EmailService;
import com.example.PostApet.dto.PetDto;
import com.example.PostApet.dto.QuizRequest;
import com.example.PostApet.dto.UserDto;
import org.springframework.core.io.Resource; // Correct import
// Remove jakarta.annotation.Resource
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/pets")
@CrossOrigin(origins = "http://localhost:3000")
public class PetController {

    private final PetService petService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final SpeciesRepository speciesRepository;
    private final EmailService emailService;
    public PetController(PetService petService, UserRepository userRepository, FileStorageService fileStorageService, SpeciesRepository speciesRepository, EmailService emailService) {
        this.petService = petService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.speciesRepository = speciesRepository;
        this.emailService = emailService;
    }


    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> addPet(
            @RequestParam(value = "petName") String petName,
            @RequestParam(value = "specie") String specie,
            @RequestParam(value = "breed") String breed,
            @RequestParam(value = "location") String location,
            @RequestParam(value = "age") String age,
            @RequestParam(value = "gender") String gender,
            @RequestParam(value = "reason") String reason,
            @RequestParam(value = "ifTemp") String ifTemp,
            @RequestParam(value = "justify") String justify,
            @RequestParam(value = "vaccinationStatus") String vaccinationStatus,
            @RequestParam(value = "colorMarkings") String colorMarkings,
            @RequestParam(value = "size") String size,
            @RequestParam(value = "spayedNeutered") boolean spayedNeutered,
            @RequestParam(value = "medicalHistory") String medicalHistory,
            @RequestParam(value = "behavior") String behavior,
            @RequestParam(value = "specialNeeds") String specialNeeds,
            @RequestParam(value = "adoptionFee") double adoptionFee,
            @RequestParam(value = "adoptionFeeFree") boolean adoptionFeeFree,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            Principal principal) throws IOException {

        // Get current user
        String email = principal.getName();
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create new pet
        PetModel petModel = new PetModel();
        petModel.setPetName(petName);
        petModel.setSpecie(specie);
        petModel.setBreed(breed);
        petModel.setLocation(location);
        petModel.setAge(age);
        petModel.setGender(gender);
        petModel.setReason(reason);
        petModel.setIfTemp(ifTemp);
        petModel.setJustify(justify);
        petModel.setUser(user);
        petModel.setVaccinationStatus(vaccinationStatus);
        petModel.setColorMarkings(colorMarkings);
        petModel.setSize(size);
        petModel.setSpayedNeutered(spayedNeutered);
        petModel.setMedicalHistory(medicalHistory);
        petModel.setBehavior(behavior);
        petModel.setSpecialNeeds(specialNeeds);
        petModel.setAdoptionFee(adoptionFeeFree ? 0 : adoptionFee);
        petModel.setAdoptionFeeFree(adoptionFeeFree);

        // Auto-fill user's contact information
        petModel.setContactEmail(user.getEmail());
        petModel.setContactPhoneNumber(user.getPhone());
        petModel.setOwnerName(user.getName());
        petModel.setNic(user.getNic());

        // First save the pet to generate an ID
        PetModel savedPet = petService.savePet(petModel);

        // Now handle photo upload with the actual pet ID
        if (photo != null && !photo.isEmpty()) {
            String photoPath = fileStorageService.store(photo, "pet-images/" + savedPet.getId());
            savedPet.setPhoto(photoPath);
            petService.savePet(savedPet); // Update with photo path
        }

        emailService.sendEmail(user.getEmail(),
                "Adoption Post Created",
                "Your adoption post has been created and is pending approval.");

        return ResponseEntity.ok("New pet added successfully");
    }


    @GetMapping("/getAll")
    public List<PetDto> getAllPets() {
        return petService.getAllPets();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<PetDto> getPetById(@PathVariable Long id) {
        PetDto pet = petService.getPetById(id);
        return pet != null ? ResponseEntity.ok(pet) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PetModel> updatePetStatus(
            @PathVariable int id,
            @RequestParam String status) {
        try {
            PetModel updatedPet = petService.updatePetStatus(id, status.trim());
            return ResponseEntity.ok(updatedPet);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PetModel> updatePet(
            @PathVariable int id,
            @RequestBody PetModel petModel) {
        PetModel updatedPet = petService.updatePet(id, petModel);
        return ResponseEntity.ok(updatedPet);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePet(@PathVariable int id) {
        petService.deletePet(id);
        return ResponseEntity.ok("Pet deleted successfully");
    }

    @PostMapping("/calculate")
    public ResponseEntity<PetModel> calculateCosts(@RequestBody PetModel petModel) {
        PetModel calculatedPet = petService.calculateCosts(petModel);
        return ResponseEntity.ok(calculatedPet);
    }
    @PostMapping("/quiz")
    public ResponseEntity<List<PetDto>> findMatchingPets(@RequestBody QuizRequest quizRequest) {
        List<PetDto> matchedPets = petService.findMatchingPets(quizRequest);
        return ResponseEntity.ok(matchedPets);
    }

    @GetMapping("/my-pets")
    public ResponseEntity<List<PetDto>> getUserPets() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authenticated user: " + authentication.getName()); // Log the username

            List<PetDto> pets = petService.getPetsByUserEmail(authentication.getName());
            System.out.println("Found " + pets.size() + " pets"); // Log pet count

            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            System.err.println("Error in getUserPets: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<PetModel> updatePetAvailability(
            @PathVariable int id,
            @RequestParam Boolean available) {  // Changed from boolean to Boolean
        try {
            PetModel updatedPet = petService.updatePetAvailability(id, available);
            return ResponseEntity.ok(updatedPet);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/recent-approved")
    public ResponseEntity<List<PetDto>> getRecentApprovedPets() {
        try {
            // Get 8 most recent approved pets, ordered by creation date descending
            List<PetDto> pets = petService.getRecentApprovedPets(8);
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/approved")
    public ResponseEntity<List<PetDto>> getApprovedPets(
            @RequestParam(required = false) String specie,
            @RequestParam(required = false) String breed,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {

        List<PetDto> pets = petService.getApprovedPets(specie, breed, gender, location, search);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<PetDto>> getRecommendedPets(
            @RequestParam String specie,
            @RequestParam(required = false) long exclude) {

        List<PetDto> pets = petService.getRecommendedPets(specie, exclude);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserDto> getUserProfile(@PathVariable long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user.getUserDto());
    }

    @PostMapping(value = "/add/by-name", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> addPet(
            @RequestParam(value = "speciesId") Long speciesId,
            @RequestParam(value = "specie") String specie,
            @RequestParam(value = "petName") String petName,
            @RequestParam(value = "breed") String breed,
            @RequestParam(value = "location") String location,
            @RequestParam(value = "age") String age,
            @RequestParam(value = "gender") String gender,
            @RequestParam(value = "reason") String reason,
            @RequestParam(value = "ifTemp") String ifTemp,
            @RequestParam(value = "justify") String justify,
            @RequestParam(value = "vaccinationStatus") String vaccinationStatus,
            @RequestParam(value = "colorMarkings") String colorMarkings,
            @RequestParam(value = "size") String size,
            @RequestParam(value = "spayedNeutered") boolean spayedNeutered,
            @RequestParam(value = "medicalHistory") String medicalHistory,
            @RequestParam(value = "behavior") String behavior,
            @RequestParam(value = "specialNeeds") String specialNeeds,
            @RequestParam(value = "adoptionFee") double adoptionFee,
            @RequestParam(value = "adoptionFeeFree") boolean adoptionFeeFree,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            Principal principal) throws IOException {

        // Get current user
        String email = principal.getName();
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get species
        Species species = speciesRepository.findById(speciesId)
                .orElseThrow(() -> new RuntimeException("Species not found"));

        // Create new pet
        PetModel petModel = new PetModel();
        petModel.setSpecie(specie);
        petModel.setPetName(petName);
        petModel.setBreed(breed);
        petModel.setLocation(location);
        petModel.setAge(age);
        petModel.setGender(gender);
        petModel.setReason(reason);
        petModel.setIfTemp(ifTemp);
        petModel.setJustify(justify);
        petModel.setUser(user);
        petModel.setVaccinationStatus(vaccinationStatus);
        petModel.setColorMarkings(colorMarkings);
        petModel.setSize(size);
        petModel.setSpayedNeutered(spayedNeutered);
        petModel.setMedicalHistory(medicalHistory);
        petModel.setBehavior(behavior);
        petModel.setSpecialNeeds(specialNeeds);
        petModel.setAdoptionFee(adoptionFeeFree ? 0 : adoptionFee);
        petModel.setAdoptionFeeFree(adoptionFeeFree);


        // Handle image upload
        if (photo != null && !photo.isEmpty()) {
            String photoPath = fileStorageService.store(photo, "pet-images/" + petModel.getId());
            petModel.setPhoto(photoPath);
        }

        petService.savePet(petModel);

        emailService.sendEmail(user.getEmail(),
                "Adoption Post Created",
                "Your adoption post has been created and is pending approval.");

        return ResponseEntity.ok("New pet added successfully");
    }




}