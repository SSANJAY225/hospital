import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function ComplaintList({ complaints, onComplaintClick, onDeleteComplaint, openAddModal }) {
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
      <h2 className="bus">Complaints</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint, index) => (
              <tr key={index}>
                <td>{complaint.complaint_text || 'No complaint text'}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => onComplaintClick(complaint)} className="btngreen">Edit</button>
                    <button onClick={() => onDeleteComplaint(complaint)} className="btndelete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="add-button" onClick={openAddModal}>
        Add Complaint
      </button>
    </div>
  );
}

function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newComplaintText, setNewComplaintText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/complaints');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };
    fetchComplaints();
  }, []);

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setNewComplaintText(complaint.complaint_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateComplaint = async () => {
    try {
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/complaints/${selectedComplaint.id}`, {
        complaint_text: newComplaintText,
      });
      console.log('Complaint updated successfully');
      setSelectedComplaint(null);
      setNewComplaintText('');
      setEditMode(false);
      refreshComplaints();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Complaint updated successfully!',
      });
    } catch (error) {
      console.error('Error updating complaint:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteComplaint = async (complaint) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this complaint!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://amrithaahospitals.visualplanetserver.in/complaints/${complaint.id}`);
          console.log('Complaint deleted successfully');
          refreshComplaints();
          Swal.fire('Deleted!', 'Complaint deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting complaint:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Complaint deletion cancelled!', 'info');
      }
    });
  };

  const refreshComplaints = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };
  const openAddModal = () => {
    setNewComplaintText('');
    setEditMode(false);
    setModalIsOpen(true);
  }
  const handleAddComplaint = async () => {
    if (!newComplaintText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Examination name cannot be empty.',
      });
      return;
    }
    try {
      await axios.post('https://amrithaahospitals.visualplanetserver.in/addComplaints', {
        complaint: newComplaintText,
      });
      await refreshComplaints();
      setModalIsOpen(false);
      setNewComplaintText('');
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
      <div className='admin-container'>
        <div className="container">
          <ComplaintList complaints={complaints}
            onComplaintClick={handleComplaintClick}
            onDeleteComplaint={handleDeleteComplaint}
            openAddModal={openAddModal} />
          <Modal isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            className="custom-modal"
            overlayClassName="custom-overlay"
          >
            <div className="details">
              <h2 className="center bus">{editMode ? 'Edit Column' : 'Add Column'}</h2>
              <div className="input-field">
                <label>Column Name:</label>
                <input
                  type="text"
                  value={newComplaintText}
                  onChange={(e) => setNewComplaintText(e.target.value)}
                  placeholder="Enter column name"
                />
              </div>
              <button
                className="update-button"
                onClick={editMode ? handleUpdateComplaint : handleAddComplaint}
              >
                {editMode ? 'Update Column' : 'Add Column'}
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

export default ManageComplaints;