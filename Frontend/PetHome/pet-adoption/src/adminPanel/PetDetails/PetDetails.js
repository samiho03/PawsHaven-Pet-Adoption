import './PetDetails.css';
import React, { useState, useEffect } from "react";
import axiosInstance from '../../api/axiosConfig';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';
import PetImage from '../../pages/Profile/PetImage';

const PetDetails = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [petsPerPage] = useState(8); 
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    axiosInstance
      .get("/pets/getAll")
      .then((response) => {
        // Sort pets by ID in descending order (newest first)
        const sortedPets = response.data.sort((a, b) => b.id - a.id);
        setPets(sortedPets);
        setFilteredPets(sortedPets);
      })
      .catch((error) => {
        console.error("There was an error fetching the pet data!", error);
      });
  }, []);

   const handleStatusChange = (id, status) => {
    axiosInstance
      .put(`/pets/${id}/status?status=${status}`)
      .then((response) => {
        setPets((prevPets) =>
          prevPets.map((pet) =>
            pet.id === id ? { ...pet, regStatus: status } : pet
          ).sort((a, b) => b.id - a.id) // Maintain sort order after update
        );
        setFilteredPets((prevPets) =>
          prevPets.map((pet) =>
            pet.id === id ? { ...pet, regStatus: status } : pet
          ).sort((a, b) => b.id - a.id) // Maintain sort order after update
        );
      })
      .catch((error) => {
        console.error("Error updating the status!", error);
      });
  };

  const handleSearch = () => {
    if (searchId.trim() === '') {
      setFilteredPets([...pets].sort((a, b) => b.id - a.id)); // Apply sort when resetting
      setCurrentPage(1);
      return;
    }
    
    const filtered = pets.filter(pet => 
      pet.id.toString().includes(searchId.toString())
    ).sort((a, b) => b.id - a.id); // Sort filtered results
    setFilteredPets(filtered);
    setCurrentPage(1);
  };


   const applyFilter = (filter) => {
  setActiveFilter(filter);
  if (filter === 'All') {
    setFilteredPets([...pets].sort((a, b) => b.id - a.id));
  } else {
    const filtered = pets.filter(pet => {
      if (filter === 'Pending') {
        // Explicitly check for null or undefined
        return pet.regStatus === null || pet.regStatus === undefined;
      } else {
        return pet.regStatus === filter;
      }
    }).sort((a, b) => b.id - a.id);
    setFilteredPets(filtered);
  }
  setCurrentPage(1);
};



  // Helper function to safely handle null values
  const getSafeValue = (value, defaultValue = 'N/A') => {
    return value !== null && value !== undefined ? value : defaultValue;
  };

  // Helper function to format boolean values
  const formatBoolean = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value ? 'Yes' : 'No';
  };

  // Get current pets for pagination
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="pet-details-container">
      <h2 className="pet-list-title">Requested List</h2>

       <div className="filter-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Pet ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            <i className="fas fa-search"></i> Search
          </button>
        </div>

        <div className="status-filter-container">
          <button 
            className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => applyFilter('All')}
          >
            All
          </button>
          <button 
            className={`filter-button ${activeFilter === 'Pending' ? 'active' : ''}`}
            onClick={() => applyFilter('Pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-button ${activeFilter === 'Approved' ? 'active' : ''}`}
            onClick={() => applyFilter('Approved')}
          >
            Approved
          </button>
          <button 
            className={`filter-button ${activeFilter === 'Rejected' ? 'active' : ''}`}
            onClick={() => applyFilter('Rejected')}
          >
            Rejected
          </button>
        </div>
      </div>


      {filteredPets.length > 0 ? (
        <>
          <table className="pet-list-table">
            <thead className="pet-list-header">
              <tr>
                <th className="pet-list-th">Image</th>
                <th className="pet-list-th">ID</th>
                <th className="pet-list-th">Pet Name</th>
                <th className="pet-list-th pet-list-details-col">Pet Details</th>
                <th className="pet-list-th">Justification</th>
                <th className="pet-list-th">Owner Details</th>
                <th className="pet-list-th">Decision</th>
              </tr>
            </thead>

            <tbody className="pet-list-body">
              {currentPets.map((pet) => (
                <tr key={pet.id} className="pet-list-row">
                  <td className="pet-image-cell">
                    <Link to={`/petDetail/${pet.id}`} className="pet-image-link">
                      <div className="pet-image-container">
                        <PetImage pet={pet} className="pet-image" />
                      </div>
                    </Link>
                  </td>
                  <td className="pet-name">{getSafeValue(pet.id)}</td>
                  <td className="pet-name">{getSafeValue(pet.petName)}</td>
                  <td className="pet-details">
                    <div className="detail-section">
                      <span className="category-label">Specie:</span> {getSafeValue(pet.specie)}<br />
                      <span className="category-label">Breed:</span> {getSafeValue(pet.breed)}<br />
                      <span className="category-label">Age:</span> {getSafeValue(pet.age)}<br />
                      <span className="category-label">Gender:</span> {getSafeValue(pet.gender)}<br />
                      <span className="category-label">Size:</span> {getSafeValue(pet.size)}<br />
                      <span className="category-label">Color:</span> {getSafeValue(pet.colorMarkings)}
                    </div>
                    <div className="detail-section">
                      <span className="category-label">Vaccination:</span> {getSafeValue(pet.vaccinationStatus)}<br />
                      <span className="category-label">Spayed/Neutered:</span> {formatBoolean(pet.spayedNeutered)}<br />
                      <span className="category-label">Adoption Fee:</span> 
                      {pet.adoptionFeeFree ? 'Free' : `Rs.${getSafeValue(pet.adoptionFee, '0')}`}
                    </div>
                  </td>
                
                  <td className="pet-justify">
                    <div className="justification-text">
                    <span className="category-label">Justification:</span>{getSafeValue(pet.justify)}
                    </div>
                    {pet.specialNeeds && (
                      <div className="special-needs">
                        <span className="category-label">Special Needs:</span> {getSafeValue(pet.specialNeeds)}
                      </div>
                    )}
                    {pet.medicalHistory && (
                      <div className="medical-history">
                        <span className="category-label">Medical History:</span> {getSafeValue(pet.medicalHistory)}
                      </div>
                    )}
                    {pet.behavior && (
                      <div className="behavior">
                        <span className="category-label">Behavior:</span> {getSafeValue(pet.behavior)}
                      </div>
                    )}
                  </td>
                  <td className="owner-details">
                    <span className="category-label">Owner:</span> {getSafeValue(pet.ownerName)}<br />
                    <span className="category-label">Location:</span> {getSafeValue(pet.location)} <br />
                    <span className="category-label">NIC:</span> {getSafeValue(pet.nic)}<br />
                    <span className="category-label">Email:</span> {getSafeValue(pet.contactEmail)}<br />
                    <span className="category-label">Phone No:</span> {getSafeValue(pet.contactPhoneNumber)}
                  </td>
                
                  <td className="decision-cell">
                    <div className="decision-container">
                      <div className="button-row">
                        <button 
                          className="approve-button" 
                          onClick={() => handleStatusChange(pet.id, "Approved")}
                          disabled={pet.regStatus === "Approved"}
                        >
                          <i className="fas fa-check"></i> 
                        </button>
                        <button 
                          className="reject-button" 
                          onClick={() => handleStatusChange(pet.id, "Rejected")}
                          disabled={pet.regStatus === "Rejected"}
                        >
                          <i className="fas fa-times"></i> 
                        </button>
                      </div>
                      <div className="status-display">
                        <span className={`status-badge ${pet.regStatus ? pet.regStatus.toLowerCase() : 'pending'}`}>
                          {getSafeValue(pet.regStatus, 'Pending')}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => paginate(Math.max(1, currentPage - 1))} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="no-pets-message">No pets found matching your criteria.</p>
      )}
    </div>
  );
};

export default PetDetails;