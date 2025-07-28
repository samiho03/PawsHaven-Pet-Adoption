package com.example.PostApet.Service;

import com.example.PostApet.Model.PetModel;
import com.example.PostApet.dto.PetDto;
import com.example.PostApet.dto.QuizRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PetServiceImpl extends PetService {

    @Override
    public PetModel savePet(PetModel petModel) {
        return super.savePet(petModel);
    }

    @Override
    public List<PetDto> getAllPets() {
        return super.getAllPets();
    }

    @Override
    public PetDto getPetById(Long id) {
        return super.getPetById(id);
    }

    @Override
    public PetModel updatePetStatus(long id, String status) {
        return super.updatePetStatus(id, status);
    }

    @Override
    public PetModel updatePet(long id, PetModel petModel) {
        PetModel existingPet = petRepository.findById(id).orElse(null);
        if (existingPet != null) {
            existingPet.setPetName(petModel.getPetName());
            existingPet.setSpecie(petModel.getSpecie());
            existingPet.setBreed(petModel.getBreed());
            existingPet.setLocation(petModel.getLocation());
            existingPet.setAge(petModel.getAge());
            existingPet.setGender(petModel.getGender());
            existingPet.setReason(petModel.getReason());
            existingPet.setIfTemp(petModel.getIfTemp());
            existingPet.setJustify(petModel.getJustify());
            existingPet.setContactEmail(petModel.getContactEmail());
            existingPet.setContactPhoneNumber(petModel.getContactPhoneNumber());
            existingPet.setOwnerName(petModel.getOwnerName());
            existingPet.setNic(petModel.getNic());
            existingPet.setPhoto(petModel.getPhoto());
            existingPet.setRegStatus(petModel.getRegStatus());
            existingPet.setPhysicalStatus(petModel.getPhysicalStatus());
            existingPet.setDocName(petModel.getDocName());
            existingPet.setDocStatus(petModel.getDocStatus());
            existingPet.setDiscount(petModel.getDiscount());
            existingPet.setNetCost(petModel.getNetCost());
            existingPet.setTotalCost(petModel.getTotalCost());
            return petRepository.save(existingPet);
        }
        return null;
    }

    @Override
    public String deletePet(long id) {
        if (petRepository.existsById(id)) {
            petRepository.deleteById(id);
            return "Pet deleted successfully!";
        }
        return "Pet not found!";
    }

    @Override
    public PetModel calculateCosts(PetModel petModel) {
        double totalCost = 10000; // Default cost
        try {
            int ageInMonths = Integer.parseInt(petModel.getAge());
            if (ageInMonths <= 1) totalCost = 20000;
            else if (ageInMonths <= 6) totalCost = 60000;
            else if (ageInMonths <= 12) totalCost = 100000;
        } catch (NumberFormatException e) {
            // Handle invalid age format
        }

        double discountValue = petModel.getDiscount() != null ? petModel.getDiscount() : 0;
        double netCost = totalCost - (totalCost * discountValue / 100);

        petModel.setTotalCost(totalCost);
        petModel.setNetCost(netCost);

        return petModel;
    }

    //  NEW: Quiz Matching Implementation
    @Override
    public List<PetDto> findMatchingPets(QuizRequest quizRequest) {
        return petRepository.findAll().stream()
                .filter(pet -> matchesPetType(pet, quizRequest))
                .filter(pet -> matchesSize(pet, quizRequest))
                .filter(pet -> matchesGender(pet, quizRequest))
                .filter(pet -> matchesAdoptionFee(pet, quizRequest))
                .map(PetDto::fromEntity)
                .toList();
    }

    private boolean matchesPetType(PetModel pet, QuizRequest request) {
        return request.getPetType() == null || pet.getSpecie().equalsIgnoreCase(request.getPetType());
    }

    private boolean matchesSize(PetModel pet, QuizRequest request) {
        return request.getPreferredSize() == null || pet.getSize() != null && pet.getSize().equalsIgnoreCase(request.getPreferredSize());
    }

    private boolean matchesGender(PetModel pet, QuizRequest request) {
        if (request.getPreferredGender() == null ||
                request.getPreferredGender().isEmpty() ||
                request.getPreferredGender().equalsIgnoreCase("either")) {
            return true; // Show all pets if no preference or "either" is selected
        }
        // Otherwise, filter by exact gender match
        return pet.getGender().equalsIgnoreCase(request.getPreferredGender());
    }

    private boolean matchesAdoptionFee(PetModel pet, QuizRequest request) {
        if (request.getAdoptionFeePreference() == null || request.getAdoptionFeePreference().isEmpty()) {
            return true; // No preference → show all
        }

        if (request.getAdoptionFeePreference().equals("free")) {
            return pet.isAdoptionFeeFree() || pet.getAdoptionFee() == 0;
        } else {
            return true; // "any" → show all pets
        }

    }

}