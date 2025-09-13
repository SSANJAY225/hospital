import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// Component for displaying the list of drugs
function DrugList({ drugs, onDrugClick, onDeleteDrug }) {
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
      <h2 className="bus">Drugs</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Drug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drugs.length > 0 ? (
              drugs.map((drug, index) => (
                <tr key={index}>
                  <td>{drug.drugs_text || 'No drug text'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onDrugClick(drug)} className="btngreen">Edit</button>
                      <button onClick={() => onDeleteDrug(drug)} className="btndelete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No drugs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main component for managing drugs
function ManageDrugs() {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [newDrugText, setNewDrugText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch all drugs from the backend
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/drugs');
        setDrugs(response.data);
      } catch (error) {
        console.error('Error fetching drugs:', error);
      }
    };
    fetchDrugs();
  }, []);

  const handleDrugClick = (drug) => {
    setSelectedDrug(drug);
    setNewDrugText(drug.drugs_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateDrug = async () => {
    try {
      await axios.put(`http://amrithaahospitals.visualplanetserver.in/drugs/${selectedDrug.id}`, {
        drugs_text: newDrugText,
      });
      console.log('Drug updated successfully');
      setSelectedDrug(null);
      setNewDrugText('');
      setEditMode(false);
      refreshDrugs();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Drug updated successfully!',
      });
    } catch (error) {
      console.error('Error updating drug:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteDrug = async (drug) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this drug!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://amrithaahospitals.visualplanetserver.in/drugs/${drug.id}`);
          console.log('Drug deleted successfully');
          refreshDrugs();
          Swal.fire('Deleted!', 'Drug deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting drug:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Drug deletion cancelled!', 'info');
      }
    });
  };

  const refreshDrugs = async () => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/drugs');
      setDrugs(response.data);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };

  return (
    <>
      <div className="admin-container">
        <div className="container">
          <DrugList drugs={drugs} onDrugClick={handleDrugClick} onDeleteDrug={handleDeleteDrug} />
          <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="custom-modal" overlayClassName="custom-overlay">
            {selectedDrug && editMode && (
              <div className="details">
                <h2 className="center bus">Edit Drug</h2>
                <div className="input-field">
                  <label>Drug Text:</label>
                  <input
                    type="text"
                    value={newDrugText}
                    onChange={(e) => setNewDrugText(e.target.value)}
                  />
                </div>
                <button className="update-button" onClick={handleUpdateDrug}>Update Drug</button>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default ManageDrugs;