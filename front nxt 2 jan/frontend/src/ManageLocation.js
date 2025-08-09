import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function LocationList({ locations, onLocationClick, onDeleteLocation }) {
  const navigate = useNavigate();
  let role = null;
  const auth = localStorage.getItem('authToken');

  if (auth) {
    try {
      const decoded = jwtDecode(auth);
      role = decoded.roll;
      console.log(role);
    } catch (error) {
      console.error("Error decoding token:", error);
      role = null;
    }
  }

  useEffect(() => {
    if (!auth || role !== 'admin') {
      Swal.fire({
        icon: 'warning',
        title: 'Not Authenticated',
        text: 'Please log in as an admin to access this page.',
      });
      navigate('/');
    }
  }, [auth, role, navigate]);

  return (
    <div className="container-fluid">
      <h2 className="bus">Locations</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Location Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.length > 0 ? (
              locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.location_name || 'No location name'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onLocationClick(location)} className="btngreen">
                        Edit
                      </button>
                      <button onClick={() => onDeleteLocation(location)} className="btndelete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No locations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManageLocation() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchLocationEntries();
  }, []);

  const fetchLocationEntries = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching location entries:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch location entries. Please try again.',
      });
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setNewLocationName(location.location_name);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateLocation = async () => {
    if (!newLocationName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Location name cannot be empty.',
      });
      return;
    }
    try {
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/locations/${selectedLocation.id}`, {
        location_name: newLocationName,
      });
      await fetchLocationEntries();
      setModalIsOpen(false);
      setNewLocationName('');
      setSelectedLocation(null);
      setEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Location updated successfully!',
      });
    } catch (error) {
      console.error('Error updating location:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update location.',
      });
    }
  };

  const handleDeleteLocation = async (location) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this location!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://amrithaahospitals.visualplanetserver.in/locations/${location.id}`);
          await fetchLocationEntries();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Location deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting location:', error.response?.data?.message || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete location.',
          });
        }
      }
    });
  };

  return (
    <div className="admin-container">
      <div className="container">
        <LocationList
          locations={locations}
          onLocationClick={handleLocationClick}
          onDeleteLocation={handleDeleteLocation}
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="custom-modal"
          overlayClassName="custom-overlay"
        >
          <div className="details">
            <h2 className="center bus">Edit Location</h2>
            <div className="input-field">
              <label>Location Name:</label>
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="Enter location name"
              />
            </div>
            <button
              className="update-button"
              onClick={handleUpdateLocation}
            >
              Update Location
            </button>
            <button
              className="cancel-button"
              onClick={() => setModalIsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ManageLocation;