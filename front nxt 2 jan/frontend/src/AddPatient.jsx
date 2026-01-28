import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import style from './style/AddPatient.module.css';
import { jwtDecode } from "jwt-decode";


const AddPatient = () => {
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
    patientOccupation: '',
    parentName: '',
    parentOccupation: '',
    referred:'',
    address:'',
  });
  const [newreceptionName, setNewreceptionName] = useState('');
  const [nurseSuggestions, setNurseSuggestions] = useState([]);
  const [receptionName, setReceptionName] = useState("")
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false)
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
  const franchiseLocation = searchParams.get('franchiselocation');
  const nurse_name = useState("")
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];


  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/getservices');
      setServices(res.data);
      const decode = jwtDecode(auth)
      const nurse = await axios.get(`http://localhost:5000/getnurse/${decode.frachiselocation}`);
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
      console.log(response)
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
        parentName: data.parent_name || '',
        patientOccupation: data.occupation || '',
        parentOccupation: data.parent_occupation || ''
      }));
      // const visitCount = await fetchVisitCount(phoneNumber);
      // const newId = generatePatientId(data.fullName, data.age, data.gender, visitCount);
      // setPatient((prev) => ({ ...prev, id: newId }));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setIsNewPatient(true);
        setPatient((prev) => ({
          ...prev,
          fullName: prev.fullName || '',
          fathersName: prev.fathersName || '',
          age: prev.age || '',
          gender: prev.gender || '',
          city: prev.city || '',
          patientType: prev.patientType || '',
          services: prev.services || [],
          id: '',        // allow ID to be regenerated
          roomNumber: prev.roomNumber || '', // Reset roomNumber
        }));
        setPhoto(null);
        setCameraPhoto(null);

        fetchVisitCount(phoneNumber).then((visitCount) => {
          const newId = generatePatientId('A', '00', 'U', visitCount);
          setPatient((prev) => ({ ...prev, id: newId }));
        })
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
    if (patient.phoneNumber.length === 10) {
      fetchPatientDetails(patient.phoneNumber);
      fetchVisitCount(patient.phoneNumber).then((visitCount) => {
        const newId = generatePatientId(
          patient.fullName || 'A',
          patient.age || '00',
          patient.gender || 'U',
          visitCount
        );
        setPatient((prev) => ({ ...prev, id: newId }));
      });
    }
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
      patientOccupation: 'Patient Occupation',
      parentName: ' Parent / Spouse Occupation',
      parentOccupation: 'Parent / Spouse Occupation',
      address:'Address',
      referred:'Referred  By'
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
      if (!receptionName || receptionName.trim() === '') {
        Swal.fire({
          icon: 'error',
          title: 'Receptionist Required',
          text: 'Please select or add a Receptionist name before submitting.',
        });
        return;
      } else {
        formData.append('receptionistName', receptionName)
      }
      if (franchiseLocation) {
        formData.append('franchiseLocation', franchiseLocation);
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
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
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
  const fetchNurseSuggestions = async () => {
    const req = await axios.get(`http://localhost:5000/reception?location=${franchiseLocation}`)
    setNurseSuggestions(req.data.map((itm)=>itm.name))
  }

  const handleAddreceptionName = async (name) => {
    if (name.trim() === '') return;
    if (!franchiseLocation) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Franchise location is missing. Please ensure it is provided in the URL.',
      });
      return;
    }
    try {
      await axios.post('http://localhost:5000/addreception', {
        reception: name,
        location: franchiseLocation // Include location from urlParams
      });
      setReceptionName(name);
      setIsNurseModalOpen(false);
      fetchNurseSuggestions(); // This should be fetchDoctorSuggestions
    } catch (error) {
      console.error('Error adding doctor name:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add doctor name.',
      });
    }
  };

  return (
    <div className={style.patient_registration_page}>
      <section className={style.patient_registration_container}>
        <header className={style.registration_form_header}>
          <h2>Add New Patient</h2>
          {franchiseLocation && <p>Franchise Location: {franchiseLocation}</p>}
          <div className={style.nurse}>
            <div onClick={() => {
              setIsNurseModalOpen(true);
              fetchNurseSuggestions();
            }}>
              <span className={style.section_toggle}></span> {receptionName ? `Receptionist - ${receptionName}` : 'Choose Receptionist Name'}
            </div>
            {isNurseModalOpen && (
              <div className={style.nurse_input_overlay}>
                <label>Select Receptionist Name</label>
                <div className={style.nurse_listbox}>
                  {nurseSuggestions === null ? (
                    <div className={style.nurse_listbox_item}>Loading Receptionist...</div>
                  ) : nurseSuggestions.length > 0 ? (
                    nurseSuggestions.map((doctor, index) => (
                      <div
                        key={index}
                        className={`nurse-listbox-item ${receptionName === doctor ? 'selected' : ''}`}
                        onClick={() => {
                          setReceptionName(doctor);
                          setIsNurseModalOpen(false);
                        }}
                      >
                        {doctor}
                      </div>
                    ))
                  ) : (
                    <div className={`${style.nurse_listbox_item} ${style.disabled}`}>
                      {franchiseLocation
                        ? `No Receptionist available for ${franchiseLocation}`
                        : 'No location specified'}
                    </div>
                  )}
                </div>
                <div className={style.inputbx}>
                  <label>Add New Receptionist</label>
                  <input
                    type="text"
                    value={newreceptionName}
                    onChange={(e) => setNewreceptionName(e.target.value)}
                    placeholder="Enter nurse name"
                    className={style.responsive_input}
                  />
                </div>
                <div className={style.modal_buttons}>
                  <button
                    className={`${style.buttonred} ${style.responsive_button}`}
                    onClick={() => {
                      if (newreceptionName) handleAddreceptionName(newreceptionName);
                      setNewreceptionName('');
                    }}
                  >
                    Add New Receptionist
                  </button>
                  <button
                    className={`${style.buttonblack} ${style.responsive_button}`}
                    onClick={() => {
                      setIsNurseModalOpen(false);
                      setNewreceptionName('');
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <form onSubmit={handleSubmit} className={style.patient_registration_form}>
          <div className={style.registration_form_grid}>
            <div className={style.registration_form_field}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={patient.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className={style.registration_form_field}>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={patient.fullName}
                onChange={handleChange}
              />
            </div>

            <div className={style.registration_form_field}>
              <label htmlFor="age">Age</label>
              <input
                type="text"
                id="age"
                name="age"
                value={patient.age}
                onChange={handleChange}
              />
            </div>
            <div className={style.registration_form_field}>
              <label htmlFor="PatientOccupation">Patient Occupation</label>
              <input
                type="text"
                id="patientOccupation"
                name="patientOccupation"
                value={patient.patientOccupation}
                onChange={handleChange}
              />
            </div>
            <div className={style.registration_form_field}>
              <label htmlFor="ParentName">Parent / Spouse Name</label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={patient.parentName}
                onChange={handleChange}
              />
            </div>
            <div className={style.registration_form_field}>
              <label htmlFor="ParentOccupation">Parent / Spouse Occupation</label>
              <input
                type="text"
                id="parentOccupation"
                name="parentOccupation"
                value={patient.parentOccupation}
                onChange={handleChange}
              />
            </div>

            <div className={style.registration_form_field}>
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

            <div className={style.registration_form_field}>
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

            <div className={style.registration_form_field}>
              <label htmlFor="appointmentTime">Appointment Time</label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={patient.appointmentTime}
                onChange={handleChange}
              />
            </div>

            <div className={style.registration_form_field}>
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
              <div className={style.registration_form_field}>
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

            <div className={style.registration_form_field}>
              <label>Photo</label>
              {!useCamera && !cameraPhoto && !photo && (
                <div className={style.camera_controls}>
                  <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} />
                  <button type="button" className={style.camera_button} onClick={startCamera}>
                    Use Camera
                  </button>
                </div>
              )}
              {useCamera && (
                <div className={style.camera_controls}>
                  <video ref={videoRef} autoPlay playsInline />
                  <button type="button" className={style.camera_button} onClick={capturePhoto}>
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    className={`${style.camera_button} ${secondary}`}
                    onClick={() => setUseCamera(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {(photo || cameraPhoto) && (
                <div className={style.photo_preview_container}>
                  <p>{cameraPhoto ? 'Photo captured from camera' : 'Photo uploaded'}</p>
                  <img
                    src={photo ? URL.createObjectURL(photo) : URL.createObjectURL(cameraPhoto)}
                    alt="Selected or Captured"
                    className={style.photo_preview}
                  />
                  <button
                    type="button"
                    className={`${style.camera_button} ${style.secondary}`}
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

            <div className={style.registration_form_field}>
              <label htmlFor="id">Patient ID</label>
              <input type="text" id="id" name="id" value={patient.id} readOnly />
            </div>
            <div className={style.registration_form_field}>
              <label> Referred By</label>
              <input
                type='text'
                id='referred'
                name='referred'
                value={patient.referred}
                onChange={handleChange}
              />
            </div>
            <div className={style.registration_form_field}>
              <label>Address</label>
              <textarea
                type='text'
                id='address'
                name='address'
                value={patient.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={style.registration_services_field}>
            <label>Services</label>
            <div className={style.registration_checkbox_group}>
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

          <button type="submit" className={style.registration_submit_btn}>Book Appointment</button>
        </form>
      </section>
    </div>
  );
};

export default AddPatient;