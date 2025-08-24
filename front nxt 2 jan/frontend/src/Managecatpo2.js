import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// Component for displaying the list of examinations
function ExaminationList({ examinations, onExaminationClick, onDeleteExamination, openAddModal }) {
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
      <h2 className="bus">Examinations</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Examination</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {examinations.length > 0 ? (
              examinations.map((examination, index) => (
                <tr key={index}>
                  <td>{examination.onexam_text || 'No examination text'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onExaminationClick(examination)} className="btngreen">Edit</button>
                      <button onClick={() => onDeleteExamination(examination)} className="btndelete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No examinations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <button className="add-button" onClick={openAddModal}>
        Add Examination
      </button> */}
    </div>
  );
}

// Main component for managing examinations
function ManageExaminations() {
  const [examinations, setExaminations] = useState([]);
  const [selectedExamination, setSelectedExamination] = useState(null);
  const [newExaminationText, setNewExaminationText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/examinations');
        setExaminations(response.data);
      } catch (error) {
        console.error('Error fetching examinations:', error);
      }
    };
    fetchExaminations();
  }, []);

  const handleExaminationClick = (examination) => {
    setSelectedExamination(examination);
    setNewExaminationText(examination.onexam_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateExamination = async () => {
    try {
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/examinations/${selectedExamination.id}`, {
        examination_text: newExaminationText,
      });
      console.log('Examination updated successfully');
      setSelectedExamination(null);
      setNewExaminationText('');
      setEditMode(false);
      refreshExaminations();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Examination updated successfully!',
      });
    } catch (error) {
      console.error('Error updating examination:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteExamination = async (examination) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this examination!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://amrithaahospitals.visualplanetserver.in/examinations/${examination.id}`);
          console.log('Examination deleted successfully');
          refreshExaminations();
          Swal.fire('Deleted!', 'Examination deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting examination:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Examination deletion cancelled!', 'info');
      }
    });
  };

  const refreshExaminations = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/examinations');
      setExaminations(response.data);
    } catch (error) {
      console.error('Error fetching examinations:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };
  const openAddModal = () => {
    setNewExaminationText('')
    setEditMode(false);
    setModalIsOpen(true);
  };
  const handleAddExamination = async() => {
    if (!newExaminationText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Examination name cannot be empty.',
      });
      return;
    }
    try {
      await axios.post('https://amrithaahospitals.visualplanetserver.in/addExamination', {
        examination: newExaminationText,
      });
      await refreshExaminations();
      setModalIsOpen(false);
      setNewExaminationText('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Examination added successfully!',
      });
    } catch (error) {
      console.error('Error adding column:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add column.',
      });
    }
  }
  return (
    <>
      <div className="admin-container">
        <div className="container">
          <ExaminationList
            examinations={examinations}
            onExaminationClick={handleExaminationClick}
            onDeleteExamination={handleDeleteExamination}
            openAddModal={openAddModal} />
          <Modal isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            className="custom-modal"
            overlayClassName="custom-overlay"
          >
            <div className="details">
              <h2 className="center bus">{editMode ? 'Edit Column' : 'Add Column'}</h2>
              <div className="input-field">
                <label>Examination Name:</label>
                <input
                  type="text"
                  value={newExaminationText}
                  onChange={(e) => setNewExaminationText(e.target.value)}
                  placeholder="Enter column name"
                />
              </div>
              <button
                className="update-button"
                onClick={editMode ? handleUpdateExamination : handleAddExamination}
              >
                {editMode ? 'Update Examination' : 'Add Examination'}
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
    </>
  );
}

export default ManageExaminations;