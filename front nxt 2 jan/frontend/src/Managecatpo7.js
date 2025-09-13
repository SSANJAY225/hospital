import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// Component for displaying the list of dosages
function DosageList({ dosages, onDosageClick, onDeleteDosage }) {
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
      <h2 className="bus">Dosage</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Dosage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dosages.length > 0 ? (
              dosages.map((dosage, index) => (
                <tr key={index}>
                  <td>{dosage.dosage_text || 'No dosage text'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onDosageClick(dosage)} className="btngreen">Edit</button>
                      <button onClick={() => onDeleteDosage(dosage)} className="btndelete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No dosages found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main component for managing dosages
function ManageDosage() {
  const [dosages, setDosages] = useState([]);
  const [selectedDosage, setSelectedDosage] = useState(null);
  const [newDosageText, setNewDosageText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch all dosages from the backend
  useEffect(() => {
    const fetchDosages = async () => {
      try {
        const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/dosage');
        setDosages(response.data);
      } catch (error) {
        console.error('Error fetching dosages:', error);
      }
    };
    fetchDosages();
  }, []);

  const handleDosageClick = (dosage) => {
    setSelectedDosage(dosage);
    setNewDosageText(dosage.dosage_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateDosage = async () => {
    try {
      await axios.put(`http://amrithaahospitals.visualplanetserver.in/dosage/${selectedDosage.id}`, {
        dosage_text: newDosageText,
      });
      console.log('Dosage updated successfully');
      setSelectedDosage(null);
      setNewDosageText('');
      setEditMode(false);
      refreshDosages();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Dosage updated successfully!',
      });
    } catch (error) {
      console.error('Error updating dosage:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteDosage = async (dosage) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this dosage!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://amrithaahospitals.visualplanetserver.in/dosage/${dosage.id}`);
          console.log('Dosage deleted successfully');
          refreshDosages();
          Swal.fire('Deleted!', 'Dosage deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting dosage:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Dosage deletion cancelled!', 'info');
      }
    });
  };

  const refreshDosages = async () => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/dosage');
      setDosages(response.data);
    } catch (error) {
      console.error('Error fetching dosages:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };

  return (
    <>
      <div className="admin-container">
        <div className="container">
          <DosageList dosages={dosages} onDosageClick={handleDosageClick} onDeleteDosage={handleDeleteDosage} />
          <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="custom-modal" overlayClassName="custom-overlay">
            {selectedDosage && editMode && (
              <div className="details">
                <h2 className="center bus">Edit Dosage</h2>
                <div className="input-field">
                  <label>Dosage Text:</label>
                  <input
                    type="text"
                    value={newDosageText}
                    onChange={(e) => setNewDosageText(e.target.value)}
                  />
                </div>
                <button className="update-button" onClick={handleUpdateDosage}>Update Dosage</button>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default ManageDosage;