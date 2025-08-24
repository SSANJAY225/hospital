import React, { useState, useEffect, useRef } from 'react';
import './Adminform.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import templateImage from './images/templatepre.jpg';
import letterpadImage from './images/Letterpad.jpg';

const AdminFormIn = () => {
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
  const fdiToSequentialMap = {
    18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
    21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
    38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
    48: 25, 47: 26, 46: 27, 45: 28, 44: 29, 43: 30, 42: 31, 41: 32,
  };

  const sequentialToFdiMap = Object.fromEntries(
    Object.entries(fdiToSequentialMap).map(([k, v]) => [v, k])
  );
  const conditionMap = {
    "Missing": "X",
    "Grossly Decayed": "G",
    "Root Stumps": "R.S",
    "Dental Caries": "D.C",
    "Filled": "F",
    "Impacted": "I",
    "Attrition": "A",
    "Abrasion": "Ab",
    "Erosion": "E",
    "Discolouration": "D",
    "Pocket Depth": "PD",
    "Furcation Involvement": "F.I",
    "Recession": "R",
    "Mobility": "M",
    "Malocclusion": "Malocclusion"
  };
  const location = useLocation();
  const [urlParams, setUrlParams] = useState({
    businessName: '',
    name: '',
    id: '',
    visited: '',
    nursename: '',
  });
  const [toothPositions, setToothPositions] = useState([]);
  const [majorComplaints, setMajorComplaints] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [birthHistory, setBirthHistory] = useState([]);
  const [surgicalHistory, setSurgicalHistory] = useState([]);
  const [otherHistory, setOtherHistory] = useState([]);
  const [followupdate, setfollowupdate] = useState('');
  const [advicegiven, setadvicegiven] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const dentalChartRef = useRef(null);
  const [nurseName, setNurseName] = useState('');
  const [nurseSuggestions, setNurseSuggestions] = useState([]);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [newNurseName, setNewNurseName] = useState('');
  const [treatmentgivennameSuggestions, settreatmentgivennameSuggestions] = useState([]);
  const [treatmentgivenname, settreatmentgivenname] = useState('');
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);

  useEffect(() => {
    fetchvitalsinput();
    setUrlParams(getUrlParams());
  }, [location]);

  const handleGeneratePrescription = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = templateImage;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 210, 297);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${urlParams.name || 'Puvan.v'}`, 13, 45);
      doc.text(`A/G: ${vitals.Age || '32'} Years / ${vitals.Gender || 'Male'}`, 60, 45);
      doc.text(`Patient ID: ${urlParams.id || 'ITK01'}`, 110, 45);
      doc.text(`Date: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, 150, 45);
      doc.text(`Weight (kg): ${vitals.Weight || '90 kg'}`, 15, 55);
      doc.text(`Height (cms): ${vitals.Height || '182 cm'}`, 60, 55);
      doc.text(`BP: ${vitals.BP || '120/80 mmHg'}`, 110, 55);
      doc.rect(15, 60, 90, 30);
      doc.text('Chief Complaint', 20, 70);
      doc.text(majorComplaints || 'Acidity (2 Days)', 20, 80);
      doc.rect(110, 60, 90, 30);
      doc.text('Diagnosis', 115, 70);
      doc.text(dignosis || 'Ulcer', 115, 80);
      const tableHeadings = ['Medicine', 'Dosage', 'Timing', 'Duration'];
      const tableData = prescription.map(item => [
        item.medicine || 'N/A',
        item.dosage || 'N/A',
        item.timing || 'N/A',
        item.duration || 'N/A'
      ]) || [];
      autoTable(doc, {
        startY: 100,
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
      const filename = `${urlParams.businessName}_${urlParams.id}_${urlParams.visited}.pdf`;
      doc.save(filename);
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

  const handleGenerateTestReport = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = letterpadImage;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 210, 297);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      const title = 'Test Report Requirement';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (210 - titleWidth) / 2, 70);
      const selectedTests = Object.keys(selectavailableTests)
        .filter((key) => selectavailableTests[key])
        .map((key) => {
          return (
            availableTests.find(
              (test) => test.toLowerCase().replace(/\s+/g, '') === key
            ) || key
          );
        });
      doc.setFontSize(12);
      let yPosition = 90;
      const pageWidth = 210;
      if (selectedTests.length > 0) {
        selectedTests.forEach((test) => {
          const bulletText = `• ${test}`;
          const textWidth = doc.getTextWidth(bulletText);
          const xPosition = (pageWidth - textWidth) / 2;
          doc.text(bulletText, xPosition, yPosition);
          yPosition += 10;
        });
      } else {
        const noTestsText = 'No tests selected.';
        const noTestsWidth = doc.getTextWidth(noTestsText);
        doc.text(noTestsText, (pageWidth - noTestsWidth) / 2, yPosition);
      }
      const filename = `${urlParams.businessName}_${urlParams.id}_${urlParams.visited}.pdf`;
      doc.save(filename);
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

  const handleImageLoad = () => {
    if (dentalChartRef.current) {
      const img = dentalChartRef.current.querySelector('.dental-chart-img');
      if (img && img.complete) {
        const width = img.width;
        const height = img.height;
        const positions = [
          { toothNumber: 18, top: 5, left: 10 },
          { toothNumber: 17, top: 10, left: 15 },
          { toothNumber: 16, top: 15, left: 20 },
          { toothNumber: 15, top: 20, left: 25 },
          { toothNumber: 14, top: 25, left: 30 },
          { toothNumber: 13, top: 30, left: 35 },
          { toothNumber: 12, top: 35, left: 40 },
          { toothNumber: 11, top: 40, left: 45 },
          { toothNumber: 21, top: 40, left: 55 },
          { toothNumber: 22, top: 35, left: 60 },
          { toothNumber: 23, top: 30, left: 65 },
          { toothNumber: 24, top: 25, left: 70 },
          { toothNumber: 25, top: 20, left: 75 },
          { toothNumber: 26, top: 15, left: 80 },
          { toothNumber: 27, top: 10, left: 85 },
          { toothNumber: 28, top: 5, left: 90 },
          { toothNumber: 48, top: 60, left: 10 },
          { toothNumber: 47, top: 65, left: 15 },
          { toothNumber: 46, top: 70, left: 20 },
          { toothNumber: 45, top: 75, left: 25 },
          { toothNumber: 44, top: 80, left: 30 },
          { toothNumber: 43, top: 85, left: 35 },
          { toothNumber: 42, top: 90, left: 40 },
          { toothNumber: 41, top: 95, left: 45 },
          { toothNumber: 31, top: 95, left: 55 },
          { toothNumber: 32, top: 90, left: 60 },
          { toothNumber: 33, top: 85, left: 65 },
          { toothNumber: 34, top: 80, left: 70 },
          { toothNumber: 35, top: 75, left: 75 },
          { toothNumber: 36, top: 70, left: 80 },
          { toothNumber: 37, top: 65, left: 85 },
          { toothNumber: 38, top: 60, left: 90 },
        ];
        setToothPositions(positions);
      }
    }
  };

  useEffect(() => {
    handleImageLoad();
    window.addEventListener('resize', handleImageLoad);
    return () => window.removeEventListener('resize', handleImageLoad);
  }, []);

  const [dental, setdental] = useState(
    Object.fromEntries(
      Object.keys(fdiToSequentialMap).map((key) => [key, ""])
    )
  );

  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const loginLocation = searchParams.get('loginlocation');
    const businessName = searchParams.get('businessname');
    const nursename = searchParams.get('nursename');
    const name = searchParams.get('name');
    const id = searchParams.get('id');
    const visited = searchParams.get('visited');
    const franchiselocation = searchParams.get('franchiselocation');

    return {
      loginLocation,
      businessName,
      name,
      id,
      visited,
      nursename,
      franchiselocation
    };
  };

  const [viewState, setViewState] = useState({
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

  const [isOpen, setIsOpen] = useState({
    vitals: false,
    history: false,
    major: false,
    file: false,
    localdiagnosis: false,
    examination: false,
    treatment: false,
    prescription: false,
    dental: false,
    follow: false,
  });

  const toggleSection = (section) => {
    setIsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    fetchvitalsinput();
    setUrlParams(getUrlParams());
  }, [location]);

  useEffect(() => {
    fetchvitalvalue();
  }, [location]);

  const [vitalsinput, setvitalsinput] = useState({});
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
    } catch (error) {
      console.error("Error fetching vitals:", error);
    }
  };

  useEffect(() => {
    if (urlParams.businessName && urlParams.visited) {
      fetchImage(urlParams.businessName, urlParams.visited);
    }
  }, [urlParams]);

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

  const [vitals, setVitals] = useState({});
  const [onexamination, setOnExamination] = useState([]);
  const [onsystem, setOnSystem] = useState([]);
  const [availableTests, setavalableTests] = useState([]);
  const [dosageSuggestions, setDosageSuggestions] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('');
  const [duration, setDuration] = useState('');
  const [dignosis, setdignosis] = useState('');
  const [treatment, settreatment] = useState([]);
  const [treatmentdosage, settreatmentdosage] = useState('');
  const [treatmentrout, settreatmentrout] = useState('');
  const [local, setlocal] = useState('');
  const [selectavailableTests, setselectavailableTests] = useState({});
  const [selectonexamination, setselectonexamination] = useState({});
  const [selectsystematic, setselectsystematic] = useState({});
  const [complaintsSuggestions, setcomplaintsSuggestions] = useState([]);
  const [vitalsSuggestions, setvitalsSuggestions] = useState([]);
  const [tratmentgivenSuggestions, settratmentgivenSuggestions] = useState([]);
  const [timingSuggestions, settimingSuggestions] = useState([]);
  const [durationsuggestions, setdurationsuggestions] = useState([]);
  const [advicegivenSuggestions, setadvicegivenSuggestions] = useState([]);
  const [dentalSuggestions, setdentalSuggestions] = useState([]);
  const [Prescriptiondosagesuggestion, setPrescriptiondosagesuggestion] = useState([]);
  const [RoaSuggestion, setRoaSuggestion] = useState([]);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [dentalOptions, setDentalOptions] = useState([]);

  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera
      });
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
        text: 'Unable to access the back camera. Please ensure camera permissions are granted and try again.',
      });
      setUseCamera(false);
    }
  };

  const fetchNurseSuggestions = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/doctor-suggestions');
      setNurseSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching doctor suggestions:', error);
      setNurseSuggestions([]);
    }
  };

  const handleAddNurseName = async (name) => {
    if (name.trim() === '') return;
    try {
      await axios.post('https://amrithaahospitals.visualplanetserver.in/addDoctorName', { doctorName: name });
      setDoctorName(name);
      setIsNurseModalOpen(false);
      fetchNurseSuggestions();
    } catch (error) {
      console.error('Error adding doctor name:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add doctor name.',
      });
    }
  };

  const handleNurseSelect = (name) => {
    setDoctorName(name);
    setIsNurseModalOpen(false);
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

  const fetchDentalOptions = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/dental-suggestions');
      setDentalOptions(response.data);
    } catch (error) {
      console.error('Error fetching dental options:', error);
      setDentalOptions([]);
    }
  };

  useEffect(() => {
    fetchDentalOptions();
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [stream]);

  const handleSubmit = async () => {
    const urlParams = getUrlParams();
    const formData = new FormData();
    formData.append("dignosis", dignosis);
    formData.append("majorComplaints", majorComplaints);
    formData.append("followupdate", followupdate);
    formData.append("advicegiven", advicegiven);
    formData.append("local", local);
    formData.append("name", urlParams.name);
    formData.append("businessName", urlParams.businessName);
    formData.append("visited", urlParams.visited || 0);
    formData.append("doctorName", doctorName);
    formData.append("currentdate", getCurrentDate())
    Object.entries(vitals).forEach(([key, value]) => {
      formData.append(`vitals[${key}]`, value);
    });
    Object.entries(selectavailableTests).forEach(([key, value]) => {
      if (value) formData.append("selectavailableTests[]", key);
    });
    Object.entries(selectonexamination).forEach(([key, value]) => {
      if (value) formData.append("selectonexamination[]", key);
    });
    Object.entries(selectsystematic).forEach(([key, value]) => {
      if (value) formData.append("selectsystematic[]", key);
    });
    familyHistory.forEach((item) => formData.append("familyHistory[]", item));
    birthHistory.forEach((item) => formData.append("birthHistory[]", item));
    surgicalHistory.forEach((item) => formData.append("surgicalHistory[]", item));
    otherHistory.forEach((item) => formData.append("otherHistory[]", item));
    treatment.forEach((t, index) => {
      formData.append(`treatment[${index}][treatmentgivenname]`, t.treatmentgivenname);
      formData.append(`treatment[${index}][treatmentdosage]`, t.treatmentdosage);
      formData.append(`treatment[${index}][treatmentrout]`, t.treatmentrout);
    });
    prescription.forEach((p, index) => {
      formData.append(`prescription[${index}][medicine]`, p.medicine);
      formData.append(`prescription[${index}][dosage]`, p.dosage);
      formData.append(`prescription[${index}][timing]`, p.timing);
      formData.append(`prescription[${index}][duration]`, p.duration);
    });
    console.log("formdata ttt->", vitals)
    console.log("Testtotake->", selectavailableTests)
    try {
      // Save general form data
      const response = await fetch("https://amrithaahospitals.visualplanetserver.in/save-data", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Form data response:", data);

      // Save dental data
      // Save dental data
      const hasDentalData = Object.values(dental).some(value => value !== "");
      if (hasDentalData) {
        const encodedName = encodeURIComponent(urlParams.name);
        const encodedVisit = encodeURIComponent(urlParams.visited);
        const encodedPhone = encodeURIComponent(urlParams.businessName);
        const dentalSequentialArray = Array.from({ length: 32 }, (_, i) => {
          const toothIndex = i + 1;
          const fdiTooth = sequentialToFdiMap[toothIndex];
          return dental[fdiTooth] || null;
        });
        const dentalData = { dental: JSON.stringify(Object.fromEntries(dentalSequentialArray.map((value, i) => [i + 1, value]))) };
        console.log("Sending dental data:", {
          url: `https://amrithaahospitals.visualplanetserver.in/adddental/${encodedName}/${encodedVisit}/${encodedPhone}`,
          body: dental
        });
        // console.log(dental)
        // const den = await axios.post(
        //   `https://amrithaahospitals.visualplanetserver.in/adddental/${encodedName}/${encodedVisit}/${encodedPhone}`,
        //   dental
        // );
        // console.log("Dental data response:", den.data);
        const d = await axios.post('https://amrithaahospitals.visualplanetserver.in/add-dental', { encodedName, encodedPhone, encodedVisit, dental })
        console.log(d)
      }

      // Upload files
      const fileData = new FormData();
      multipleFiles.forEach((file) => fileData.append("upload", file));
      if (multipleFiles.length > 0) {
        const fileUploadResponse = await axios.post(
          `https://amrithaahospitals.visualplanetserver.in/upload/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`,
          fileData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        console.log("Uploaded Files:", fileUploadResponse.data.filePaths);
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Patient data and files uploaded successfully.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      Swal.fire({
        icon: "error",
        title: "An Error Occurred!",
        text: "Something went wrong while saving the data. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSendToBill = async () => {
    const urlParams = getUrlParams();
    try {
      const response = await axios.post('https://amrithaahospitals.visualplanetserver.in/update-status', {
        name: urlParams.name,
        businessName: urlParams.businessName,
        visited: urlParams.visited || 0,
        status: 'readytobill'
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Patient status updated to doctorcompleted.',
        confirmButtonText: 'OK',
      });
      navigate(`/PatientsFollowUpOut?loginlocation=${urlParams.loginLocation}&franchiselocation=${urlParams.franchiselocation}`, {
        replace: true,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update patient status.',
        confirmButtonText: 'OK',
      });
    }
  };

  const fetchDoctorSuggestions = async (term) => {
    if (term.length > 0) {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/doctor-suggestions', {
          params: { term }
        });
        setDoctorSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching doctor suggestions:', error);
        setDoctorSuggestions([]);
      }
    } else {
      setDoctorSuggestions([]);
    }
  };

  const handleDoctorNameChange = (e) => {
    const value = e.target.value;
    setDoctorName(value);
    if (value.length > 0) {
      fetchDoctorSuggestions(value);
    } else {
      setDoctorSuggestions([]);
    }
  };

  const handleDeleteHistory = (history, setHistory, item) => {
    setHistory(history.filter((entry) => entry !== item));
  };

  const handleAddTreatment = () => {
    if (treatmentgivenname && treatmentdosage && treatmentrout) {
      settreatment([...treatment, { treatmentgivenname, treatmentdosage, treatmentrout }]);
      settreatmentgivenname('');
      settreatmentdosage('');
      settreatmentrout('');
      settreatmentgivennameSuggestions([]);
      setDosageSuggestions([]);
      setRoaSuggestion([]);
    }
  };

  const handleAddPrescription = () => {
    if (medicine && dosage && timing && duration) {
      setPrescription([...prescription, { medicine, dosage, timing, duration }]);
      setMedicine('');
      setDosage('');
      setTiming('');
      setDuration('');
      setMedicineSuggestions([]);
      setPrescriptiondosagesuggestion([]);
      settimingSuggestions([]);
      setdurationsuggestions([]);
    }
  };

  const handleAddHistoryItem = (newHistoryItem, historyList, setHistoryList) => {
    if (!historyList.includes(newHistoryItem) && newHistoryItem.trim() !== '') {
      setHistoryList([...historyList, newHistoryItem]);
    }
  };

  const handleEditTreatment = (index) => {
    const item = treatment[index];
    settreatmentgivenname(item.treatmentgivenname);
    settreatmentdosage(item.treatmentdosage);
    settreatmentrout(item.treatmentrout);
    handleDeleteHistory(treatment, settreatment, item);
  };

  const fetchSuggestions = async (value, apiUrl, setSuggestionState) => {
    try {
      if (value.length > 0) {
        const response = await axios.get(apiUrl, {
          params: { term: value },
        });
        console.log(`Suggestions from ${apiUrl}:`, response.data);
        if (response.data && Array.isArray(response.data)) {
          setSuggestionState(response.data);
        } else {
          console.error('Invalid response format from', apiUrl);
          setSuggestionState([]);
        }
      } else {
        setSuggestionState([]);
      }
    } catch (error) {
      console.error(`Error fetching suggestions from ${apiUrl}:`, error);
      setSuggestionState([]);
    }
  };

  const handleDosageChange = (e) => {
    const value = e.target.value;
    settreatmentdosage(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/dosage-suggestions', setDosageSuggestions);
  };

  const handleroa = (e) => {
    const value = e.target.value;
    settreatmentrout(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/roa-suggestions', setRoaSuggestion);
  };

  const handlePriscriptionDosageChange = (e) => {
    const value = e.target.value;
    setDosage(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/dosage-suggestions', setPrescriptiondosagesuggestion);
  };

  const handleTiming = (e) => {
    const value = e.target.value;
    setTiming(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/timing-suggestions', settimingSuggestions);
  };

  const handleDuration = (e) => {
    const value = e.target.value;
    setDuration(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/duration-suggestions', setdurationsuggestions);
  };

  const handleAdvicegiven = (e) => {
    const value = e.target.value;
    setadvicegiven(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/advicegiven-suggestions', setadvicegivenSuggestions);
  };

  const handleEditPrescription = (index) => {
    const item = prescription[index];
    setMedicine(item.medicine);
    setDosage(item.dosage);
    setTiming(item.timing);
    setDuration(item.duration);
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

  useEffect(() => {
    fetchData('https://amrithaahospitals.visualplanetserver.in/api/onexamination', setOnExamination);
    fetchData('https://amrithaahospitals.visualplanetserver.in/api/onsystem', setOnSystem);
    fetchData('https://amrithaahospitals.visualplanetserver.in/api/tests', setavalableTests);
  }, []);

  useEffect(() => {
  console.log("vital=>", vitals);
}, [vitals]);
  const fetchvitalvalue = async () => {
    try {
      const search = new URLSearchParams(location.search);
      const res = await axios.get(`https://amrithaahospitals.visualplanetserver.in/getvitals/${search.get("name")}/${search.get("visited")}/${search.get("businessname")}`);
      const vit = await axios.get(`https://amrithaahospitals.visualplanetserver.in/column-vitals`)
      const vitaldata = {}
      vit.data.forEach((itm) => {
        vitaldata[itm] = " ";
        // setVitals(vitaldata) // Assign empty string or any default value
      })
      console.log(vitaldata);
      if (res.data.length>=0 ) {
        setVitals(res.data[0] || vitaldata);
        console.log("if data",vitaldata)
      }
      
      const maj = await axios.get(`https://amrithaahospitals.visualplanetserver.in/get-major/${search.get("name")}/${search.get("visited")}/${search.get("businessname")}`);
      setMajorComplaints(maj.data[0]?.Major_Complaints || "");
    } catch (error) {
      console.error("Error fetching vital values:", error);
    }
  };

  useEffect(() => {
    fetchvitalvalue();
  }, [location]);

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitals((prevVitals) => ({ ...prevVitals, [name]: value }));
  };

  const handleTreatmentNameChange = (e) => {
    const value = e.target.value;
    settreatmentgivenname(value);
    console.log('Treatment name input:', value);
    fetchSuggestions(
      value,
      'https://amrithaahospitals.visualplanetserver.in/api/treatment-name-suggestions',
      settreatmentgivennameSuggestions
    );
  };

  const handleMedicineChange = (e) => {
    const value = e.target.value;
    setMedicine(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/drugs-suggestions', setMedicineSuggestions);
  };

  const handleMultipleFilesChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setMultipleFiles((prev) => [...prev, ...filesArray]);
  };

  const removeFile = (index) => {
    setMultipleFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handledental = (value, toothNumber) => {
    setdental((prev) => ({
      ...prev,
      [toothNumber]: value,
    }));
    setSelectedTooth(null);
    console.log(dental)
  };

  const SuggestionList = ({ suggestions, onSuggestionClick }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="suggestions-dropdown">
        <ul>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    );
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
                <div className="info-row">
                  <span className="info-label">Nurse:</span>
                  <span className="info-value">
                    {urlParams.nursename ? urlParams.nursename : "Not Checked by any nurse"}
                  </span>
                </div>
              </div>
            </div>
            <div className="section-container">
              <div className="section-header" onClick={() => {
                setIsNurseModalOpen(true);
                fetchNurseSuggestions();
              }}>
                <span className="section-toggle">+</span> {doctorName ? `Doctor - ${doctorName}` : 'Choose Doctor Name'}
              </div>
            </div>
            {isNurseModalOpen && (
              <div className="nurse-input-overlay">
                <label>Select Doctor Name</label>
                <div className="nurse-listbox">
                  {nurseSuggestions.length > 0 ? (
                    <>
                      {nurseSuggestions.map((doctor, index) => (
                        <div
                          key={index}
                          className={`nurse-listbox-item ${doctorName === doctor ? 'selected' : ''}`}
                          onClick={() => handleNurseSelect(doctor)}
                        >
                          {doctor}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="nurse-listbox-item disabled">
                      No doctors available
                    </div>
                  )}
                </div>
                <div className="modal-buttons">
                  <button
                    className="buttonred responsive-button"
                    onClick={() => {
                      const name = prompt('Enter new doctor name:');
                      if (name) handleAddNurseName(name);
                    }}
                  >
                    Add New Doctor
                  </button>
                  <button
                    className="buttonblack responsive-button"
                    onClick={() => setIsNurseModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {viewState.vitals && (
              <div className="section-container">
                <div className="section-header" onClick={() => toggleSection("vitals")}>
                  <span className="section-toggle">{isOpen.vitals ? "-" : "+"}</span> Vitals
                </div>
                {isOpen.vitals && (
                  <div className="vitals-container">
                    {/* && Object.keys(vitals).length > 0 ?  */}
                    {vitals &&
                      Object.keys(vitals).map((item, index) => (
                        <div className="vitals-column" key={index}>
                          <label>{item}</label>
                          <input
                            name={item}
                            value={vitals[item] || ""}
                            onChange={handleVitalsChange}
                            className="responsive-input"
                          // rows="4"
                          // cols="50"
                          />
                        </div>
                      ))
                      // ) : (
                      //   <p>No vitals data available</p>
                      // )
                    }
                  </div>
                )}
              </div>
            )}
            {viewState.history && (
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
                                  onClick={() =>
                                    handleDeleteHistory(familyHistory, setFamilyHistory, item)
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <textarea
                        placeholder="Add Family History"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddHistoryItem(e.target.value, familyHistory, setFamilyHistory);
                            e.target.value = "";
                          }
                        }}
                        className="responsive-input"
                        rows="4"
                        cols="50"
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
                                  onClick={() =>
                                    handleDeleteHistory(birthHistory, setBirthHistory, item)
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <textarea
                        placeholder="Add Birth History"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddHistoryItem(e.target.value, birthHistory, setBirthHistory);
                            e.target.value = "";
                          }
                        }}
                        className="responsive-input"
                        rows="4"
                        cols="50"
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
                                  onClick={() =>
                                    handleDeleteHistory(surgicalHistory, setSurgicalHistory, item)
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <textarea
                        placeholder="Add Surgical History"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddHistoryItem(
                              e.target.value,
                              surgicalHistory,
                              setSurgicalHistory
                            );
                            e.target.value = "";
                          }
                        }}
                        className="responsive-input"
                        rows="4"
                        cols="50"
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
                                  onClick={() =>
                                    handleDeleteHistory(otherHistory, setOtherHistory, item)
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <textarea
                        placeholder="Add Other History"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddHistoryItem(e.target.value, otherHistory, setOtherHistory);
                            e.target.value = "";
                          }
                        }}
                        className="responsive-input"
                        rows="4"
                        cols="50"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {viewState.major && (
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
                        className="responsive-textarea local-examination-textarea"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {viewState.dental && (
              <div className="dental-section-container">
                <div className="dental-section-header" onClick={() => toggleSection("dental")}>
                  <span className="dental-section-toggle">{isOpen.dental ? "-" : "+"}</span> Dental
                </div>
                {isOpen.dental && (
                  <div className="dental-vitals-container">
                    <div className="dental-chart-table">
                      <h5>Intra-Oral Examination</h5>
                      <table className="dental-table">
                        <tbody>
                          <tr>
                            {[
                              18, 17, 16, 15, 14, 13, 12, 11,
                              21, 22, 23, 24, 25, 26, 27, 28
                            ].map((toothNumber) => (
                              <td
                                key={toothNumber}
                                className={`dental-tooth-cell ${dental[toothNumber] ? 'has-value' : ''}`}
                                onClick={() => setSelectedTooth(toothNumber)}
                              >
                                <div className="tooth-number">{toothNumber}</div>
                                <div className="tooth-condition">
                                  {dental[toothNumber] || "Select"}
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            {[
                              48, 47, 46, 45, 44, 43, 42, 41,
                              31, 32, 33, 34, 35, 36, 37, 38
                            ].map((toothNumber) => (
                              <td
                                key={toothNumber}
                                className={`dental-tooth-cell ${dental[toothNumber] ? 'has-value' : ''}`}
                                onClick={() => setSelectedTooth(toothNumber)}
                              >
                                <div className="tooth-number">{toothNumber}</div>
                                <div className="tooth-condition">
                                  {dental[toothNumber] || "Select"}
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {selectedTooth && (
                      <div className="dental-input-overlay">
                        <label>Tooth {selectedTooth}</label>
                        <div className="dental-listbox">
                          {dentalOptions.length > 0 ? (
                            <>
                              {dentalOptions.map((option, index) => (
                                <div
                                  key={index}
                                  className={`dental-listbox-item ${dental[selectedTooth] === conditionMap[option] ? 'selected' : ''}`}
                                  onClick={() => handledental(option, selectedTooth)}
                                >
                                  {option}
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="dental-listbox-item disabled">
                              No dental values available
                            </div>
                          )}
                        </div>
                        <button
                          className="buttonblack responsive-button"
                          onClick={() => setSelectedTooth(null)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {viewState.examination && (
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
                            type="checkbox" className="checkbox-input"
                            name={field ? field.toLowerCase().replace(/\s+/g, '') : `field_${index}`}
                            checked={selectonexamination[field ? field.toLowerCase().replace(/\s+/g, '') : `field_${index}`] || false}
                            onChange={(e) => {
                              const { name, checked } = e.target;
                              setselectonexamination((prev) => ({
                                ...prev,
                                [name]: checked,
                              }));
                            }}
                          />
                          <label>{field ? field.charAt(0).toUpperCase() + field.slice(1) : `Unknown Field ${index}`}</label>
                        </div>
                      ))}
                    </div>
                    <div className="examination-section">
                      <h5>Systemic Examination</h5>
                      {onsystem.map((field, index) => (
                        <div className="checkbox-item" key={index}>
                          <input
                            type="checkbox" className="checkbox-input"
                            name={field.toLowerCase().replace(/\s+/g, '')}
                            checked={selectsystematic[field.toLowerCase().replace(/\s+/g, '')] || false}
                            onChange={(e) => {
                              const { name, checked } = e.target;
                              setselectsystematic((prev) => ({
                                ...prev,
                                [name]: checked,
                              }));
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
                            type="checkbox" className="checkbox-input"
                            name={field.toLowerCase().replace(/\s+/g, '')}
                            checked={selectavailableTests[field.toLowerCase().replace(/\s+/g, '')] || false}
                            onChange={(e) => {
                              const { name, checked } = e.target;
                              setselectavailableTests((prev) => ({
                                ...prev,
                                [name]: checked,
                              }));
                            }}
                          />
                          <label>{field}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {viewState.file && (
              <div className="file-upload-section-container">
                <div className="file-upload-section-header" onClick={() => toggleSection("file")}>
                  <span className="file-upload-section-toggle">{isOpen.file ? "-" : "+"}</span> File Uploader
                </div>
                {isOpen.file && (
                  <div className="file-upload-vitals-container">
                    {!useCamera && (
                      <div className="file-upload-controls">
                        <input
                          type="file"
                          multiple
                          onChange={handleMultipleFilesChange}
                          accept="image/*"
                          className="file-upload-input"
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
            )}
            {viewState.localdiagnosis && (
              <div className="local-diagnosis-section-container">
                <div className="local-diagnosis-section-header" onClick={() => toggleSection("localdiagnosis")}>
                  <span className="local-diagnosis-section-toggle">{isOpen.localdiagnosis ? "-" : "+"}</span> Local Examination and Diagnosis
                </div>
                {isOpen.localdiagnosis && (
                  <div className="local-diagnosis-vitals-container">
                    <div className="local-examination-column">
                      <label>Local Examination</label>
                      <textarea
                        placeholder="Type...."
                        value={local}
                        onChange={(e) => setlocal(e.target.value)}
                        className="local-examination-textarea"
                      />
                    </div>
                    <div className="diagnosis-column">
                      <label>Diagnosis</label>
                      <textarea
                        placeholder="Type"
                        value={dignosis}
                        onChange={(e) => setdignosis(e.target.value)}
                        className="diagnosis-textarea"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {viewState.treatment && (
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
                            <th>Name</th>
                            <th>Dosage</th>
                            <th>Route of Administration</th>
                            <th>Delete</th>
                            <th>Edit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {treatment.map((item, index) => (
                            <tr key={index}>
                              <td data-title="Name">{item.treatmentgivenname}</td>
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
                            <td data-title="Name">
                              <div className="input-with-suggestions">
                                <input
                                  type="text"
                                  value={treatmentgivenname}
                                  onChange={handleTreatmentNameChange}
                                  onBlur={() => setTimeout(() => settreatmentgivennameSuggestions([]), 200)}
                                  placeholder="Name"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={treatmentgivennameSuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    settreatmentgivenname(suggestion);
                                    settreatmentgivennameSuggestions([]);
                                  }}
                                />
                              </div>
                            </td>
                            <td data-title="Dosage">
                              <div className="input-with-suggestions">
                                <input
                                  type="text"
                                  value={treatmentdosage}
                                  onChange={handleDosageChange}
                                  onBlur={() => setTimeout(() => setDosageSuggestions([]), 200)}
                                  placeholder="Dosage"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={dosageSuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    settreatmentdosage(suggestion);
                                    setDosageSuggestions([]);
                                  }}
                                />
                              </div>
                            </td>
                            <td data-title="Route of Administration">
                              <div className="input-with-suggestions">
                                <input
                                  type="text"
                                  value={treatmentrout}
                                  onChange={handleroa}
                                  onBlur={() => setTimeout(() => setRoaSuggestion([]), 200)}
                                  placeholder="Route of Administration"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={RoaSuggestion}
                                  onSuggestionClick={(suggestion) => {
                                    settreatmentrout(suggestion);
                                    setRoaSuggestion([]);
                                  }}
                                />
                              </div>
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
            )}
            {viewState.prescription && (
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
                              <div className="input-with-suggestions">
                                <input
                                  type="text"
                                  value={medicine}
                                  onChange={handleMedicineChange}
                                  onBlur={() => setTimeout(() => setMedicineSuggestions([]), 200)}
                                  placeholder="Medicine"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={medicineSuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    setMedicine(suggestion);
                                    setMedicineSuggestions([]);
                                  }}
                                />
                              </div>
                            </td>
                            <td data-title="Dosage">
                              <div className="input-with-suggestions">
                                <input
                                  type="text"
                                  value={dosage}
                                  onChange={handlePriscriptionDosageChange}
                                  onBlur={() => setTimeout(() => setPrescriptiondosagesuggestion([]), 200)}
                                  placeholder="Dosage"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={Prescriptiondosagesuggestion}
                                  onSuggestionClick={(suggestion) => {
                                    setDosage(suggestion);
                                    setPrescriptiondosagesuggestion([]);
                                  }}
                                />
                              </div>
                            </td>
                            <td data-title="Timing">
                              <div className="input-with-suggestions">
                                <input
                                  type="text"
                                  value={timing}
                                  onChange={handleTiming}
                                  onBlur={() => setTimeout(() => settimingSuggestions([]), 200)}
                                  placeholder="Timing"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={timingSuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    setTiming(suggestion);
                                    settimingSuggestions([]);
                                  }}
                                />
                              </div>
                            </td>
                            <td data-title="Duration">
                              <div className="input-with-suggestions">
                                <input
                                  type="text"
                                  value={duration}
                                  onChange={handleDuration}
                                  onBlur={() => setTimeout(() => setdurationsuggestions([]), 200)}
                                  placeholder="Duration"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={durationsuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    setDuration(suggestion);
                                    setdurationsuggestions([]);
                                  }}
                                />
                              </div>
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
            )}
            {viewState.follow && (
              <div className="follow-update-section-container">
                <div className="follow-update-section-header" onClick={() => toggleSection("follow")}>
                  <span className="follow-update-section-toggle">{isOpen.follow ? "-" : "+"}</span> Follow Update
                </div>
                {isOpen.follow && (
                  <div className="follow-update-vitals-container">
                    <div className="follow-date-column">
                      <label>Follow Up Date</label>
                      <input
                        type="date"
                        value={followupdate}
                        onChange={(e) => setfollowupdate(e.target.value)}
                        className="follow-date-input"
                      />
                    </div>
                    <div className="advice-given-column">
                      <label>Advice Given</label>
                      <div className="input-with-suggestions">
                        <textarea
                          placeholder="Type..."
                          value={advicegiven}
                          onChange={handleAdvicegiven}
                          onBlur={() => setTimeout(() => setadvicegivenSuggestions([]), 200)}
                          className="advice-given-textarea"
                        />
                        <SuggestionList
                          suggestions={advicegivenSuggestions}
                          onSuggestionClick={(suggestion) => {
                            setadvicegiven(suggestion);
                            setadvicegivenSuggestions([]);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="button-container">
            <button className="buttonblack responsive-button btn-save" onClick={handleSubmit}>Save</button>
            <button className="buttonblue responsive-button btn-bill" onClick={handleSendToBill}>Send to Bill</button>
            <button className="buttongrey responsive-button btn-generate" onClick={handleGeneratePrescription}>Generate Prescription</button>
            <button className="buttonred responsive-button btn-test" onClick={handleGenerateTestReport}>Test Report Requirement</button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .nurse-input-overlay {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          max-width: 300px;
          width: 100%;
          text-align: center;
        }
        .nurse-listbox {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin: 10px 0;
        }
        .nurse-listbox-item {
          padding: 10px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }
        .nurse-listbox-item:hover {
          background-color: #f0f0f0;
        }
        .nurse-listbox-item.selected {
          background-color: rgb(59, 59, 59);
          color: white;
        }
        .nurse-listbox-item.disabled {
          cursor: not-allowed;
          color: #999;
        }
        .modal-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        .buttonred {
          background-color: #dc3545;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .buttonred:hover {
          background-color: #c82333;
        }
        .buttonblack {
          background-color: black;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .buttonblack:hover {
          background-color: #1f1f1f;
        }
        .buttonblue {
          background-color: #007bff;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .buttonblue:hover {
          background-color: #0056b3;
        }
        .responsive-button {
          width: 100%;
          margin: 5px;
        }
        @media (min-width: 768px) {
          .responsive-button {
            width: auto;
            margin: 0 5px;
          }
        }
        .dental-input-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          max-width: 300px;
          width: 100%;
          text-align: center;
        }
        .dental-listbox {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin: 10px 0;
        }
        .dental-listbox-item {
          padding: 10px;
          cursor: pointer;
          border-bottom: prj 1px solid #eee;
          transition: background-color 0.2s;
        }
        .dental-listbox-item:hover {
          background-color: #f0f0f0;
        }
        .dental-listbox-item.selected {
          background-color: rgb(59, 59, 59);
          color: white;
        }
        .dental-listbox-item.disabled {
          cursor: not-allowed;
          color: #999;
        }
        .dental-tooth-box.has-value {
          background-color: #e0f7fa;
        }
      `}</style>
    </>
  );
};

export default AdminFormIn;