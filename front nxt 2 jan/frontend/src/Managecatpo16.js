import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function ROAList({ roaEntries, onROAClick, onDeleteROA }) {
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
      <h2 className="bus">ROA Entries</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roaEntries.length > 0 ? (
              roaEntries.map((roa) => (
                <tr key={roa.id}>
                  <td>{roa.name || 'No ROA name'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onROAClick(roa)} className="btngreen">
                        Edit
                      </button>
                      <button onClick={() => onDeleteROA(roa)} className="btndelete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No ROA entries found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Managecatpo15() {
  const [roaEntries, setROAEntries] = useState([]);
  const [selectedROA, setSelectedROA] = useState(null);
  const [newROAName, setNewROAName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchROAEntries();
  }, []);

  const fetchROAEntries = async () => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/roa');
      setROAEntries(response.data);
    } catch (error) {
      console.error('Error fetching ROA entries:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch ROA entries. Please try again.',
      });
    }
  };

  const handleROAClick = (roa) => {
    setSelectedROA(roa);
    setNewROAName(roa.name);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleAddROA = async () => {
    if (!newROAName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Name cannot be empty.',
      });
      return;
    }
    try {
      await axios.post('http://amrithaahospitals.visualplanetserver.in/roa', {
        name: newROAName,
      });
      await fetchROAEntries();
      setModalIsOpen(false);
      setNewROAName('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'ROA entry added successfully!',
      });
    } catch (error) {
      console.error('Error adding ROA entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add ROA entry.',
      });
    }
  };

  const handleUpdateROA = async () => {
    if (!newROAName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Name cannot be empty.',
      });
      return;
    }
    try {
      await axios.put(`http://amrithaahospitals.visualplanetserver.in/roa/${selectedROA.id}`, {
        name: newROAName,
      });
      await fetchROAEntries();
      setModalIsOpen(false);
      setNewROAName('');
      setSelectedROA(null);
      setEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'ROA entry updated successfully!',
      });
    } catch (error) {
      console.error('Error updating ROA entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update ROA entry.',
      });
    }
  };

  const handleDeleteROA = async (roa) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this ROA entry!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://amrithaahospitals.visualplanetserver.in/roa/${roa.id}`);
          await fetchROAEntries();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'ROA entry deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting ROA entry:', error.response?.data?.message || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete ROA entry.',
          });
        }
      }
    });
  };

  const openAddModal = () => {
    setNewROAName('');
    setEditMode(false);
    setModalIsOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="container">
        <ROAList
          roaEntries={roaEntries}
          onROAClick={handleROAClick}
          onDeleteROA={handleDeleteROA}
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="custom-modal"
          overlayClassName="custom-overlay"
        >
          <div className="details">
            <h2 className="center bus">{editMode ? 'Edit ROA' : 'Add ROA'}</h2>
            <div className="input-field">
              <label>Name:</label>
              <input
                type="text"
                value={newROAName}
                onChange={(e) => setNewROAName(e.target.value)}
                placeholder="Enter ROA name"
              />
            </div>
            <button
              className="update-button"
              onClick={editMode ? handleUpdateROA : handleAddROA}
            >
              {editMode ? 'Update ROA' : 'Add ROA'}
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

export default Managecatpo15;