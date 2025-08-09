import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function NurseList({ nurses, onNurseClick, onDeleteNurse }) {
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
        text: 'Please log in to access this page.',
      });
      navigate('/');
    }
  }, [auth, role, navigate]);

  return (
    <div className="container-fluid">
      <h2 className="bus">Nurse Names</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nurses.length > 0 ? (
              nurses.map((nurse) => (
                <tr key={nurse.id}>
                  <td>{nurse.name || 'No nurse name'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onNurseClick(nurse)} className="btngreen">
                        Edit
                      </button>
                      <button onClick={() => onDeleteNurse(nurse)} className="btndelete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No nurses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManageNurseNames() {
  const [nurses, setNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [newNurseName, setNewNurseName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchNurseEntries();
  }, []);

  const fetchNurseEntries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nurses_name');
      setNurses(response.data);
    } catch (error) {
      console.error('Error fetching nurse entries:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch nurse entries. Please try again.',
      });
    }
  };

  const handleNurseClick = (nurse) => {
    setSelectedNurse(nurse);
    setNewNurseName(nurse.name);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleAddNurse = async () => {
    if (!newNurseName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Name cannot be empty.',
      });
      return;
    }
    try {
      await axios.post('http://localhost:5000/nurses_name', {
        name: newNurseName,
      });
      await fetchNurseEntries();
      setModalIsOpen(false);
      setNewNurseName('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Nurse entry added successfully!',
      });
    } catch (error) {
      console.error('Error adding nurse entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add nurse entry.',
      });
    }
  };

  const handleUpdateNurse = async () => {
    if (!newNurseName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Name cannot be empty.',
      });
      return;
    }
    try {
      await axios.put(`http://localhost:5000/nurses_name/${selectedNurse.id}`, {
        name: newNurseName,
      });
      await fetchNurseEntries();
      setModalIsOpen(false);
      setNewNurseName('');
      setSelectedNurse(null);
      setEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Nurse entry updated successfully!',
      });
    } catch (error) {
      console.error('Error updating nurse entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update nurse entry.',
      });
    }
  };

  const handleDeleteNurse = async (nurse) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this nurse entry!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/nurses_name/${nurse.id}`);
          await fetchNurseEntries();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Nurse entry deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting nurse entry:', error.response?.data?.message || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete nurse entry.',
          });
        }
      }
    });
  };

  const openAddModal = () => {
    setNewNurseName('');
    setEditMode(false);
    setModalIsOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="container">
        <NurseList
          nurses={nurses}
          onNurseClick={handleNurseClick}
          onDeleteNurse={handleDeleteNurse}
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="custom-modal"
          overlayClassName="custom-overlay"
        >
          <div className="details">
            <h2 className="center bus">{editMode ? 'Edit Nurse' : 'Add Nurse'}</h2>
            <div className="input-field">
              <label>Name:</label>
              <input
                type="text"
                value={newNurseName}
                onChange={(e) => setNewNurseName(e.target.value)}
                placeholder="Enter nurse name"
              />
            </div>
            <button
              className="update-button"
              onClick={editMode ? handleUpdateNurse : handleAddNurse}
            >
              {editMode ? 'Update Nurse' : 'Add Nurse'}
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

export default ManageNurseNames;