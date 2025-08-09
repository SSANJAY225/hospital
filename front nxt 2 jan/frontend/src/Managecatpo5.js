import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// Component for displaying the list of treatments
function TreatmentList({ treatments, onTreatmentClick, onDeleteTreatment }) {
  const navigate = useNavigate();
  let roll = null;
  const auth = localStorage.getItem('authToken');

  if (auth) {
    try {
      const decoded = jwtDecode(auth);
      roll = decoded.roll;
      console.log(roll);
    } catch (error) {
      console.error("Error decoding token:", error);
      roll = null;
    }
  }

  useEffect(() => {
    if (!auth || roll !== 'admin') {
      Swal.fire({
        icon: 'warning',
        title: 'Not Authenticated',
        text: 'Please log in to access this page.',
      });
      navigate('/');
    }
  }, [auth, roll, navigate]);

  return (
    <div className="container-fluid">
      <h2 className="bus">Treatments Given</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Treatment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {treatments.length > 0 ? (
              treatments.map((treatment, index) => (
                <tr key={index}>
                  <td>{treatment.treatmentgiven_text || 'No treatment text'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onTreatmentClick(treatment)} className="btngreen">Edit</button>
                      <button onClick={() => onDeleteTreatment(treatment)} className="btndelete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No treatments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main component for managing treatments
function ManageTreatments() {
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [newTreatmentText, setNewTreatmentText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch all treatments from the backend
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/treatmentgiven');
        setTreatments(response.data);
      } catch (error) {
        console.error('Error fetching treatments:', error);
      }
    };
    fetchTreatments();
  }, []);

  const handleTreatmentClick = (treatment) => {
    setSelectedTreatment(treatment);
    setNewTreatmentText(treatment.treatmentgiven_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateTreatment = async () => {
    try {
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/treatmentgiven/${selectedTreatment.id}`, {
        treatmentgiven_text: newTreatmentText,
      });
      console.log('Treatment updated successfully');
      setSelectedTreatment(null);
      setNewTreatmentText('');
      setEditMode(false);
      refreshTreatments();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Treatment updated successfully!',
      });
    } catch (error) {
      console.error('Error updating treatment:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteTreatment = async (treatment) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this treatment!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://amrithaahospitals.visualplanetserver.in/treatmentgiven/${treatment.id}`);
          console.log('Treatment deleted successfully');
          refreshTreatments();
          Swal.fire('Deleted!', 'Treatment deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting treatment:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Treatment deletion cancelled!', 'info');
      }
    });
  };

  const refreshTreatments = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/treatmentgiven');
      setTreatments(response.data);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };

  return (
    <>
      <div className="admin-container">
        <div className="container">
          <TreatmentList treatments={treatments} onTreatmentClick={handleTreatmentClick} onDeleteTreatment={handleDeleteTreatment} />
          <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="custom-modal" overlayClassName="custom-overlay">
            {selectedTreatment && editMode && (
              <div className="details">
                <h2 className="center bus">Edit Treatment</h2>
                <div className="input-field">
                  <label>Treatment Text:</label>
                  <input
                    type="text"
                    value={newTreatmentText}
                    onChange={(e) => setNewTreatmentText(e.target.value)}
                  />
                </div>
                <button className="update-button" onClick={handleUpdateTreatment}>Update Treatment</button>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default ManageTreatments;