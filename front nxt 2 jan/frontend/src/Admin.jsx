import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams,useNavigate } from 'react-router-dom';
import './style/Admin.css';
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [patientCounts, setPatientCounts] = useState({
    inpatient_count: 0,
    outpatient_count: 0
  });

  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get('loginlocation');
  const franchiselocation = searchParams.get('franchiselocation');
  const token = localStorage.getItem("authToken");
  let roll = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      roll = decoded.roll;
    } catch (error) {
      console.error("Error decoding token:", error);
      roll = null;
    }
  }

  useEffect(() => {
    if (roll == null) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Authenticated',
        text: 'Please log in to access this page.',
      });
      navigate('/');
    }
  }, [roll, navigate]);

  useEffect(() => {
    const fetchPatientCounts = async () => {
      try {
        const inpatientResponse = await fetch(`http://localhost:5000/api/fetch-patients-in?franchiselocation=${franchiselocation}`);
        const inpatientData = await inpatientResponse.json();
        
        const outpatientResponse = await fetch(`http://localhost:5000/api/fetch-patients-out?franchiselocation=${franchiselocation}`);
        const outpatientData = await outpatientResponse.json();

        setPatientCounts({
          inpatient_count: inpatientData.length,
          outpatient_count: outpatientData.length
        });
      } catch (error) {
        console.error('Error fetching patient counts:', error);
      }
    };

    if (franchiselocation) {
      fetchPatientCounts();
    }
  }, [franchiselocation]);

  const handleLogout = () => {
    
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleBackup = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/backup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'backup.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Backup Successful',
        text: 'Backup file has been downloaded.',
      });
    } catch (error) {
      console.error('Backup error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Backup Failed',
        text: 'Could not create backup. Please try again.',
      });
    }
  };
  const { type } = useParams();
  return (
    <>
      <div className='admin-container2'>
        <div className='admin-panel'>
          <div className='admin-buttons'>
            {(roll === 'admin') && (
              <>
                <Link to={`/patients-followup/admin?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Patients</Link>
                <Link to={`/add?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Add</Link>
                <Link to={`/choosecatpo?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Manage</Link>
                <Link to={`/createuser?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Users</Link>
                <Link to={`/BillingHistory?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Billing History</Link>
                <button onClick={handleBackup} className='btn btn-dangergreen'>
                  Data Backup
                </button>
                <button onClick={handleLogout} className='btn btn-danger'>
                  Logout
                </button>
              </>
            )}
            {roll === 'reception' && (
              <>
                <Link to={`/AddPatient?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Patient's Appointment</Link>
                <Link to={`/ReceptionBillingFollowup?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Billing</Link>
                <Link to={`/BillingHistory?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Billing History</Link>

                <button onClick={handleLogout} className='btn btn-danger'>
                  Logout
                </button>
              </>
            )}
            {(roll === 'doctor\r\n' || roll === 'doctor') && (
              <>
                <Link to={`/patients-followup/in?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>
                  Appointments (InPatients) - {patientCounts.inpatient_count}
                </Link>
                <Link to={`/patients-followup/out?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>
                  Appointments (OutPatients) - {patientCounts.outpatient_count}
                </Link>
                <Link to={`/patients-followup/admin?loginlocation=${username}&franchiselocation=${franchiselocation}`} className='btn-default'>Patients</Link>
                <button onClick={handleLogout} className='btn btn-danger'>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;