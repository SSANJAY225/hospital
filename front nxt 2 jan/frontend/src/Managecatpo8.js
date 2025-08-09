import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// Component for displaying the list of timings
function TimingList({ timings, onTimingClick, onDeleteTiming }) {
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
      <h2 className="bus">Timing</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Timing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timings.length > 0 ? (
              timings.map((timing, index) => (
                <tr key={index}>
                  <td>{timing.timing_text || 'No timing text'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onTimingClick(timing)} className="btngreen">Edit</button>
                      <button onClick={() => onDeleteTiming(timing)} className="btndelete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No timings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main component for managing timings
function ManageTiming() {
  const [timings, setTimings] = useState([]);
  const [selectedTiming, setSelectedTiming] = useState(null);
  const [newTimingText, setNewTimingText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch all timings from the backend
  useEffect(() => {
    const fetchTimings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/timing');
        setTimings(response.data);
      } catch (error) {
        console.error('Error fetching timings:', error);
      }
    };
    fetchTimings();
  }, []);

  const handleTimingClick = (timing) => {
    setSelectedTiming(timing);
    setNewTimingText(timing.timing_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateTiming = async () => {
    try {
      await axios.put(`http://localhost:5000/timing/${selectedTiming.id}`, {
        timing_text: newTimingText,
      });
      console.log('Timing updated successfully');
      setSelectedTiming(null);
      setNewTimingText('');
      setEditMode(false);
      refreshTimings();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Timing updated successfully!',
      });
    } catch (error) {
      console.error('Error updating timing:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteTiming = async (timing) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this timing!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/timing/${timing.id}`);
          console.log('Timing deleted successfully');
          refreshTimings();
          Swal.fire('Deleted!', 'Timing deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting timing:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Timing deletion cancelled!', 'info');
      }
    });
  };

  const refreshTimings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/timing');
      setTimings(response.data);
    } catch (error) {
      console.error('Error fetching timings:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };

  return (
    <>
      <div className="admin-container">
        <div className="container">
          <TimingList timings={timings} onTimingClick={handleTimingClick} onDeleteTiming={handleDeleteTiming} />
          <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="custom-modal" overlayClassName="custom-overlay">
            {selectedTiming && editMode && (
              <div className="details">
                <h2 className="center bus">Edit Timing</h2>
                <div className="input-field">
                  <label>Timing Text:</label>
                  <input
                    type="text"
                    value={newTimingText}
                    onChange={(e) => setNewTimingText(e.target.value)}
                  />
                </div>
                <button className="update-button" onClick={handleUpdateTiming}>Update Timing</button>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default ManageTiming;