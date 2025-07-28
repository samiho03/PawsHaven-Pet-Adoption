package com.example.PostApet.Repository;

import com.example.PostApet.Model.PetModel;
import com.example.PostApet.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

public interface PetRepository extends JpaRepository<PetModel, Long>, JpaSpecificationExecutor<PetModel> {
    List<PetModel> findByUser(User user);
    List<PetModel> findTop8ByRegStatusOrderByIdDesc(String regStatus);
    List<PetModel> findBySpecieAndRegStatus(String specie, String regStatus);
}