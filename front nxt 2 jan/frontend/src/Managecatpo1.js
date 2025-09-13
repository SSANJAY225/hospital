import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function VitalList({ columns, onColumnClick, onDeleteColumn, openAddModal }) {
  const navigate = useNavigate();
  let roll = null;
  const auth = localStorage.getItem('authToken');

  if (auth) {
    try {
      const decoded = jwtDecode(auth);
      roll = decoded.roll;
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
      <h2 className="bus">Vital Columns</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {columns.length > 0 ? (
              columns.map((column) => (
                <tr key={column}>
                  <td>{column}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onColumnClick(column)} className="btngreen">
                        Edit
                      </button>
                      <button onClick={() => onDeleteColumn(column)} className="btndelete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No columns found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <button className="add-button" onClick={openAddModal}>
        Add Column
      </button> */}
    </div>
  );
}

function ManageVitals() {
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/column-vitals');
      console.log('Fetched columns:', response.data); // Debug log
      setColumns(response.data);
    } catch (error) {
      console.error('Error fetching columns:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch columns. Please try again.',
      });
    }
  };

  const handleColumnClick = (column) => {
    setSelectedColumn(column);
    setNewColumnName(column);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Column name cannot be empty.',
      });
      return;
    }
    try {
      await axios.post('http://amrithaahospitals.visualplanetserver.in/addvitals', {
        vitals: newColumnName,
      });
      await fetchColumns();
      setModalIsOpen(false);
      setNewColumnName('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Column added successfully!',
      });
    } catch (error) {
      console.error('Error adding column:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add column.',
      });
    }
  };

  const handleUpdateColumn = async () => {
    if (!newColumnName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Column name cannot be empty.',
      });
      return;
    }
    try {
      await axios.put(`http://amrithaahospitals.visualplanetserver.in/editvitasl/${selectedColumn}`, {
        newName:newColumnName,
      });
      await fetchColumns();
      setModalIsOpen(false);
      setNewColumnName('');
      setSelectedColumn(null);
      setEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Column updated successfully!',
      });
    } catch (error) {
      console.error('Error updating column:', error.response?.data?.message || error.message);
      await fetchColumns();
      setModalIsOpen(false);
      setNewColumnName('');
      setSelectedColumn(null);
      setEditMode(false);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text:'Failed to update column.',
      });
    }
  };

  const handleDeleteColumn = async (column) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this column!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://amrithaahospitals.visualplanetserver.in/api/delete-column/${column}`);
          await fetchColumns();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Column deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting column:', error.response?.data?.message || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete column.',
          });
        }
      }
    });
  };

  const openAddModal = () => {
    setNewColumnName('');
    setEditMode(false);
    setModalIsOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="container">
        <VitalList
          columns={columns}
          onColumnClick={handleColumnClick}
          onDeleteColumn={handleDeleteColumn}
          openAddModal={openAddModal}
        />
        <Modal
          isOpen={modalIsOpen}
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
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
              />
            </div>
            <button
              className="update-button"
              onClick={editMode ? handleUpdateColumn : handleAddColumn}
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
  );
}

export default ManageVitals;