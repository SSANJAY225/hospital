import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function MembershipList({ memberships, onMembershipClick, onDeleteMembership }) {
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
      <h2 className="bus">Memberships</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Membership Type</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberships.length > 0 ? (
              memberships.map((membership) => (
                <tr key={membership.membership_type}>
                  <td>{membership.membership_type || 'No membership type'}</td>
                  <td>{membership.price !== null ? `₹${membership.price}` : 'No price'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onMembershipClick(membership)} className="btngreen">
                        Edit
                      </button>
                      <button onClick={() => onDeleteMembership(membership)} className="btndelete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No memberships found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function ManageMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [newMembershipType, setNewMembershipType] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchMembershipEntries();
  }, []);

  const fetchMembershipEntries = async () => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/memberships');
      setMemberships(response.data);
    } catch (error) {
      console.error('Error fetching membership entries:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch membership entries. Please try again.',
      });
    }
  };

  const handleMembershipClick = (membership) => {
    setSelectedMembership(membership);
    setNewMembershipType(membership.membership_type);
    setNewPrice(membership.price !== null ? membership.price.toString() : '');
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleAddMembership = async () => {
    if (!newMembershipType.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Membership type cannot be empty.',
      });
      return;
    }
    const priceValue = parseFloat(newPrice);
    if (newPrice && (isNaN(priceValue) || priceValue < 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Price must be a valid non-negative number.',
      });
      return;
    }
    try {
      await axios.post('http://amrithaahospitals.visualplanetserver.in/memberships', {
        membership_type: newMembershipType,
        price: newPrice ? priceValue : null,
      });
      await fetchMembershipEntries();
      setModalIsOpen(false);
      setNewMembershipType('');
      setNewPrice('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Membership entry added successfully!',
      });
    } catch (error) {
      console.error('Error adding membership entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add membership entry.',
      });
    }
  };

  const handleUpdateMembership = async () => {
    if (!newMembershipType.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Membership type cannot be empty.',
      });
      return;
    }
    const priceValue = parseFloat(newPrice);
    if (newPrice && (isNaN(priceValue) || priceValue < 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Price must be a valid non-negative number.',
      });
      return;
    }
    try {
      await axios.put(`http://amrithaahospitals.visualplanetserver.in/memberships/${selectedMembership.membership_type}`, {
        membership_type: newMembershipType,
        price: newPrice ? priceValue : null,
      });
      await fetchMembershipEntries();
      setModalIsOpen(false);
      setNewMembershipType('');
      setNewPrice('');
      setSelectedMembership(null);
      setEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Membership entry updated successfully!',
      });
    } catch (error) {
      console.error('Error updating membership entry:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update membership entry.',
      });
    }
  };

  const handleDeleteMembership = async (membership) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this membership entry!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://amrithaahospitals.visualplanetserver.in/memberships/${membership.membership_type}`);
          await fetchMembershipEntries();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Membership entry deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting membership entry:', error.response?.data?.message || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete membership entry.',
          });
        }
      }
    });
  };

  const openAddModal = () => {
    setNewMembershipType('');
    setNewPrice('');
    setEditMode(false);
    setModalIsOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="container">
        <MembershipList
          memberships={memberships}
          onMembershipClick={handleMembershipClick}
          onDeleteMembership={handleDeleteMembership}
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="custom-modal"
          overlayClassName="custom-overlay"
        >
          <div className="details">
            <h2 className="center bus">{editMode ? 'Edit Membership' : 'Add Membership'}</h2>
            <div className="input-field">
              <label>Membership Type:</label>
              <input
                type="text"
                value={newMembershipType}
                onChange={(e) => setNewMembershipType(e.target.value)}
                placeholder="Enter membership type"
              />
            </div>
            <div className="input-field">
              <label>Price:</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter price"
                step="0.01"
                min="0"
              />
            </div>
            <button
              className="update-button"
              onClick={editMode ? handleUpdateMembership : handleAddMembership}
            >
              {editMode ? 'Update Membership' : 'Add Membership'}
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

export default ManageMemberships;