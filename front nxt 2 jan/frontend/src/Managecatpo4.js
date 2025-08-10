import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ManagerUsers.css';
import Modal from 'react-modal';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// Component for displaying the list of tests
function TestList({ tests, onTestClick, onDeleteTest }) {
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
      <h2 className="bus">Tests</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.length > 0 ? (
              tests.map((test, index) => (
                <tr key={index}>
                  <td>{test.tests_text || 'No test text'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onTestClick(test)} className="btngreen">Edit</button>
                      <button onClick={() => onDeleteTest(test)} className="btndelete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No tests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main component for managing tests
function ManageTests() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [newTestText, setNewTestText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch all tests from the backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/tests');
        setTests(response.data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };
    fetchTests();
  }, []);

  const handleTestClick = (test) => {
    setSelectedTest(test);
    setNewTestText(test.tests_text);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleUpdateTest = async () => {
    try {
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/tests/${selectedTest.id}`, {
        tests_text: newTestText,
      });
      console.log('Test updated successfully');
      setSelectedTest(null);
      setNewTestText('');
      setEditMode(false);
      refreshTests();
      setModalIsOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Test updated successfully!',
      });
    } catch (error) {
      console.error('Error updating test:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong!',
      });
    }
  };

  const handleDeleteTest = async (test) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this test!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://amrithaahospitals.visualplanetserver.in/tests/${test.id}`);
          console.log('Test deleted successfully');
          refreshTests();
          Swal.fire('Deleted!', 'Test deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting test:', error);
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      } else {
        Swal.fire('Cancelled', 'Test deletion cancelled!', 'info');
      }
    });
  };

  const refreshTests = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/tests');
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
      Swal.fire('Error!', 'Something went wrong!', 'error');
    }
  };

  return (
    <>
      <div className="admin-container">
        <div className="container">
          <TestList tests={tests} onTestClick={handleTestClick} onDeleteTest={handleDeleteTest} />
          <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="custom-modal" overlayClassName="custom-overlay">
            {selectedTest && editMode && (
              <div className="details">
                <h2 className="center bus">Edit Test</h2>
                <div className="input-field">
                  <label>Test Text:</label>
                  <input
                    type="text"
                    value={newTestText}
                    onChange={(e) => setNewTestText(e.target.value)}
                  />
                </div>
                <button className="update-button" onClick={handleUpdateTest}>Update Test</button>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}

export default ManageTests;