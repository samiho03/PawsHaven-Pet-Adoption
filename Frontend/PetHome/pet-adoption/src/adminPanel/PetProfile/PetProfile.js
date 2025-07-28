import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import axiosInstance from '../../api/axiosConfig';
import {
  TextField,
  Button,
  Radio,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  Paper,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const PetProfile = () => {
  const [pet, setPet] = useState({
    id: '',
    petName: '',
    specie: '',
    breed: '',
    location: '',
    age: '',
    gender: '',
    reason: '',
    ifTemp: '',
    justify: '',
    contactEmail: '',
    contactPhoneNumber: '',
    ownerName: '',
    nic: '',
    regStatus: '',
    physicalStatus: '',
    docName: '',
    docStatus: '',
    totalCost: 0,
    discount: 0,
    netCost: 0
  });

  const [petsList, setPetsList] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = () => {

    axiosInstance.get('/pets/getAll')
    .then((response) => {
      setPetsList(response.data);
    })
    .catch((error) => {
      console.error('Error fetching pets:', error);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateInputs = () => {
    let validationErrors = {};
    if (!pet.petName) validationErrors.petName = "Pet name is required.";
    if (!pet.specie) validationErrors.specie = "Species is required.";
    if (!pet.breed) validationErrors.breed = "Breed is required.";
    if (!pet.location) validationErrors.location = "Location is required.";
    if (!pet.age || pet.age <= 0) validationErrors.age = "Age must be greater than 0.";
    if (!pet.gender) validationErrors.gender = "Gender is required.";
    if (!pet.contactEmail || !/\S+@\S+\.\S+/.test(pet.contactEmail)) validationErrors.contactEmail = "Valid email is required.";
    if (!pet.contactPhoneNumber || !/^[0-9]{10}$/.test(pet.contactPhoneNumber)) validationErrors.contactPhoneNumber = "Valid phone number is required.";
    if (!pet.ownerName) validationErrors.ownerName = "Owner name is required.";
    if (!pet.nic) validationErrors.nic = "NIC is required.";
    if (!pet.ifTemp || isNaN(pet.ifTemp) || pet.ifTemp < 0) validationErrors.ifTemp = "Duration is required and must be a valid number.";

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const calculateCosts = () => {
    let totalCost = 10000; // Default cost
    const ifTemp = parseInt(pet.ifTemp, 10);
    if (ifTemp <= 1) totalCost = 20000;
    else if (ifTemp <= 2) totalCost = 60000;
    else if (ifTemp <= 3) totalCost = 100000;
    else if (ifTemp <= 4) totalCost = 60000;
    else if (ifTemp <= 5) totalCost = 100000;

    const discountValue = parseFloat(discount);
    const netCost = totalCost - (totalCost * discountValue / 100);

    setPet(prevState => ({
        ...prevState,
        totalCost,
        netCost
    }));
};

  const handleSearch = () => {
 
    if (!pet.id) {
      alert('Pet ID is required for search.');
      return;
    }
    axiosInstance.get(`/pets/get/${pet.id}`)
      .then((response) => {
        if (response.data) {
          setPet(response.data);
        } else {
          alert('Pet not found!');
        }
      })
      .catch((error) => {
        console.error('Error fetching pet details:', error);
        alert('Error fetching pet details.');
      });
  };

  const handleSave = () => {

    if (!validateInputs()) return;
    axiosInstance.post(`/pets/add`, pet)
      .then(() => {
        alert('Pet added successfully!');
        resetForm();
      })
      .catch((error) => {
        console.error('Error saving pet:', error);
        alert('Error saving pet.');
      });
  };

  const handleUpdate = () => {

    if (!validateInputs()) return;
    axiosInstance.put(`/pets/update/${pet.id}`, pet)
      .then(() => {
        alert('Pet updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating pet:', error);
        alert('Error updating pet.');
      });
  };


const handleDeletePet = (id) => {
    axiosInstance.delete(`/pets/delete/${id}`)
      .then(() => {
        alert('Pet deleted successfully!');
        fetchPets(); // Refresh pet list after deletion
      })
      .catch((error) => {
        console.error('Error deleting pet:', error);
        alert('Error deleting pet.');
      });
  };

  const handleEditPet = (pet) => {
    setPet(pet); // Load the pet details into the form for editing
    setIsEditing(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const resetForm = () => {
    setPet({
      id: '',
      petName: '',
      specie: '',
      breed: '',
      location: '',
      age: '',
      gender: '',
      reason: '',
      ifTemp: '',
      justify: '',
      contactEmail: '',
      contactPhoneNumber: '',
      ownerName: '',
      nic: '',
      regStatus: '',
      physicalStatus: '',
      docName: '',
      docStatus: '',
      totalCost: 0,
      discount: 0,
      netCost: 0
    });
    setDiscount(0);
  };

  return (
    <div style={{  padding: '40px', paddingRight:'-20px'  }}>
      <h2 style={{ color: 'black', marginTop: '-20px', marginBottom: '40px' }}>Pet Profile</h2>
     
      <form>
      <div className="search-container">
          <input
            type="text"
            name="id"
            value={pet.id}
            onChange={handleInputChange}
            placeholder="   Enter Pet ID"
            className="textCombo"
            style={{
              backgroundColor: 'transparent',
              borderRadius: '10px',
              borderColor: '#cbcbcb',
              borderStyle: 'solid',
            }}
          />
          <Button
            onClick={handleSearch}
            className="search-continue-btn"
            style={{
              borderRadius: '10px',
              backgroundColor: '#1f1d1c',
              color: '#ffffff',
            }}
          >
            Search
          </Button>
        </div>
        <TextField
          label="Pet Name"
          name="petName"
          value={pet.petName}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.petName}
          helperText={errors.petName}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
     
         <Box sx={{ minWidth: 120, '& fieldset': { borderRadius: '15px' } }}>
         <FormControl fullWidth margin="normal">
          <InputLabel id="specie">Specie</InputLabel>
          <Select
            labelId="specie"
            id="specie"
            name="specie"
            value={pet.specie}
            onChange={handleInputChange}
          >
            <MenuItem value="dog">Dog</MenuItem>
            <MenuItem value="cat">Cat</MenuItem>
            <MenuItem value="fish">Fish</MenuItem>
            <MenuItem value="bird">Bird</MenuItem>
            <MenuItem value="rabbit">Rabbit</MenuItem>
            
          </Select>
        </FormControl>
        </Box>
        <TextField
          label="Breed"
          name="breed"
          value={pet.breed}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.breed}
          helperText={errors.breed}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
    
        <TextField
          label="Age"
          name="age"
          value={pet.age}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.age}
          helperText={errors.age}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup
            row
            name="gender"
            value={pet.gender}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel value="Female" control={<Radio />} label="Female" />
          </RadioGroup>
        </FormControl>
        <TextField
          label="Location"
          name="location"
          value={pet.location}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.location}
          helperText={errors.location}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
         <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Residency Type</FormLabel>
          <RadioGroup
            row
            name="reason"
            value={pet.reason}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Temporary" control={<Radio />} label="Temporary" />
            <FormControlLabel value="Adopt" control={<Radio />} label="Adoption" />
          </RadioGroup>
        </FormControl>
        <Box sx={{ minWidth: 120, '& fieldset': { borderRadius: '15px' } }}>
         <FormControl fullWidth margin="normal">
          <InputLabel id="reason-label">Temporary Duration</InputLabel>
          <Select
            labelId="ifTemp-label"
            id="ifTemp-status"
            name="ifTemp"
            value={pet.ifTemp}
            onChange={handleInputChange}
          >
            <MenuItem value="0">None</MenuItem>
            <MenuItem value="1">1 Month</MenuItem>
            <MenuItem value="2">3 Month</MenuItem>
            <MenuItem value="3">6 Month</MenuItem>
            <MenuItem value="4">1 Year</MenuItem>
            <MenuItem value="5">2 Years</MenuItem>
          </Select>
        </FormControl>
        </Box>
        
        <TextField
          label="Justification"
          name="justify"
          value={pet.justify}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="Owner Name"
          name="ownerName"
          value={pet.ownerName}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.ownerName}
          helperText={errors.ownerName}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="NIC"
          name="nic"
          value={pet.nic}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.nic}
          helperText={errors.nic}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="Contact Email"
          name="contactEmail"
          value={pet.contactEmail}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.contactEmail}
          helperText={errors.contactEmail}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="Contact Phone Number"
          name="contactPhoneNumber"
          value={pet.contactPhoneNumber}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.contactPhoneNumber}
          helperText={errors.contactPhoneNumber}
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Registration Status</FormLabel>
          <RadioGroup
            row
            name="regStatus"
            value={pet.regStatus}
            onChange={handleInputChange}
          >
            {/* <FormControlLabel value="Pending" control={<Radio />} label="Pending" /> */}
            <FormControlLabel value="Approved" control={<Radio />} label="Approved" />
            <FormControlLabel value="Rejected" control={<Radio />} label="Rejected" />
          </RadioGroup>
        </FormControl>
  
        <TextField
          label="Doctor's Name"
          name="docName"
          value={pet.docName}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="Doctor's Status"
          name="docStatus"
          value={pet.docStatus}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
         <Paper
          style={{
            marginTop: '40px',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#ede8d0',
            borderRadius: '10px',
          }}
          >
         <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Discount</FormLabel>
          <RadioGroup
            row
            name="discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          >
            <FormControlLabel value="5" control={<Radio />} label="5%" />
            <FormControlLabel value="10" control={<Radio />} label="10%" />
            <FormControlLabel value="15" control={<Radio />} label="15%" />
          </RadioGroup>
        </FormControl>
        <Button variant="contained" color="primary" onClick={calculateCosts}
        style={{ marginTop: '35px',marginLeft:'30px' ,backgroundColor: '#1c1e21'  , borderRadius: '10px',padding: '5px'}}>
            Calculate 
        </Button>
        
        <TextField
          label="Net Cost"
          name="netCost"
          value={pet.netCost}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' }  }}
        />
        <TextField
          label="Total Cost"
          name="totalCost"  
          value={pet.totalCost}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' }, marginBottom:'20px'}}
        />
       
        </Paper>
        <div>
          <Button
          variant="contained"
            color="primary"
            onClick={pet.id ? handleUpdate : handleSave} // Conditional function call
            style={{ marginTop: '10px', backgroundColor: isEditing ? '#5D2510' : '#1c1e21', color: '#ffffff', borderRadius: '10px',paddingLeft: '30px', paddingTop:'10px', paddingBottom:'10px', paddingRight:'30px' }}
            >
            {pet.id ? 'Update Pet' : 'Create Pet'}  {/* Conditional label */}
        </Button>

          <Button variant="contained" color="primary" onClick={resetForm}
          style={{ marginLeft: '20px', marginTop: '10px',backgroundColor:'#1c1e21' ,  borderRadius: '10px',paddingLeft: '30px', paddingTop:'10px', paddingBottom:'10px', paddingRight:'30px'}}>
            Clear
          </Button>
        </div>
      </form>
      <TableContainer component={Paper} style={{ marginTop: '40px',backgroundColor:'#ede8d0', borderRadius:'15px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Pet Name</TableCell>
              <TableCell>Doctor's Name</TableCell>
              <TableCell>Doctor's Decision</TableCell>
              {/* <TableCell>Discount</TableCell> */}
              <TableCell>Net Cost</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {petsList
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((petRow) => (
                <TableRow key={petRow.id}>
                  <TableCell>{petRow.id}</TableCell>
                  <TableCell>{petRow.petName}</TableCell>
                  <TableCell>{petRow.docName}</TableCell>
                  <TableCell>{petRow.docStatus}</TableCell>
                  {/* <TableCell>{petRow.discount}</TableCell> */}
                  <TableCell>{petRow.netCost}</TableCell>
                  <TableCell>{petRow.totalCost}</TableCell>
                 
                  <TableCell>
                    <IconButton onClick={() => handleEditPet(petRow)}>
                      <EditIcon style={{ color: '#5d2510' }} />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePet(petRow.id)}>
                      <DeleteIcon style={{ color: '#5d2510' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={petsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
};

export default PetProfile; 


