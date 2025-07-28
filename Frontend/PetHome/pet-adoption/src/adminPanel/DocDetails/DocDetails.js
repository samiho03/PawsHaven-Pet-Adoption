import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const DoctorDetails = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState({ name: '', email: '', contactNumber: '', qualifications: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDoctors(); // Call fetchDoctors directly
  }, []);

  // Fetch doctors from the API using the axios instance
  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/doctors'); // Use configured instance
      setDoctors(response.data); // Update state with doctors' data
      console.log('Doctors data:', response.data); // Log doctors data
    } catch (error) {
      console.error('Error fetching doctors:', error.response?.data || error.message); // Improved error handling
    }
  };

  // Create a new doctor using the axios instance
  const createDoctor = async () => {
    try {
      await axiosInstance.post('/doctors', doctor); // Use configured instance
      fetchDoctors();
      clearForm();
    } catch (error) {
      console.error('Error creating doctor:', error.response?.data || error.message); // Improved error handling
    }
  };

  // Update doctor details using the axios instance
  const updateDoctor = async () => {
    try {
      await axiosInstance.put(`/doctors/${editingId}`, doctor); // Use configured instance
      fetchDoctors();
      clearForm();
    } catch (error) {
      console.error('Error updating doctor:', error.response?.data || error.message); // Improved error handling
    }
  };

  // Delete doctor using the axios instance
  const deleteDoctor = async (id) => {
    try {
      await axiosInstance.delete(`/doctors/${id}`); // Use configured instance
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error.response?.data || error.message); // Improved error handling
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateDoctor();
    } else {
      createDoctor();
    }
  };

  const handleEdit = (doctor) => {
    setDoctor(doctor);
    setIsEditing(true);
    setEditingId(doctor.id);
  };

  const clearForm = () => {
    setDoctor({ name: '', email: '', contactNumber: '', qualifications: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div style={{ padding: '40px', paddingRight:'-20px' }}>
      <h2 style={{ color: 'black', marginTop: '-20px' }}>Doctor Management</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={doctor.name}
          onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="Email"
          value={doctor.email}
          onChange={(e) => setDoctor({ ...doctor, email: e.target.value })}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="Contact Number"
          value={doctor.contactNumber}
          onChange={(e) => setDoctor({ ...doctor, contactNumber: e.target.value })}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <TextField
          label="Qualifications"
          value={doctor.qualifications}
          onChange={(e) => setDoctor({ ...doctor, qualifications: e.target.value })}
          fullWidth
          margin="normal"
          sx={{ '& fieldset': { borderRadius: '15px' } }}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginTop: '20px', backgroundColor: isEditing ? '#5D2510' : '#1c1e21', borderRadius: '10px', padding: '10px' }}
        >
          {isEditing ? 'Update Doctor' : 'Create Doctor'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={clearForm}
          style={{ marginLeft: '20px', marginTop: '20px', backgroundColor: '#1c1e21', borderRadius: '10px', paddingLeft: '30px', paddingTop: '10px', paddingBottom: '10px', paddingRight: '30px' }}
        >
          Clear
        </Button>
      </form>

      <Paper style={{ marginTop: '40px', padding: '20px', backgroundColor: '#ede8d0', borderRadius: '10px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Qualifications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.email}</TableCell>
                <TableCell>{doc.contactNumber}</TableCell>
                <TableCell>{doc.qualifications}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(doc)}>
                    <EditIcon style={{ color: '#5d2510' }} />
                  </IconButton>
                  <IconButton onClick={() => deleteDoctor(doc.id)}>
                    <DeleteIcon style={{ color: '#692f22' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

export default DoctorDetails;

