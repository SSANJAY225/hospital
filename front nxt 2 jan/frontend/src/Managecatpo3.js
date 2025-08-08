import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// Component for displaying the list of systematic examinations
function SysExaminationList({ sysExaminations, onSysExaminationClick, onDeleteSysExamination, openAddModal }) {
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
      <h2 className="bus">Systematic Examinations</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Systematic Examination</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sysExaminations.length > 0 ? (
              sysExaminations.map((sysExamination, index) => (
                <tr key={index}>
                  <td>{sysExamination.sysexam_text || 'No systematic examination text'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onSysExaminationClick(sysExamination)} className="btngreen">Edit</button>
                      <button onClick={() => onDeleteSysExamination(sysExamination)} className="btndelete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No systematic examinations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <button className="add-button" onClick={openAddModal}>
        Add Systamatic Examination
      </button> */}
    </div>
  );
}

// Main component for managing systematic examinations
function ManageSysExaminations() {
  const [sysExaminations, setSysExaminations] = useState([]);
  const [selectedSysExamination, setSelectedSysExamination] = useState(null);
  const [newSysExaminationText, setNewSysExaminationText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch all systematic examinations from the backend
  useEffect(() => {
    const fetchSysExaminations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/sysexaminations');
        setSysExaminations(response.data);
      } catch (error) {
        console.error('Error fetching systematic examinations:', error);
      }
    };
    fetchSysExaminations();
  }, []);

  const handleSysExaminationClick = (sysExamination) => {
    setSelectedSysExamination(sysExamination);
    setNewSysExaminationText(sysExamination.sysexam_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateSysExamination = async () => {
    try {
      await axios.put(`http://localhost:5000/sysexaminations/${selectedSysExamination.id}`, {
        sysexam_text: newSysExaminationText,
      });
      console.log('Systematic examination updated successfully');
      setSelectedSysExamination(null);
      setNewSysExaminationText('');
      setEditMode(false);
      refreshSysExaminations();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Systematic examination updated successfully!',
      });
    } catch (error) {
      console.error('Error updating systematic examination:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteSysExamination = async (sysExamination) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this systematic examination!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/sysexaminations/${sysExamination.id}`);
          console.log('Systematic examination deleted successfully');
          refreshSysExaminations();
          Swal.fire('Deleted!', 'Systematic examination deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting systematic examination:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Systematic examination deletion cancelled!', 'info');
      }
    });
  };

  const refreshSysExaminations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/sysexaminations');
      setSysExaminations(response.data);
    } catch (error) {
      console.error('Error fetching systematic examinations:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };
  const openAddModal = () => {
    setNewSysExaminationText('');
    setEditMode(false);
    setModalIsOpen(true);
  }
  return (
    <>
      <div className="admin-container">
        <div className="container">
          <SysExaminationList
            sysExaminations={sysExaminations}
            onSysExaminationClick={handleSysExaminationClick}
            onDeleteSysExamination={handleDeleteSysExamination}
            openAddModal={openAddModal}
          />
          <Modal isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            className="custom-modal"
            overlayClassName="custom-overlay">
            {selectedSysExamination && editMode && (
              <div className="details">
                <h2 className="center bus">Edit Systematic Examination</h2>
                <div className="input-field">
                  <label>Systematic Examination Text:</label>
                  <input
                    type="text"
                    value={newSysExaminationText}
                    onChange={(e) => setNewSysExaminationText(e.target.value)}
                  />
                </div>
                <button className="update-button" onClick={handleUpdateSysExamination}>Update Systematic Examination</button>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default ManageSysExaminations;