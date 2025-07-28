package com.example.PostApet.Service;

import com.example.PostApet.Model.PetModel;
import com.example.PostApet.Model.User;
import com.example.PostApet.Repository.PetRepository;
import com.example.PostApet.Repository.UserRepository;
import com.example.PostApet.Service.EmailService;
import com.example.PostApet.dto.PetDto;
import com.example.PostApet.dto.QuizRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public abstract class PetService {

    @Autowired
    protected PetRepository petRepository;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected EmailService emailService;

    public PetModel savePet(PetModel petModel) {
        return petRepository.save(petModel);
    }


    public List<PetDto> getAllPets() {
        return petRepository.findAll().stream()
                .map(PetDto::fromEntity)
                .collect(Collectors.toList());
    }

    public PetModel getPetEntityById(Long petId) {
        return petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + petId));
    }


    public PetDto getPetById(Long id) {
        return petRepository.findById(id)
                .map(pet -> {
                    PetDto dto = PetDto.fromEntity(pet);
                    // Include owner information
                    if (pet.getUser() != null) {
                        dto.setOwnerName(pet.getUser().getName());
                        dto.setOwnerProfileImage(pet.getUser().getProfileImage());
                        dto.setOwnerId(pet.getUser().getId());
                    }
                    return dto;
                })
                .orElse(null);
    }

    public PetModel updatePetStatus(long id, String status) {
        PetModel pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        pet.setRegStatus(status);
        PetModel saved = petRepository.save(pet);

        if (pet.getUser() != null && ("Approved".equalsIgnoreCase(status) || "Rejected".equalsIgnoreCase(status))) {
            emailService.sendEmail(pet.getUser().getEmail(),
                    "Adoption Post " + status,
                    "Your adoption post '" + pet.getPetName() + "' has been " + status.toLowerCase() + ".");
        }

        return saved;
    }

    public PetModel updatePet(int id, PetModel petModel) {
        petModel.setId(id);
        return petRepository.save(petModel);
    }

    public abstract PetModel updatePet(long id, PetModel petModel);

    public String deletePet(long id) {
        petRepository.deleteById(id);
        return "Pet deleted successfully";
    }

    public PetModel calculateCosts(PetModel petModel) {
        petModel.calculateTotalCost();
        petModel.calculateNetCost();
        return petModel;
    }

    public List<PetDto> getPetsByUserEmail(String email) {
        User user = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return petRepository.findByUser(user).stream()
                .map(PetDto::fromEntity)
                .collect(Collectors.toList());
    }

    public PetModel updatePetAvailability(long id, Boolean available) {  // Changed from boolean to Boolean
        PetModel pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        pet.setAvailable(available);
        return petRepository.save(pet);
    }

    public List<PetDto> getRecentApprovedPets(int limit) {
        return petRepository.findTop8ByRegStatusOrderByIdDesc("Approved")
                .stream()
                .map(PetDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PetDto> getRecentPets(int limit) {
        PageRequest request = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "id"));
        return petRepository.findAll(request)
                .getContent()
                .stream()
                .map(PetDto::fromEntity)
                .collect(Collectors.toList());
    }


    public List<PetDto> getApprovedPets(
            String specie,
            String breed,
            String gender,
            String location,
            String search) {

        Specification<PetModel> spec = Specification.where((root, query, cb) ->
                cb.equal(root.get("regStatus"), "Approved"));

        if (specie != null && !specie.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("specie"), specie));
        }

        if (breed != null && !breed.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("breed"), breed));
        }

        if (gender != null && !gender.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("gender"), gender));
        }

        if (location != null && !location.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("location"), location));
        }

        if (search != null && !search.isEmpty()) {
            String searchTerm = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("petName")), searchTerm),
                            cb.like(cb.lower(root.get("breed")), searchTerm),
                            cb.like(cb.lower(root.get("location")), searchTerm)
                    ));
        }

        return petRepository.findAll(spec)
                .stream()
                .map(PetDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PetDto> getRecommendedPets(String specie, Long exclude) {
        List<PetModel> pets = petRepository.findBySpecieAndRegStatus(specie, "Approved");

        if (exclude != null) {
            pets = pets.stream()
                    .filter(p -> !p.getId().equals(exclude))
                    .collect(Collectors.toList());
        }

        return pets.stream()
                .limit(4)
                .map(PetDto::fromEntity)
                .collect(Collectors.toList());
    }

    public abstract List<PetDto> findMatchingPets(QuizRequest quizRequest);


}