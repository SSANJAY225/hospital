import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

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
      console.error('Error decoding token:', error);
      roll = null;
    }
  }

  useEffect(() => {
    const auth = localStorage.getItem('authToken');
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
      <h2 className="bus">Dental Treatments</h2>
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
                  <td>{treatment.treatment_name || 'No treatment name'}</td>
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

function Managecatpo13() {
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/dental');
        setTreatments(response.data); // Use the response data directly
      } catch (error) {
        console.error('Error fetching treatments:', error);
      }
    };
    fetchTreatments();
  }, []);

  const handleTreatmentClick = (treatment) => {
    setSelectedTreatment(treatment);
    setNewTreatmentName(treatment.treatment_name); // Use treatment_name instead of dental_text
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateTreatment = async () => {
    try {
      await axios.put(`http://localhost:5000/dental/${selectedTreatment.id}`, {
        treatment_name: newTreatmentName, // Backend expects dental_text in the payload
      });
      refreshTreatments();
      setModalIsOpen(false);
      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Treatment updated successfully!' });
    } catch (error) {
      console.error('Error updating treatment:', error);
      Swal.fire({ icon: 'error', title: 'Error!', text: 'Something went wrong!' });
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
          await axios.delete(`http://localhost:5000/dental/${treatment.id}`);
          refreshTreatments();
          Swal.fire('Deleted!', 'Treatment deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting treatment:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      }
    });
  };

  const refreshTreatments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/dental');
      setTreatments(response.data); // Use the response data directly
    } catch (error) {
      console.error('Error fetching treatments:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };

  return (
    <div className="admin-container">
      <div className="container">
        <TreatmentList treatments={treatments} onTreatmentClick={handleTreatmentClick} onDeleteTreatment={handleDeleteTreatment} />
        <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="custom-modal" overlayClassName="custom-overlay">
          {selectedTreatment && editMode && (
            <div className="details">
              <h2 className="center bus">Edit Treatment</h2>
              <div className="input-field">
                <label>Treatment Name:</label>
                <input type="text" value={newTreatmentName} onChange={(e) => setNewTreatmentName(e.target.value)} />
              </div>
              <button className="update-button" onClick={handleUpdateTreatment}>Update Treatment</button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default Managecatpo13;