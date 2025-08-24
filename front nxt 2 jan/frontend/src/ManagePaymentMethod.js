import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css'; // Reuse the same CSS
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function DoctorList({ doctors, onDoctorClick, onDeleteDoctor }) {
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
      <h2 className="bus">Payment Methods</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <tr key={doctor.payment_id}>
                  <td>{doctor.method || 'No Payment methods'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onDoctorClick(doctor)} className="btngreen">
                        Edit
                      </button>
                      <button onClick={() => onDeleteDoctor(doctor)} className="btndelete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No paymnet method found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function ManagePaymentMethod() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchDoctorEntries();
  }, []);

  const fetchDoctorEntries = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/get-paymentMethod');
      console.log(response)
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctor entries:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch doctor entries. Please try again.',
      });
    }
  };

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setNewDoctorName(doctor.method);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleAddDoctor = async () => {
    if (!newDoctorName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Name cannot be empty.',
      });
      return;
    }
    try {
      await axios.post('https://amrithaahospitals.visualplanetserver.in/doctors_names', {
        name: newDoctorName,
      });
      await fetchDoctorEntries();
      setModalIsOpen(false);
      setNewDoctorName('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Doctor entry added successfully!',
      });
    } catch (error) {
      console.error('Error adding doctor entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add doctor entry.',
      });
    }
  };

  const handleUpdateDoctor = async () => {
    if (!newDoctorName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Name cannot be empty.',
      });
      return;
    }
    try {
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/update-PaymentMethod/${selectedDoctor.payment_id}`, {
        method: newDoctorName,
      });
      await fetchDoctorEntries();
      setModalIsOpen(false);
      setNewDoctorName('');
      setSelectedDoctor(null);
      setEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Doctor entry updated successfully!',
      });
    } catch (error) {
      console.error('Error updating doctor entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update doctor entry.',
      });
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this doctor entry!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://amrithaahospitals.visualplanetserver.in/delete-paymentMethod/${doctor.payment_id}`);
          console.log(doctor.payment_id)
          await fetchDoctorEntries();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Doctor entry deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting doctor entry:', error.response?.data?.message || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete doctor entry.',
          });
        }
      }
    });
  };

  const openAddModal = () => {
    setNewDoctorName('');
    setEditMode(false);
    setModalIsOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="container">
        <DoctorList
          doctors={doctors}
          onDoctorClick={handleDoctorClick}
          onDeleteDoctor={handleDeleteDoctor}
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="custom-modal"
          overlayClassName="custom-overlay"
        >
          <div className="details">
            <h2 className="center bus">{editMode ? 'Edit Doctor' : 'Add Doctor'}</h2>
            <div className="input-field">
              <label>Name:</label>
              <input
                type="text"
                value={newDoctorName}
                onChange={(e) => setNewDoctorName(e.target.value)}
                placeholder="Enter doctor name"
              />
            </div>
            <button
              className="update-button"
              onClick={editMode ? handleUpdateDoctor : handleAddDoctor}
            >
              {editMode ? 'Update Doctor' : 'Add Doctor'}
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

export default ManagePaymentMethod;