import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function ServiceList({ services, onServiceClick, onDeleteService }) {
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
      <h2 className="bus">Services</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length > 0 ? (
              services.map((service) => (
                <tr key={service.id}>
                  <td>{service.service_name || 'No service name'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onServiceClick(service)} className="btngreen">
                        Edit
                      </button>
                      <button onClick={() => onDeleteService(service)} className="btndelete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No services found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Managecatpo14() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch services. Please try again.',
      });
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setNewServiceName(service.service_name);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Service name cannot be empty.',
      });
      return;
    }
    try {
      await axios.post('http://amrithaahospitals.visualplanetserver.in/services', {
        service_name: newServiceName,
      });
      await fetchServices();
      setModalIsOpen(false);
      setNewServiceName('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Service added successfully!',
      });
    } catch (error) {
      console.error('Error adding service:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to add service.',
      });
    }
  };

  const handleUpdateService = async () => {
    if (!newServiceName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Service name cannot be empty.',
      });
      return;
    }
    try {
      await axios.put(`http://amrithaahospitals.visualplanetserver.in/services/${selectedService.id}`, {
        service_name: newServiceName,
      });
      await fetchServices();
      setModalIsOpen(false);
      setNewServiceName('');
      setSelectedService(null);
      setEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Service updated successfully!',
      });
    } catch (error) {
      console.error('Error updating service:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update service.',
      });
    }
  };

  const handleDeleteService = async (service) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this service!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://amrithaahospitals.visualplanetserver.in/services/${service.id}`);
          await fetchServices();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Service deleted successfully!',
          });
        } catch (error) {
          console.error('Error deleting service:', error.response?.data?.message || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete service.',
          });
        }
      }
    });
  };

  const openAddModal = () => {
    setNewServiceName('');
    setEditMode(false);
    setModalIsOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="container">
        <ServiceList
          services={services}
          onServiceClick={handleServiceClick}
          onDeleteService={handleDeleteService}
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="custom-modal"
          overlayClassName="custom-overlay"
        >
          <div className="details">
            <h2 className="center bus">{editMode ? 'Edit Service' : 'Add Service'}</h2>
            <div className="input-field">
              <label>Service Name:</label>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Enter service name"
              />
            </div>
            <button
              className="update-button"
              onClick={editMode ? handleUpdateService : handleAddService}
            >
              {editMode ? 'Update Service' : 'Add Service'}
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

export default Managecatpo14;