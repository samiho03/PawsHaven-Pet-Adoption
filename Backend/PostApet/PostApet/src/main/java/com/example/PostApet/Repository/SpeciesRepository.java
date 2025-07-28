package com.example.PostApet.Repository;

import com.example.PostApet.Model.Species;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpeciesRepository extends JpaRepository<Species, Long> {
    List<Species> findAllByOrderByNameAsc();

    Species findByName(String name);
}