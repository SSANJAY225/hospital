import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import './AddPatient.css';

const

  AddPatientsadmin = () => {
    const [patient, setPatient] = useState({
      fullName: '',
      fathersName: '',
      age: '',
      gender: '',
      city: '',
      phoneNumber: '',
      appointmentDate: '',
      appointmentTime: '',
      services: [],
      patientType: '',
      id: '',
      roomNumber: '', // Add roomNumber to state
    });

    const [photo, setPhoto] = useState(null);
    const [cameraPhoto, setCameraPhoto] = useState(null);
    const [useCamera, setUseCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const [services, setServices] = useState([]);
    const [isNewPatient, setIsNewPatient] = useState(false);
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const auth = localStorage.getItem('authToken');
    const [searchParams] = useSearchParams();
    const [franchiseLocation, setFranchiesLocation] = useState('')
    const [optFranchiseLocation, setOptFranchiseLocation] = useState([])

    const today = new Date();
    const minDate = today.toISOString().split('T')[0];

    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/getservices');
        setServices(res.data);
        const loc = await axios.get("http://localhost:5000/adminlocations")
        setOptFranchiseLocation(loc.data)
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    const fetchVisitCount = async (phoneNumber) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/checkpatient/${phoneNumber}`);
        const visitCount = response.data.exists ? response.data.visitCount + 1 : 1;
        return visitCount;
      } catch (error) {
        console.error('Error fetching visit count:', error);
        return 1;
      }
    };

    const fetchPatientDetails = async (phoneNumber) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patient-details/${phoneNumber}`);
        const data = response.data;
        setIsNewPatient(false);
        setPatient((prev) => ({
          ...prev,
          fullName: data.fullName || '',
          fathersName: data.fathersName || '',
          age: data.age || '',
          gender: data.gender || '',
          city: data.city || '',
          patientType: data.patientType || '',
          services: data.services || [],
          roomNumber: data.roomNumber || '', // Include roomNumber
        }));
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setIsNewPatient(true);
          setPatient((prev) => ({
            ...prev,
            fullName: '',
            fathersName: '',
            age: '',
            gender: '',
            city: '',
            patientType: '',
            services: [],
            id: '',
            roomNumber: '', // Reset roomNumber
          }));
          setPhoto(null);
          setCameraPhoto(null);
        } else {
          console.error('Error fetching patient details:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch patient details. Please try again.',
          });
        }
      }
    };

    const generatePatientId = (fullName, age, gender, visitCount) => {
      const firstLetter = fullName.charAt(0).toUpperCase() || 'A';
      const ageStr = age || '00';
      const genderCode = gender ? (gender === 'Male' ? 'M' : 'F') : 'U';
      const baseId = `${firstLetter}${ageStr}${genderCode}${visitCount}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `${baseId}${randomNum}`;
    };

    useEffect(() => {
      if (!auth) {
        Swal.fire({
          icon: 'warning',
          title: 'Not Authenticated',
          text: 'Please log in to access this page.',
        });
        navigate('/');
      }
      fetchServices();

      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      };
    }, [auth, navigate, stream]);

    useEffect(() => {
      let timeoutId;
      if (patient.phoneNumber.length === 10) {
        timeoutId = setTimeout(() => {
          fetchPatientDetails(patient.phoneNumber);
          fetchVisitCount(patient.phoneNumber).then((visitCount) => {
            const newId = generatePatientId(patient.fullName, patient.age, patient.gender, visitCount);
            setPatient((prev) => ({ ...prev, id: newId }));
          });
        }, 500);
      } else {
        setIsNewPatient(false);
      }

      return () => clearTimeout(timeoutId);
    }, [patient.phoneNumber]);

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        setStream(mediaStream);
        setUseCamera(true);
        setPhoto(null);

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch((err) => {
              console.error('Error playing video:', err);
              Swal.fire({
                icon: 'error',
                title: 'Video Playback Error',
                text: 'Unable to play the camera feed. Please try again.',
              });
            });
          }
        }, 100);
      } catch (err) {
        console.error('Error accessing camera:', err);
        Swal.fire({
          icon: 'error',
          title: 'Camera Error',
          text: 'Unable to access the camera. Please allow camera permissions or ensure the back camera is available.',
        });
        setUseCamera(false);
      }
    };

    const capturePhoto = () => {
      if (!videoRef.current) {
        console.error('Video element not available');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Camera feed is not available. Please try again.',
        });
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        setCameraPhoto(blob);
        setUseCamera(false);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }, 'image/jpeg');
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setPatient((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
      const { value, checked } = e.target;
      setPatient((prevState) => ({
        ...prevState,
        services: checked
          ? [...prevState.services, value]
          : prevState.services.filter((service) => service !== value),
      }));
    };

    const handlePhotoChange = (e) => {
      setPhoto(e.target.files[0]);
      setCameraPhoto(null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const requiredFields = {
        fullName: 'Full Name',
        age: 'Age',
        gender: 'Gender',
        phoneNumber: 'Phone Number',
        appointmentDate: 'Appointment Date',
        appointmentTime: 'Appointment Time',
        patientType: 'Patient Type',
        id: 'Patient ID',
      };

      const missingFields = [];
      Object.keys(requiredFields).forEach((key) => {
        const value = patient[key];
        if (value === null || value === undefined || value === '') {
          missingFields.push(requiredFields[key]);
        }
      });

      if (!patient.services || patient.services.length === 0) {
        missingFields.push('Services');
      }

      // Validate roomNumber for Inpatient
      if (patient.patientType === 'Inpatient' && !patient.roomNumber) {
        missingFields.push('Room Number');
      }

      const selectedDate = new Date(patient.appointmentDate);
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      if (selectedDateOnly < todayDateOnly) {
        missingFields.push('Appointment Date (must be today or a future date)');
      }

      if (missingFields.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Missing or Invalid Fields',
          text: `The following fields are required or invalid: ${missingFields.join(', ')}. Please fill them in and try again.`,
        });
        return;
      }

      try {
        const checkResponse = await axios.get(`http://localhost:5000/api/checkpatient/${patient.phoneNumber}`);
        const isExistingPatient = checkResponse.data.exists;

        const selectedPhoto = cameraPhoto || photo;

        if (!isExistingPatient && !selectedPhoto) {
          Swal.fire({
            icon: 'error',
            title: 'Photo Required',
            text: 'Uploading a photo or capturing one with the camera is mandatory for first-time patients.',
          });
          return;
        }

        const formData = new FormData();
        Object.keys(patient).forEach((key) => {
          if (key === 'services' && Array.isArray(patient[key])) {
            patient[key].forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, patient[key]);
          }
        });

        if (franchiseLocation) {
          formData.append('franchiseLocation', franchiseLocation);
          console.log("submit",franchiseLocation)
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Missing Franchise Location',
            text: 'Franchise location is required.',
          });
          return;
        }

        if (selectedPhoto) {
          formData.append('photo', selectedPhoto, `photo.${cameraPhoto ? 'jpg' : selectedPhoto.name.split('.').pop()}`);
        }

        const response = await axios.post('http://localhost:5000/api/patients', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.message) {
          Swal.fire({
            icon: 'success',
            title: 'Appointment Booked!',
            text: 'The patient appointment has been successfully added.',
            confirmButtonText: 'OK',
          }).then(() => {
            window.location.reload();
          });
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again later.',
        });
      }
    };

    return (
      <div className="patient-registration-page">
        <section className="patient-registration-container">
          <header className="registration-form-header">
            <h2>Add New Patient</h2>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ whiteSpace: 'nowrap' }}>Franchise Location:</label>
                <select
                  className="input_AdminFollow"
                  value={franchiseLocation}
                  onChange={(e) => {
                    setFranchiesLocation(e.target.value);
                    console.log(e.target.value);
                  }}
                >
                  <option value="">Select Location</option>
                  {optFranchiseLocation.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

          </header>
          <form onSubmit={handleSubmit} className="patient-registration-form">
            <div className="registration-form-grid">
              <div className="registration-form-field">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={patient.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="registration-form-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={patient.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="registration-form-field">
                <label htmlFor="age">Age</label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={patient.age}
                  onChange={handleChange}
                />
              </div>

              <div className="registration-form-field">
                <label>Gender</label>
                <div className="registration-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={patient.gender === 'Male'}
                      onChange={handleChange}
                    /> Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={patient.gender === 'Female'}
                      onChange={handleChange}
                    /> Female
                  </label>
                </div>
              </div>

              <div className="registration-form-field">
                <label htmlFor="appointmentDate">Appointment Date</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={patient.appointmentDate}
                  onChange={handleChange}
                  min={minDate}
                />
              </div>

              <div className="registration-form-field">
                <label htmlFor="appointmentTime">Appointment Time</label>
                <input
                  type="time"
                  id="appointmentTime"
                  name="appointmentTime"
                  value={patient.appointmentTime}
                  onChange={handleChange}
                />
              </div>

              <div className="registration-form-field">
                <label htmlFor="patientType">Patient Type</label>
                <select
                  id="patientType"
                  name="patientType"
                  value={patient.patientType}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="Inpatient">Inpatient</option>
                  <option value="Outpatient">Outpatient</option>
                </select>
              </div>

              {patient.patientType === 'Inpatient' && (
                <div className="registration-form-field">
                  <label htmlFor="roomNumber">Room Number</label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={patient.roomNumber}
                    onChange={handleChange}
                    placeholder="Enter room number"
                  />
                </div>
              )}

              <div className="registration-form-field">
                <label>Photo</label>
                {!useCamera && !cameraPhoto && !photo && (
                  <div className="camera-controls">
                    <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} />
                    <button type="button" className="camera-button" onClick={startCamera}>
                      Use Camera
                    </button>
                  </div>
                )}
                {useCamera && (
                  <div className="camera-controls">
                    <video ref={videoRef} autoPlay playsInline />
                    <button type="button" className="camera-button" onClick={capturePhoto}>
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      className="camera-button secondary"
                      onClick={() => setUseCamera(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {(photo || cameraPhoto) && (
                  <div className="photo-preview-container">
                    <p>{cameraPhoto ? 'Photo captured from camera' : 'Photo uploaded'}</p>
                    <img
                      src={photo ? URL.createObjectURL(photo) : URL.createObjectURL(cameraPhoto)}
                      alt="Selected or Captured"
                      className="photo-preview"
                    />
                    <button
                      type="button"
                      className="camera-button secondary"
                      onClick={() => {
                        setPhoto(null);
                        setCameraPhoto(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="registration-form-field">
                <label htmlFor="id">Patient ID</label>
                <input type="text" id="id" name="id" value={patient.id} readOnly />
              </div>
            </div>

            <div className="registration-services-field">
              <label>Services</label>
              <div className="registration-checkbox-group">
                {services.map((service, index) => (
                  <label key={index}>
                    <input
                      type="checkbox"
                      value={service}
                      checked={patient.services.includes(service)}
                      onChange={handleCheckboxChange}
                    /> {service}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="registration-submit-btn">Book Appointment</button>
          </form>
        </section>
      </div>
    );
  };

export default AddPatientsadmin;