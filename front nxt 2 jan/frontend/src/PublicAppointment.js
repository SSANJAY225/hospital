import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import './AddPatient.css';

const Pulicappoinment = () => {
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
    id: '', // Add id field to store the generated ID
  });

  const [photo, setPhoto] = useState(null); // For uploaded photo
  const [cameraPhoto, setCameraPhoto] = useState(null); // For camera-captured photo
  const [useCamera, setUseCamera] = useState(false); // Toggle camera UI
  const [stream, setStream] = useState(null); // Store the camera stream
  const [services, setServices] = useState([]);
  const videoRef = useRef(null); // Reference to video element
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      const res = await axios.get('https://amrithaahospitals.visualplanetserver.in/getservices');
      setServices(res.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Fetch the latest visit count to generate the ID
  const fetchVisitCount = async (phoneNumber) => {
    try {
      const response = await axios.get(`https://amrithaahospitals.visualplanetserver.in/api/checkpatient/${phoneNumber}`);
      const visitCount = response.data.exists ? response.data.visitCount + 1 : 1;
      return visitCount;
    } catch (error) {
      console.error('Error fetching visit count:', error);
      return 1; // Default to 1 if fetch fails
    }
  };

  // Generate ID based on fullName, age, gender, and visitCount
  const generatePatientId = (fullName, age, gender, visitCount) => {
    const firstLetter = fullName.charAt(0).toUpperCase() || 'A'; // First letter of full name
    const ageStr = age || '00'; // Default to '00' if age is empty
    const genderCode = gender ? (gender === 'Male' ? 'M' : 'F') : 'U'; // M for Male, F for Female, U for Unknown
    return `${firstLetter}${ageStr}${genderCode}${visitCount}`;
  };




  // Update ID when patient details change
  useEffect(() => {
    if (patient.phoneNumber) {
      fetchVisitCount(patient.phoneNumber).then((visitCount) => {
        const newId = generatePatientId(patient.fullName, patient.age, patient.gender, visitCount);
        setPatient((prev) => ({ ...prev, id: newId }));
      });
    }
    fetchServices();

  }, [patient.fullName, patient.age, patient.gender, patient.phoneNumber]);

  // Start camera stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        text: 'Unable to access the camera. Please allow camera permissions.',
      });
      setUseCamera(false);
    }
  };

  // Capture photo from camera
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
    setPatient({ ...patient, [name]: value });
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
    try {
      const checkResponse = await axios.get(`https://amrithaahospitals.visualplanetserver.in/api/checkpatient/${patient.phoneNumber}`);
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
        if (Array.isArray(patient[key])) {
          patient[key].forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, patient[key]);
        }
      });

      if (selectedPhoto) {
        formData.append('photo', selectedPhoto, `photo.${cameraPhoto ? 'jpg' : selectedPhoto.name.split('.').pop()}`);
      }

      const response = await axios.post('https://amrithaahospitals.visualplanetserver.in/api/patients', formData, {
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
    <div className="page">
      <section className="patient-form-wrapper page">
        <div className="form-container">
          <header className="form-header">
            <h2>Add New Patient</h2>
          </header>
          <form onSubmit={handleSubmit} className="patient-form">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" value={patient.fullName} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label htmlFor="age">Age</label>
                <input type="text" id="age" name="age" value={patient.age} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label>Gender</label>
                <div className="radio-group">
                  <label>
                    <input type="radio" name="gender" value="Male" checked={patient.gender === 'Male'} onChange={handleChange} /> Male
                  </label>
                  <label>
                    <input type="radio" name="gender" value="Female" checked={patient.gender === 'Female'} onChange={handleChange} /> Female
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input type="text" id="phoneNumber" name="phoneNumber" value={patient.phoneNumber} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label htmlFor="appointmentDate">Appointment Date</label>
                <input type="date" id="appointmentDate" name="appointmentDate" value={patient.appointmentDate} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label htmlFor="appointmentTime">Appointment Time</label>
                <input type="time" id="appointmentTime" name="appointmentTime" value={patient.appointmentTime} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label htmlFor="patientType">Patient Type</label>
                <select id="patientType" name="patientType" value={patient.patientType} onChange={handleChange}>
                  <option value="">Select Type</option>
                  <option value="Inpatient">Inpatient</option>
                  <option value="Outpatient">Outpatient</option>
                </select>
              </div>

              <div className="form-field">
                <label>Photo</label>
                {!useCamera && !cameraPhoto && !photo && (
                  <>
                    <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} />
                    <button type="button" onClick={startCamera}>Use Camera</button>
                  </>
                )}
                {useCamera && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', maxWidth: '300px', border: '1px solid #ccc', display: 'block' }}
                    />
                    <button type="button" onClick={capturePhoto}>Capture Photo</button>
                  </>
                )}
                {(photo || cameraPhoto) && (
                  <div>
                    <p>{cameraPhoto ? 'Photo captured from camera' : 'Photo uploaded'}</p>
                    <img
                      src={photo ? URL.createObjectURL(photo) : URL.createObjectURL(cameraPhoto)}
                      alt="Selected or Captured"
                      style={{ maxWidth: '200px', marginTop: '10px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setCameraPhoto(null);
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="id">Patient ID</label>
                <input type="text" id="id" name="id" value={patient.id} readOnly /> {/* Display only, read-only */}
              </div>
            </div>

            <div className="form-field services-field">
              <label>Services</label>
              <div className="checkbox-group">
                {services.map((service, index) => (
                  <label key={index}>
                    <input type="checkbox" value={service} onChange={handleCheckboxChange} /> {service}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="form-submit-btn">Book Appointment</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Pulicappoinment;