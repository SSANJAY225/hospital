import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './choosecatpo.css';
import { jwtDecode } from "jwt-decode";

function Choosecatpo() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const franchiselocation = searchParams.get('franchiselocation');

  const username = searchParams.get('loginlocation');
  const [file, setFile] = useState();
  const [sigfile, setSigFile] = useState();

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

  const handleUpload = () => {
    const formdata = new FormData();
    formdata.append('image', file);
    axios.post('http://localhost:8081/upload', formdata)
      .then(res => {
        if (res.data.Status === "Success") {
          Swal.fire({
            icon: 'success',
            title: 'Seal Changed',
            text: 'Seal has been changed successfully!',
          });
        } else {
          console.error("Failed");
        }
      })
      .catch(err => console.error(err));
  };

  const handleSigUpload = () => {
    const sigformdata = new FormData();
    sigformdata.append('image', sigfile);
    axios.post('http://localhost:8081/sigupload', sigformdata)
      .then(res => {
        if (res.data.Status === "Success") {
          Swal.fire({
            icon: 'success',
            title: 'Signature Changed',
            text: 'Signature has been changed successfully!',
          });
        } else {
          console.error("Failed");
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <div className='page-container'>
      <div className='card-container'>
        <div className='button-grid'>
          <Link to={`/managecatpo?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Complaints</Link>
          <Link to={`/managecatpo1?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Vitals</Link>
          <Link to={`/managecatpo2?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>On Examination</Link>
          <Link to={`/managecatpo3?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Systematic Examination</Link>
          <Link to={`/managecatpo4?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Tests</Link>
          <Link to={`/managecatpo5?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Treatment Given</Link>
          <Link to={`/managecatpo6?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Drugs</Link>
          <Link to={`/managecatpo7?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Dosage</Link>
          <Link to={`/managecatpo8?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Timing</Link>
          <Link to={`/managecatpo9?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Duration</Link>
          <Link to={`/managecatpo10?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Advice Given</Link>
          <Link to={`/managecatpo13?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Dental</Link>
          <Link to={`/Managecatpo14?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Services</Link>
          <Link to={`/Managecatpo15?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>ROA</Link>
          <Link to={`/ManageNurseNames?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Nurses</Link>
          <Link to={`/ManageDoctors?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Doctors</Link>
          <Link to={`/ManageMemberships?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Memberships</Link>
          <Link to={`/ManageLocation?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Location</Link>
          <Link to={`/ManagePaymentMethod?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='nav-button'>Paymnet Method</Link>
        </div>
      </div>
    </div>
  );
}

export default Choosecatpo;