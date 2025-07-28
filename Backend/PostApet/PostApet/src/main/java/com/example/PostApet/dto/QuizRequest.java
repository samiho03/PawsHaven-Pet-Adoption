package com.example.PostApet.dto;

public class QuizRequest {
    private String petType;
    private String adoptionPurpose;
    private boolean isFirstTimeOwner;
    private String currentPets;
    private boolean hasFencedYard;
    private String hoaRestrictions;
    private String preferredSize;
    private String preferredGender;
    private String adoptionFeePreference;

    // Getters and Setters
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }

    public String getAdoptionPurpose() { return adoptionPurpose; }
    public void setAdoptionPurpose(String adoptionPurpose) { this.adoptionPurpose = adoptionPurpose; }

    public boolean isIsFirstTimeOwner() { return isFirstTimeOwner; }
    public void setIsFirstTimeOwner(boolean isFirstTimeOwner) { this.isFirstTimeOwner = isFirstTimeOwner; }

    public String getCurrentPets() { return currentPets; }
    public void setCurrentPets(String currentPets) { this.currentPets = currentPets; }

    public boolean isHasFencedYard() { return hasFencedYard; }
    public void setHasFencedYard(boolean hasFencedYard) { this.hasFencedYard = hasFencedYard; }

    public String getHoaRestrictions() { return hoaRestrictions; }
    public void setHoaRestrictions(String hoaRestrictions) { this.hoaRestrictions = hoaRestrictions; }

    public String getPreferredSize() { return preferredSize; }
    public void setPreferredSize(String preferredSize) { this.preferredSize = preferredSize; }

    public String getPreferredGender() { return preferredGender; }
    public void setPreferredGender(String preferredGender) { this.preferredGender = preferredGender; }

    public String getAdoptionFeePreference() { return adoptionFeePreference; }
    public void setAdoptionFeePreference(String adoptionFeePreference) {
        this.adoptionFeePreference = adoptionFeePreference;
    }
}