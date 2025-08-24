import React, { useState, useEffect, useRef } from 'react';
import './PatientsForm.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable'; // Import autotable for tables
import { jsPDF } from 'jspdf'; // Import jsPDF
import templateImage from './images/templatepre.jpg'; // Correct path for src/PatientsForm.js
const PatientForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = localStorage.getItem('authToken');

  // State for URL parameters
  const [urlParams, setUrlParams] = useState({
    locaationlogin: '',
    businessName: '',
    name: '',
    id: '',
    visited: ''
  });

  // State for form data
  const [majorComplaints, setMajorComplaints] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [birthHistory, setBirthHistory] = useState([]);
  const [surgicalHistory, setSurgicalHistory] = useState([]);
  const [otherHistory, setOtherHistory] = useState([]);
  const [followupdate, setfollowupdate] = useState('');
  const [advicegiven, setadvicegiven] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [dignosis, setdignosis] = useState('');
  const [local, setlocal] = useState('');
  const [vitals, setVitals] = useState({});
  const [vitalsinput, setvitalsinput] = useState({});
  const [onexamination, setOnExamination] = useState([]);
  const [onsystem, setOnSystem] = useState([]);
  const [availableTests, setavalableTests] = useState([]);
  const [selectavailableTests, setselectavailableTests] = useState({});
  const [selectonexamination, setselectonexamination] = useState({});
  const [selectsystematic, setselectsystematic] = useState({});
  const [prescription, setPrescription] = useState([]);
  const [treatment, settreatment] = useState([]);
  const [apidata, setapidata] = useState({});
  const [seonexam, setseonexam] = useState([]);
  const [sesysexam, setsesysexam] = useState([]);
  const [setsettotake, sesetesttotake] = useState([]);
  const [visitedCount, setVisitedCount] = useState(0);
  const [dental, setdental] = useState({
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "",
    11: "", 12: "", 13: "", 14: "", 15: "", 16: "", 17: "", 18: "", 19: "", 20: "",
    21: "", 22: "", 23: "", 24: "", 25: "", 26: "", 27: "", 28: "", 29: "", 30: "",
    31: "", 32: ""
  });

  // State for modal and image viewing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for file uploader
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  // State for collapsible sections
  const [isOpen, setIsOpen] = useState({
    vitals: true,
    history: true,
    major: true,
    file: true,
    localdiagnosis: true,
    examination: true,
    treatment: true,
    prescription: true,
    dental: true,
    follow: true,
  });

  // Check authentication
  useEffect(() => {
    if (!auth) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Authenticated',
        text: 'Please log in to access this page.',
      });
      navigate('/');
    }
  }, [auth, navigate]);

  // Utility to add one day to a date
  const addOneDay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  // Extract URL parameters
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      locaationlogin: searchParams.get('loginlocation'),
      businessName: searchParams.get('businessname'),
      name: searchParams.get('name'),
      id: searchParams.get('id'),
      visited: searchParams.get('visited'),
    };
  };

  const handleGeneratePrescription = () => {
    const doc = new jsPDF();

    // Add templatepre.jpg as background
    const img = new Image();
    img.src = templateImage;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 210, 297); // A4 size: 210mm x 297mm

      // Patient Details (exact positions from image)
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black text
      doc.text(`Name: ${urlParams.name || 'Puvan.v'}`, 13, 45); // Matches image position
      doc.text(`A/G: ${vitals.Age || '32'} Years / ${vitals.Gender || 'Male'}`, 60, 45);
      doc.text(`Patient ID: ${urlParams.id || 'ITK01'}`, 110, 45);
      doc.text(`Date: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, 150, 45); // Use current date

      doc.text(`Weight (kg): ${vitals.Weight || '90 kg'}`, 15, 55);
      doc.text(`Height (cms): ${vitals.Height || '182 cm'}`, 60, 55);
      doc.text(`BP: ${vitals.BP || '120/80 mmHg'}`, 110, 55);

      // Chief Complaint and Diagnosis (exact boxes and text)
      doc.rect(15, 60, 90, 30); // Chief Complaint box
      doc.text('Chief Complaint', 20, 70);
      doc.text(majorComplaints || 'Acidity (2 Days)', 20, 80);

      doc.rect(110, 60, 90, 30); // Diagnosis box
      doc.text('Diagnosis', 115, 70);
      doc.text(dignosis || 'Ulcer', 115, 80);

      // Prescription Table (dynamic from form input fields)
      const tableHeadings = ['Medicine', 'Dosage', 'Timing', 'Duration']; // Fetched from form headings
      const tableData = prescription.map(item => [
        item.medicine || 'N/A',
        item.dosage || 'N/A',
        item.timing || 'N/A',
        item.duration || 'N/A'
      ]) || [];

      autoTable(doc, {
        startY: 100, // Adjust based on image table position
        head: [tableHeadings],
        body: tableData,
        theme: 'grid',
        styles: { halign: 'center', cellPadding: 2, fontSize: 10 },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' }
        }
      });

      // Footer (exact match from image)
      // Save the PDF
      doc.save('prescription.pdf');
    };

    img.onerror = (error) => {
      console.error('Error loading background image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load the template image from src/images/templatepre.jpg.',
      });
    };
  };

  // Fetch user image
  const fetchImage = async (phoneNumber, visited) => {
    try {
      const response = await axios.get(`https://amrithaahospitals.visualplanetserver.in/api/user-photo`, {
        params: { phoneNumber, visited },
      });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Error fetching image:', error);
      setImageUrl(null);
    }
  };

  // Fetch vitals input fields
  const fetchvitalsinput = async () => {
    try {
      const response = await fetch('https://amrithaahospitals.visualplanetserver.in/column-vitals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      const filteredData = data.filter(col => col !== 'Name' && col !== 'Visit' && col !== 'Phone number');
      const vitalsObject = Object.fromEntries(filteredData.map(field => [field, '']));
      setvitalsinput(vitalsObject);
      setVitals(vitalsObject);
    } catch (error) {
      console.error('Error fetching vitals input:', error);
    }
  };

  // Fetch data from API
  const apifetchData = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/get-data', {
        params: {
          businessname: urlParams.businessName,
          name: urlParams.name,
          visited: urlParams.visited
        }
      });
      const data = response.data;
      setapidata(data);

      const visit = await axios.get('https://amrithaahospitals.visualplanetserver.in/get-visited', {
        params: {
          phone_number: urlParams.businessName,
          full_name: urlParams.name,
        },
      });
      setVisitedCount(visit.data);

      const res = await axios.get(`https://amrithaahospitals.visualplanetserver.in/getvitals/${urlParams.name}/${urlParams.visited}/${urlParams.businessName}`);
      setVitals(res.data[0] || {});

      if (data.patient?.length > 0) {
        const validPatient = data.patient.find(p => p.LocalExamination && p.Dignosis) || data.patient[0];
        setMajorComplaints(validPatient.Major_Complaints || '');
        setlocal(validPatient.LocalExamination || '');
        setdignosis(validPatient.Dignosis || '');
        setadvicegiven(validPatient.Advice_Given || '');
        if (validPatient.FollowUpDate) {
          const adjustedDate = addOneDay(validPatient.FollowUpDate);
          setfollowupdate(adjustedDate);
        } else {
          setfollowupdate('');
        }
      }

      if (data.dental) {
        setdental(data.dental);
      }

      setSurgicalHistory(data.surgicalhistory || []);
      setPrescription(data.prescriptionForm || []);
      setFamilyHistory(data.familyHistory || []);
      setBirthHistory(data.birthHistory || []);
      setOtherHistory(data.anyOtherHistory || []);
      settreatment(data.treatmentgivenform || []);
      setseonexam(data.onexamform || []);
      setsesysexam(data.sysexam_forms || []);
      sesetesttotake(data.testtotake || []);
      setselectonexamination(convertArrayToCheckboxState(data.onexamform));
      setselectsystematic(convertArrayToCheckboxState(data.sysexam_forms));
      setselectavailableTests(convertArrayToCheckboxState(data.testtotake));

      const fileResponse = await axios.get(`https://amrithaahospitals.visualplanetserver.in/files/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`);
      if (fileResponse.data.files) {
        setUploadedFiles(fileResponse.data.files);
      }

      const dentalResponse = await axios.get(`https://amrithaahospitals.visualplanetserver.in/getdental/${urlParams.name}/${urlParams.visited}/${urlParams.businessName}`);
      setdental(dentalResponse.data.result[0] || {});
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const convertArrayToCheckboxState = (array) => {
    if (!array || !Array.isArray(array)) return {};
    return array.reduce((acc, value) => {
      acc[value.toLowerCase().replace(/\s+/g, '')] = true;
      return acc;
    }, {});
  };

  useEffect(() => {
    setUrlParams(getUrlParams());
  }, [location]);

  useEffect(() => {
    if (urlParams.businessName && urlParams.visited) {
      fetchImage(urlParams.businessName, urlParams.visited);
      apifetchData();
    }
  }, [urlParams]);

  useEffect(() => {
    fetchvitalsinput();
    fetchData('https://amrithaahospitals.visualplanetserver.in/api/onexamination', setOnExamination);
    fetchData('https://amrithaahospitals.visualplanetserver.in/api/onsystem', setOnSystem);
    fetchData('https://amrithaahospitals.visualplanetserver.in/api/tests', setavalableTests);
  }, []);

  useEffect(() => {
    if (seonexam.length > 0) {
      const initialSelections = {};
      onexamination.forEach((field) => {
        const fieldKey = field.toLowerCase().replace(/\s+/g, "");
        initialSelections[fieldKey] = seonexam.includes(field);
      });
      setselectonexamination(initialSelections);
    }
  }, [onexamination, seonexam]);

  useEffect(() => {
    if (apidata?.patient?.length > 0) {
      setlocal(apidata.patient[0].LocalExamination || '');
      setdignosis(apidata.patient[0].Dignosis || '');
    }
  }, [apidata]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === uploadedFiles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? uploadedFiles.length - 1 : prevIndex - 1
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(0);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setUseCamera(true);
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
      const file = new File([blob], `captured-image-${multipleFiles.length + 1}.jpg`, { type: 'image/jpeg' });
      setMultipleFiles((prev) => [...prev, file]);
      setUseCamera(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }, 'image/jpeg');
  };

  const handleMultipleFilesChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setMultipleFiles((prev) => [...prev, ...filesArray]);
  };

  const removeFile = (index) => {
    setMultipleFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [stream]);

  const handleSubmit = async () => {
    const formData = {
      dignosis,
      vitals,
      majorComplaints,
      familyHistory,
      birthHistory,
      surgicalHistory,
      otherHistory,
      selectavailableTests,
      selectonexamination,
      selectsystematic,
      followupdate,
      advicegiven,
      treatment,
      prescription,
      local,
      ...urlParams
    };

    try {
      await axios.delete('https://amrithaahospitals.visualplanetserver.in/delete-records', {
        params: {
          businessname: urlParams.businessName,
          name: urlParams.name,
          visited: urlParams.visited
        },
      });

      await axios.delete(`https://amrithaahospitals.visualplanetserver.in/deletedental/${urlParams.name}/${urlParams.visited}/${urlParams.businessName}`);
      await axios.post(`https://amrithaahospitals.visualplanetserver.in/adddental/${urlParams.name}/${urlParams.visited}/${urlParams.businessName}`, dental);

      formData.vitals.Phone_number = urlParams.businessName;
      formData.vitals.Name = urlParams.name;
      formData.vitals.Visit = urlParams.visited;

      const replaceSpacesInKeys = (obj) => {
        return Object.keys(obj).reduce((acc, key) => {
          const newKey = key.replace(" ", "_");
          acc[newKey] = obj[key];
          return acc;
        }, {});
      };

      const updatedFormData = replaceSpacesInKeys(formData.vitals);
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/update-vitals/${urlParams.name}/${urlParams.visited}/${urlParams.businessName}`, updatedFormData);

      const response = await fetch('https://amrithaahospitals.visualplanetserver.in/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (multipleFiles.length > 0) {
        const fileData = new FormData();
        multipleFiles.forEach((file) => fileData.append('upload', file));

        try {
          const fileUploadResponse = await axios.post(
            `https://amrithaahospitals.visualplanetserver.in/upload/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`,
            fileData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );

          console.log("Uploaded Files:", fileUploadResponse.data.filePaths);
        } catch (fileError) {
          console.error('Error uploading multiple files:', fileError);
          Swal.fire({
            icon: 'error',
            title: 'File Upload Failed!',
            text: 'Error uploading multiple files. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      }

      const data = await response.json();
      console.log('Success:', data);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Patient data and files uploaded successfully.',
        confirmButtonText: 'OK',
      });

      const fileResponse = await axios.get(`https://amrithaahospitals.visualplanetserver.in/files/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`);
      if (fileResponse.data.files) {
        setUploadedFiles(fileResponse.data.files);
      }

      setMultipleFiles([]);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'An Error Occurred!',
        text: 'Something went wrong while saving the data. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitals((prevVitals) => ({ ...prevVitals, [name]: value }));
  };

  const handleDeleteHistory = (history, setHistory, item) => {
    setHistory(history.filter((entry) => entry !== item));
  };

  const handleAddTreatment = () => {
    const newTreatment = {
      treatmentdosage: document.querySelector('input[placeholder="Dosage"]').value,
      treatmentrout: document.querySelector('input[placeholder="Route of Administration"]').value
    };
    if (newTreatment.treatmentdosage && newTreatment.treatmentrout) {
      settreatment([...treatment, newTreatment]);
      document.querySelector('input[placeholder="Dosage"]').value = '';
      document.querySelector('input[placeholder="Route of Administration"]').value = '';
    }
  };

  const handleAddPrescription = () => {
    const newPrescription = {
      medicine: document.querySelector('input[placeholder="Medicine"]').value,
      dosage: document.querySelector('input[placeholder="Dosage"]').value,
      timing: document.querySelector('input[placeholder="Timing"]').value,
      duration: document.querySelector('input[placeholder="Duration"]').value
    };
    if (newPrescription.medicine && newPrescription.dosage && newPrescription.timing && newPrescription.duration) {
      setPrescription([...prescription, newPrescription]);
      document.querySelector('input[placeholder="Medicine"]').value = '';
      document.querySelector('input[placeholder="Dosage"]').value = '';
      document.querySelector('input[placeholder="Timing"]').value = '';
      document.querySelector('input[placeholder="Duration"]').value = '';
    }
  };

  const handleAddHistoryItem = (newHistoryItem, historyList, setHistoryList) => {
    if (!historyList.includes(newHistoryItem) && newHistoryItem.trim() !== '') {
      setHistoryList([...historyList, newHistoryItem]);
    }
  };

  const handleEditTreatment = (index) => {
    const item = treatment[index];
    handleDeleteHistory(treatment, settreatment, item);
  };

  const handleEditPrescription = (index) => {
    const item = prescription[index];
    handleDeleteHistory(prescription, setPrescription, item);
  };

  const fetchData = async (url, setData) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  const handlevisitedpage = (i) => {
    const username = urlParams.locaationlogin;
    const businessname = urlParams.businessName;
    const name = urlParams.name;
    navigate(`/visitedpage?loginlocation=${username}&businessname=${businessname}&name=${name}&visited=${i}`);
  };

  const TabButton = ({ visitedCount, handlevisitedpage }) => {
    return (
      <div className="tab-button-container">
        {Array.from({ length: visitedCount }, (_, i) => (
          <button
            onClick={() => handlevisitedpage(i + 1)}
            className={`custom-tab-button ${urlParams.visited == i + 1 ? 'active' : ''}`}
            key={i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  const handledental = (e, field) => {
    if (!e || !e.target) {
      console.error("Event is undefined or malformed");
      return;
    }
    setdental((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const toggleSection = (section) => {
    setIsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <div className="main">
        <div className="maincontent">
          <div className="scrollable-container">
            <div className="user-details-container">
              <div className="user-image">
                {imageUrl ? (
                  <div className="responsive-image-box">
                    <img src={imageUrl} alt="User" />
                  </div>
                ) : (
                  <div className="image-placeholder">Image</div>
                )}
              </div>
              <div className="user-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{urlParams.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Number:</span>
                  <span className="info-value">{urlParams.businessName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{urlParams.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Visited:</span>
                  <span className="info-value">{urlParams.visited}</span>
                </div>
              </div>
            </div>
            <TabButton visitedCount={visitedCount} handlevisitedpage={handlevisitedpage} />

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("vitals")}>
                <span className="section-toggle">{isOpen.vitals ? "-" : "+"}</span> Vitals
              </div>
              {isOpen.vitals && (
                <div className="vitals-container">
                  {vitals && Object.keys(vitals).length > 0 ? (
                    Object.keys(vitals).map((item, index) => (
                      <div className="vitals-column" key={index}>
                        <label>{item}</label>
                        <input
                          type="text"
                          name={item}
                          value={vitals[item] || ''}
                          onChange={handleVitalsChange}
                          className="responsive-input"
                        />
                      </div>
                    ))
                  ) : (
                    <p>No vitals data available</p>
                  )}
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("dental")}>
                <span className="section-toggle">{isOpen.dental ? "-" : "+"}</span> Dental
              </div>
              {isOpen.dental && (
                <div className="vitals-container">
                  {Object.keys(dental).map((field, index) => (
                    <div className="vitals-column" key={index}>
                      <label>Tooth {field}</label>
                      <input
                        type="text"
                        name={field}
                        value={dental[field]}
                        onChange={(e) => handledental(e, field)}
                        className="responsive-input"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("history")}>
                <span className="section-toggle">{isOpen.history ? "-" : "+"}</span> History
              </div>
              {isOpen.history && (
                <div className="vitals-container">
                  <div className="history-section">
                    <h5>Family History</h5>
                    <table className="responsive-table">
                      <tbody>
                        {familyHistory.map((item, index) => (
                          <tr key={index}>
                            <td>{item}</td>
                            <td>
                              <button
                                className="buttondred responsive-button"
                                onClick={() => handleDeleteHistory(familyHistory, setFamilyHistory, item)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <input
                      type="text"
                      placeholder="Add Family History"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddHistoryItem(e.target.value, familyHistory, setFamilyHistory);
                      }}
                      className="responsive-input"
                    />
                  </div>
                  <div className="history-section">
                    <h5>Birth History</h5>
                    <table className="responsive-table">
                      <tbody>
                        {birthHistory.map((item, index) => (
                          <tr key={index}>
                            <td>{item}</td>
                            <td>
                              <button
                                className="buttonred responsive-button"
                                onClick={() => handleDeleteHistory(birthHistory, setBirthHistory, item)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <input
                      type="text"
                      placeholder="Add Birth History"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddHistoryItem(e.target.value, birthHistory, setBirthHistory);
                      }}
                      className="responsive-input"
                    />
                  </div>
                  <div className="history-section">
                    <h5>Surgical History</h5>
                    <table className="responsive-table">
                      <tbody>
                        {surgicalHistory.map((item, index) => (
                          <tr key={index}>
                            <td>{item}</td>
                            <td>
                              <button
                                className="buttondelete responsive-button"
                                onClick={() => handleDeleteHistory(surgicalHistory, setSurgicalHistory, item)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <input
                      type="text"
                      placeholder="Add Surgical History"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddHistoryItem(e.target.value, surgicalHistory, setSurgicalHistory);
                      }}
                      className="responsive-input"
                    />
                  </div>
                  <div className="history-section">
                    <h5>Any Other History</h5>
                    <table className="responsive-table">
                      <tbody>
                        {otherHistory.map((item, index) => (
                          <tr key={index}>
                            <td>{item}</td>
                            <td>
                              <button
                                className="buttondelete responsive-button"
                                onClick={() => handleDeleteHistory(otherHistory, setOtherHistory, item)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <input
                      type="text"
                      placeholder="Add Other History"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddHistoryItem(e.target.value, otherHistory, setOtherHistory);
                      }}
                      className="responsive-input"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("major")}>
                <span className="section-toggle">{isOpen.major ? "-" : "+"}</span> Major Complaints
              </div>
              {isOpen.major && (
                <div className="vitals-container">
                  <div className="textarea-container">
                    <textarea
                      value={majorComplaints}
                      onChange={(e) => setMajorComplaints(e.target.value)}
                      placeholder="Type..."
                      className="responsive-textarea"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("examination")}>
                <span className="section-toggle">{isOpen.examination ? "-" : "+"}</span> Examination
              </div>
              {isOpen.examination && (
                <div className="vitals-container">
                  <div className="examination-section">
                    <h5>On Examination</h5>
                    {onexamination.map((field, index) => (
                      <div className="checkbox-item" key={index}>
                        <input
                          type="checkbox"
                          name={field.toLowerCase().replace(/\s+/g, '')}
                          checked={selectonexamination[field.toLowerCase().replace(/\s+/g, '')] || false}
                          onChange={(e) => {
                            const { name, checked } = e.target;
                            setselectonexamination((prev) => ({ ...prev, [name]: checked }));
                          }}
                        />
                        <label>{field}</label>
                      </div>
                    ))}
                  </div>
                  <div className="examination-section">
                    <h5>Systemic Examination</h5>
                    {onsystem.map((field, index) => (
                      <div className="checkbox-item" key={index}>
                        <input
                          type="checkbox"
                          name={field.toLowerCase().replace(/\s+/g, '')}
                          checked={selectsystematic[field.toLowerCase().replace(/\s+/g, '')] || false}
                          onChange={(e) => {
                            const { name, checked } = e.target;
                            setselectsystematic((prev) => ({ ...prev, [name]: checked }));
                          }}
                        />
                        <label>{field}</label>
                      </div>
                    ))}
                  </div>
                  <div className="examination-section">
                    <h5>Test to Take</h5>
                    {availableTests.map((field, index) => (
                      <div className="checkbox-item" key={index}>
                        <input
                          type="checkbox"
                          name={field.toLowerCase().replace(/\s+/g, '')}
                          checked={selectavailableTests[field.toLowerCase().replace(/\s+/g, '')] || false}
                          onChange={(e) => {
                            const { name, checked } = e.target;
                            setselectavailableTests((prev) => ({ ...prev, [name]: checked }));
                          }}
                        />
                        <label>{field}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("file")}>
                <span className="section-toggle">{isOpen.file ? "-" : "+"}</span> View Files
              </div>
              {isOpen.file && (
                <div className="vitals-container">
                  <div className="file-section">
                    <button
                      className="buttonblack responsive-button"
                      onClick={() => setIsModalOpen(true)}
                      disabled={uploadedFiles.length === 0}
                    >
                      View Files
                    </button>
                  </div>
                  <div className="file-upload-section">
                    {!useCamera && (
                      <div className="file-upload-controls">
                        <input
                          type="file"
                          multiple
                          onChange={handleMultipleFilesChange}
                          accept="image/*"
                          className="responsive-file-input"
                        />
                        <button
                          type="button"
                          onClick={startCamera}
                          className="buttonblack responsive-button"
                        >
                          Use Camera
                        </button>
                      </div>
                    )}
                    {useCamera && (
                      <div className="camera-section">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="responsive-video"
                        />
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="buttonblack responsive-button"
                        >
                          Capture Photo
                        </button>
                      </div>
                    )}
                  </div>
                  {multipleFiles.length > 0 && (
                    <div className="file-list-section">
                      <h3>Selected Files/Images:</h3>
                      <ul className="file-list">
                        {multipleFiles.map((file, index) => (
                          <li key={index} className="file-item">
                            <span>{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="remove-file-button"
                            >
                              Remove
                            </button>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="file-preview"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  {uploadedFiles.length > 0 ? (
                    <>
                      <div className="modal-file-name">
                        <p>{uploadedFiles[currentImageIndex].File_Name}</p>
                      </div>
                      <img
                        src={`https://amrithaahospitals.visualplanetserver.in/${uploadedFiles[currentImageIndex].FilePath}`}
                        alt={uploadedFiles[currentImageIndex].File_Name}
                        className="modal-image"
                        onError={(e) => {
                          console.error('Error loading image:', e.target.src);
                          e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', `https://amrithaahospitals.visualplanetserver.in/${uploadedFiles[currentImageIndex].FilePath}`)}
                      />
                    </>
                  ) : (
                    <p>No images available</p>
                  )}
                  <div className="modal-buttons">
                    <button
                      onClick={handlePrevImage}
                      disabled={uploadedFiles.length <= 1}
                      className="modal-button"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="modal-button close-button"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={uploadedFiles.length <= 1}
                      className="modal-button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("localdiagnosis")}>
                <span className="section-toggle">{isOpen.localdiagnosis ? "-" : "+"}</span> Local Examination and Diagnosis
              </div>
              {isOpen.localdiagnosis && (
                <div className="vitals-container">
                  <div className="vitals-column">
                    <label>Local Examination</label>
                    <textarea
                      placeholder="Type...."
                      value={local || ''}
                      onChange={(e) => setlocal(e.target.value)}
                      className="responsive-textarea"
                    />
                  </div>
                  <div className="vitals-column">
                    <label>Diagnosis</label>
                    <textarea
                      placeholder="Type"
                      value={dignosis || ''}
                      onChange={(e) => setdignosis(e.target.value)}
                      className="responsive-textarea"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("treatment")}>
                <span className="section-toggle">{isOpen.treatment ? "-" : "+"}</span> Treatment
              </div>
              {isOpen.treatment && (
                <div className="vitals-container">
                  <div className="treatment-section">
                    <h5>Treatment Given</h5>
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Dosage</th>
                          <th>Route of Administration</th>
                          <th>Delete</th>
                          <th>Edit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatment.map((item, index) => (
                          <tr key={index}>
                            <td data-title="Dosage">{item.treatmentdosage}</td>
                            <td data-title="Route of Administration">{item.treatmentrout}</td>
                            <td data-title="Delete">
                              <button
                                className="buttondelete responsive-button"
                                onClick={() => handleDeleteHistory(treatment, settreatment, item)}
                              >
                                Delete
                              </button>
                            </td>
                            <td data-title="Edit">
                              <button
                                className="buttongrey responsive-button"
                                onClick={() => handleEditTreatment(index)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td data-title="Dosage">
                            <input
                              type="text"
                              placeholder="Dosage"
                              className="responsive-input"
                            />
                          </td>
                          <td data-title="Route of Administration">
                            <input
                              type="text"
                              placeholder="Route of Administration"
                              className="responsive-input"
                            />
                          </td>
                          <td colSpan={2} data-title="Add">
                            <div className="button-wrapper">
                              <button
                                className="buttonblack responsive-button"
                                onClick={handleAddTreatment}
                              >
                                Add Treatment
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("prescription")}>
                <span className="section-toggle">{isOpen.prescription ? "-" : "+"}</span> Prescription
              </div>
              {isOpen.prescription && (
                <div className="vitals-container">
                  <div className="prescription-section">
                    <h5>Prescription</h5>
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Timing</th>
                          <th>Duration</th>
                          <th>Delete</th>
                          <th>Edit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.map((item, index) => (
                          <tr key={index}>
                            <td data-title="Medicine">{item.medicine}</td>
                            <td data-title="Dosage">{item.dosage}</td>
                            <td data-title="Timing">{item.timing}</td>
                            <td data-title="Duration">{item.duration}</td>
                            <td data-title="Delete">
                              <button
                                className="buttondelete responsive-button"
                                onClick={() => handleDeleteHistory(prescription, setPrescription, item)}
                              >
                                Delete
                              </button>
                            </td>
                            <td data-title="Edit">
                              <button
                                className="buttongrey responsive-button"
                                onClick={() => handleEditPrescription(index)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td data-title="Medicine">
                            <input
                              type="text"
                              placeholder="Medicine"
                              className="responsive-input"
                            />
                          </td>
                          <td data-title="Dosage">
                            <input
                              type="text"
                              placeholder="Dosage"
                              className="responsive-input"
                            />
                          </td>
                          <td data-title="Timing">
                            <input
                              type="text"
                              placeholder="Timing"
                              className="responsive-input"
                            />
                          </td>
                          <td data-title="Duration">
                            <input
                              type="text"
                              placeholder="Duration"
                              className="responsive-input"
                            />
                          </td>
                          <td colSpan={2} data-title="Add">
                            <div className="button-wrapper">
                              <button
                                className="buttonblack responsive-button"
                                onClick={handleAddPrescription}
                              >
                                Add Prescription
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="section-container">
              <div className="section-header" onClick={() => toggleSection("follow")}>
                <span className="section-toggle">{isOpen.follow ? "-" : "+"}</span> Follow Update
              </div>
              {isOpen.follow && (
                <div className="vitals-container">
                  <div className="vitals-column">
                    <label>Follow Up Date</label>
                    <input
                      type="date"
                      value={followupdate || ''}
                      onChange={(e) => setfollowupdate(e.target.value)}
                      className="responsive-input"
                    />
                  </div>
                  <div className="vitals-column">
                    <label>Advice Given</label>
                    <textarea
                      placeholder="Type..."
                      value={advicegiven || ''}
                      onChange={(e) => setadvicegiven(e.target.value)}
                      className="responsive-textarea"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="button-container">
            <button className="buttonblack responsive-button btn-save" onClick={handleSubmit}>Save</button>
<button
              className="buttongrey responsive-button btn-generate"
              onClick={handleGeneratePrescription} // Attach the handler here
            >
              Generate Prescription
            </button>            <button className="buttonred responsive-button btn-test">Test Report Requirement</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientForm;
