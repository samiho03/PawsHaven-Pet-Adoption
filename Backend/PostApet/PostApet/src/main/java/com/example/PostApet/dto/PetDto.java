package com.example.PostApet.dto;

import com.example.PostApet.Model.PetModel;
import lombok.Data;

@Data
public class PetDto {
    private long id;
    private String petName;
    private String specie;
    private String breed;
    private String location;
    private String age;
    private String gender;
    private String reason;
    private String ifTemp;
    private String justify;
    private String contactEmail;
    private String contactPhoneNumber;
    private String ownerName;
    private String nic;
    private String photoUrl; // This will be the full URL
    private String regStatus;
    private String physicalStatus;
    private String docName;
    private String docStatus;
    private Double totalCost;
    private Double discount;
    private Double netCost;
    private Boolean isAvailable;

    private Long ownerId;
    private String ownerProfileImage;

    private String vaccinationStatus;
    private String colorMarkings;
    private String size;
    private boolean spayedNeutered;
    private String medicalHistory;
    private String behavior;
    private String specialNeeds;
    private Double adoptionFee;
    private boolean adoptionFeeFree;

    public Boolean getAvailable() {
        return isAvailable;
    }

    public void setAvailable(Boolean available) {
        isAvailable = available;
    }


    public static PetDto fromEntity(PetModel pet) {
        PetDto dto = new PetDto();
        dto.setId(pet.getId());
        dto.setPetName(pet.getPetName());
        dto.setSpecie(pet.getSpecie());
        dto.setBreed(pet.getBreed());
        dto.setLocation(pet.getLocation());
        dto.setAge(pet.getAge());
        dto.setGender(pet.getGender());
        dto.setReason(pet.getReason());
        dto.setIfTemp(pet.getIfTemp());
        dto.setJustify(pet.getJustify());
        dto.setContactEmail(pet.getContactEmail());
        dto.setContactPhoneNumber(pet.getContactPhoneNumber());
        dto.setOwnerName(pet.getOwnerName());
        dto.setNic(pet.getNic());
        dto.setRegStatus(pet.getRegStatus());
        dto.setPhysicalStatus(pet.getPhysicalStatus());
        dto.setDocName(pet.getDocName());
        dto.setDocStatus(pet.getDocStatus());
        dto.setTotalCost(pet.getTotalCost());
        dto.setDiscount(pet.getDiscount());
        dto.setNetCost(pet.getNetCost());
        dto.setAvailable(pet.getAvailable());

        dto.setVaccinationStatus(pet.getVaccinationStatus());
        dto.setColorMarkings(pet.getColorMarkings());
        dto.setSize(pet.getSize());
        dto.setSpayedNeutered(pet.isSpayedNeutered());
        dto.setMedicalHistory(pet.getMedicalHistory());
        dto.setBehavior(pet.getBehavior());
        dto.setSpecialNeeds(pet.getSpecialNeeds());
        dto.setAdoptionFee(pet.getAdoptionFee());
        dto.setAdoptionFeeFree(pet.isAdoptionFeeFree());


        // Add this line to map the owner's ID
        if(pet.getUser() != null) {
            dto.setOwnerId(pet.getUser().getId());
            dto.setOwnerProfileImage(pet.getUser().getProfileImage());
        }


        // Convert photo path to full URL
        if (pet.getPhoto() != null && !pet.getPhoto().startsWith("http")) {
            dto.setPhotoUrl("http://localhost:8080" + pet.getPhoto());
        } else {
            dto.setPhotoUrl(pet.getPhoto());
        }


        return dto;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerProfileImage() {
        return ownerProfileImage;
    }

    public void setOwnerProfileImage(String ownerProfileImage) {
        this.ownerProfileImage = ownerProfileImage;
    }
}