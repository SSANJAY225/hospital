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

const AdminFormOut = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const dentalChartRef = useRef(null);
  const videoRef = useRef(null);

  // Authentication and role checking
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

  // FDI to Sequential Mapping
  const fdiToSequentialMap = {
    18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
    21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
    38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
    48: 25, 47: 26, 46: 27, 45: 28, 44: 29, 43: 30, 42: 31, 41: 32,
  };

  const sequentialToFdiMap = Object.fromEntries(
    Object.entries(fdiToSequentialMap).map(([k, v]) => [v, k])
  );

  // Condition mapping for dental conditions
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

  // State for URL parameters
  const [urlParams, setUrlParams] = useState({
    businessName: '',
    name: '',
    id: '',
    visited: '',
    nursename: '',
    loginLocation: '',
    franchiselocation: '',
  });

  // State for all input fields
  const [familyHistoryInput, setFamilyHistoryInput] = useState("");
  const [birthHistoryInput, setBirthHistoryInput] = useState("");
  const [surgicalHistoryInput, setSurgicalHistoryInput] = useState("");
  const [otherHistoryInput, setOtherHistoryInput] = useState("");
  const [toothPositions, setToothPositions] = useState([]);
  const [majorComplaints, setMajorComplaints] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [birthHistory, setBirthHistory] = useState([]);
  const [surgicalHistory, setSurgicalHistory] = useState([]);
  const [otherHistory, setOtherHistory] = useState([]);
  const [followupdate, setFollowupdate] = useState('');
  const [advicegiven, setAdvicegiven] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [nurseName, setNurseName] = useState('');
  const [nurseSuggestions, setNurseSuggestions] = useState([]);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [newNurseName, setNewNurseName] = useState('');
  const [treatmentgivennameSuggestions, setTreatmentgivennameSuggestions] = useState([]);
  const [treatmentgivenname, setTreatmentgivenname] = useState('');
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [vitalsinput, setVitalsinput] = useState({});
  const [vitals, setVitals] = useState({});
  const [onexamination, setOnExamination] = useState([]);
  const [onsystem, setOnSystem] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [dosageSuggestions, setDosageSuggestions] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('');
  const [duration, setDuration] = useState('');
  const [dignosis, setDignosis] = useState('');
  const [treatment, setTreatment] = useState([]);
  const [treatmentdosage, setTreatmentdosage] = useState('');
  const [treatmentrout, setTreatmentrout] = useState('');
  const [local, setLocal] = useState('');
  const [selectavailableTests, setSelectavailableTests] = useState({});
  const [selectonexamination, setSelectonexamination] = useState({});
  const [selectsystematic, setSelectsystematic] = useState({});
  const [complaintsSuggestions, setComplaintsSuggestions] = useState([]);
  const [vitalsSuggestions, setVitalsSuggestions] = useState([]);
  const [treatmentgivenSuggestions, setTreatmentgivenSuggestions] = useState([]);
  const [timingSuggestions, setTimingSuggestions] = useState([]);
  const [durationsuggestions, setDurationsuggestions] = useState([]);
  const [advicegivenSuggestions, setAdvicegivenSuggestions] = useState([]);
  const [dentalSuggestions, setDentalSuggestions] = useState([]);
  const [prescriptiondosagesuggestion, setPrescriptiondosagesuggestion] = useState([]);
  const [roaSuggestion, setRoaSuggestion] = useState([]);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [dentalOptions, setDentalOptions] = useState([]);
  const [vitalinput, setvitalinput] = useState([])
  const [basic,setbasic]=useState({})

  // State for section visibility and toggle
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

  // Parse URL parameters
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      loginLocation: searchParams.get('loginlocation'),
      businessName: searchParams.get('businessname'),
      name: searchParams.get('name'),
      id: searchParams.get('id'),
      visited: searchParams.get('visited'),
      nursename: searchParams.get('nursename'),
      franchiselocation: searchParams.get('franchiselocation'),
    };
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setIsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const basicData=async()=>{
    const searchParams = new URLSearchParams(location.search);
    // setUrlParams(getUrlParams());
    // console.log("sdfghsfjgn",urlParams)
    const res= await axios.get(`http://amrithaahospitals.visualplanetserver.in/get-basic-detail/${searchParams.get('id')}/${searchParams.get('name')}/${searchParams.get('businessname')}/${searchParams.get('visited')}`)
    console.log(res)
    setbasic(res.data)
  }
  // Fetch initial data
  useEffect(() => {
    fetchVitalsInput();
    fetchVitalValue();
    setUrlParams(getUrlParams());
    fetchDentalOptions();
    fetchData('http://amrithaahospitals.visualplanetserver.in/api/onexamination', setOnExamination);
    fetchData('http://amrithaahospitals.visualplanetserver.in/api/onsystem', setOnSystem);
    fetchData('http://amrithaahospitals.visualplanetserver.in/api/tests', setAvailableTests);
    fetchData('http://amrithaahospitals.visualplanetserver.in/column-vitals', setvitalinput)
    basicData()
  }, [location]);

  // Fetch vitals input fields
  const fetchVitalsInput = async () => {
    try {
      const response = await fetch('http://amrithaahospitals.visualplanetserver.in/column-vitals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      const filteredData = data.filter(col => col !== 'Name' && col !== 'Visit' && col !== 'Phone number');
      const vitalsObject = Object.fromEntries(filteredData.map(field => [field, '']));
      setVitalsinput(vitalsObject);
    } catch (error) {
      console.error("Error fetching vitals:", error);
    }
  };

  // Fetch vital values
  const fetchVitalValue = async () => {
    try {
      const search = new URLSearchParams(location.search);
      const res = await axios.get(`http://amrithaahospitals.visualplanetserver.in/getvitals/${search.get("name")}/${search.get("visited")}/${search.get("businessname")}`);
      console.log("vital input--->", res)
      if (res.data.length != 0) {
        setVitals(res.data[0]);
        console.log("vitals check=>>>>", res.data.length)
      } else {
        const vit = await axios.get(`http://amrithaahospitals.visualplanetserver.in/column-vitals`)
        const result = Object.fromEntries(vit.data.map(key => [key, ""]));
        setVitals(result);
        console.log("else", vit.data)
      }
      const maj = await axios.get(`http://amrithaahospitals.visualplanetserver.in/get-major/${search.get("name")}/${search.get("visited")}/${search.get("businessname")}`);
      setMajorComplaints(maj.data[0]?.Major_Complaints || "");
    } catch (error) {
      console.error("Error fetching vital values:", error);
    }
  };

  // Fetch dental condition options
  const fetchDentalOptions = async () => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/api/dental-suggestions');
      setDentalOptions(response.data);
    } catch (error) {
      console.error('Error fetching dental options:', error);
      setDentalOptions([]);
    }
  };

  // Fetch image
  useEffect(() => {
    if (urlParams.businessName && urlParams.visited) {
      fetchImage(urlParams.businessName, urlParams.visited);
    }
  }, [urlParams]);

  const fetchImage = async (phoneNumber, visited) => {
    try {
      const response = await axios.get(`http://amrithaahospitals.visualplanetserver.in/api/user-photo`, {
        params: { phoneNumber, visited },
      });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Error fetching image:', error);
      setImageUrl(null);
    }
  };



  const handleTestCheckboxChange = (field, isChecked) => {
    setSelectavailableTests(prev =>
      isChecked
        ? [...prev, field]
        : prev.filter(item => item !== field))
  };

  const handleExaminationCheckboxChange = (field, isChecked) => {
    setSelectonexamination(prev =>
      isChecked
        ? [...prev, field]
        : prev.filter(item => item !== field))
  };

  const handleSystematicCheckboxChange = (field, isChecked) => {
    setSelectsystematic(prev =>
      isChecked
        ? [...prev, field]
        : prev.filter(item => item !== field))
  };


  // Handle dental chart image load
  const handleImageLoad = () => {
    if (dentalChartRef.current) {
      const img = dentalChartRef.current.querySelector('.dental-chart-img');
      if (img && img.complete) {
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

  // Dental state
  const [dental, setDental] = useState({});

  // Handle dental condition selection
  const handleDental = (value, toothNumber) => {

    setDental((prev) => ({
      ...prev,
      [toothNumber]: value,
    }));
    setSelectedTooth(null);
  };

  // Fetch suggestions
  const fetchSuggestions = async (value, apiUrl, setSuggestionState) => {
    try {
      if (value.length > 0) {
        const response = await axios.get(apiUrl, {
          params: { term: value },
        });
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

  // Handle input changes
  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitals((prevVitals) => ({ ...prevVitals, [name]: value }));
  };

  const handleTreatmentNameChange = (e) => {
    const value = e.target.value;
    setTreatmentgivenname(value);
    fetchSuggestions(
      value,
      'http://amrithaahospitals.visualplanetserver.in/api/treatment-name-suggestions',
      setTreatmentgivennameSuggestions
    );
  };

  const handleMedicineChange = (e) => {
    const value = e.target.value;
    setMedicine(value);
    fetchSuggestions(value, 'http://amrithaahospitals.visualplanetserver.in/api/drugs-suggestions', setMedicineSuggestions);
  };

  const handleDosageChange = (e) => {
    const value = e.target.value;
    setTreatmentdosage(value);
    fetchSuggestions(value, 'http://amrithaahospitals.visualplanetserver.in/api/dosage-suggestions', setDosageSuggestions);
  };

  const handleRoa = (e) => {
    const value = e.target.value;
    setTreatmentrout(value);
    fetchSuggestions(value, 'http://amrithaahospitals.visualplanetserver.in/api/roa-suggestions', setRoaSuggestion);
  };

  const handlePrescriptionDosageChange = (e) => {
    const value = e.target.value;
    setDosage(value);
    fetchSuggestions(value, 'http://amrithaahospitals.visualplanetserver.in/api/dosage-suggestions', setPrescriptiondosagesuggestion);
  };

  const handleTiming = (e) => {
    const value = e.target.value;
    setTiming(value);
    fetchSuggestions(value, 'http://amrithaahospitals.visualplanetserver.in/api/timing-suggestions', setTimingSuggestions);
  };

  const handleDuration = (e) => {
    const value = e.target.value;
    setDuration(value);
    fetchSuggestions(value, 'http://amrithaahospitals.visualplanetserver.in/api/duration-suggestions', setDurationsuggestions);
  };

  const handleAdvicegiven = (e) => {
    const value = e.target.value;
    setAdvicegiven(value);
    fetchSuggestions(value, 'http://amrithaahospitals.visualplanetserver.in/api/advicegiven-suggestions', setAdvicegivenSuggestions);
  };

  // Handle history
  const handleAddHistoryItem = (newHistoryItem, historyList, setHistoryList) => {
    if (!historyList.includes(newHistoryItem) && newHistoryItem.trim() !== '') {
      setHistoryList([...historyList, newHistoryItem]);
    }
  };

  const handleDeleteHistory = (history, setHistory, item) => {
    setHistory(history.filter((entry) => entry !== item));
  };

  // Handle treatment
  const handleAddTreatment = () => {
    if (treatmentgivenname && treatmentdosage && treatmentrout) {
      setTreatment([...treatment, { treatmentgivenname, treatmentdosage, treatmentrout }]);
      setTreatmentgivenname('');
      setTreatmentdosage('');
      setTreatmentrout('');
      setTreatmentgivennameSuggestions([]);
      setDosageSuggestions([]);
      setRoaSuggestion([]);
    }
  };

  const handleEditTreatment = (index) => {
    const item = treatment[index];
    setTreatmentgivenname(item.treatmentgivenname);
    setTreatmentdosage(item.treatmentdosage);
    setTreatmentrout(item.treatmentrout);
    handleDeleteHistory(treatment, setTreatment, item);
  };

  // Handle prescription
  const handleAddPrescription = () => {
    if (medicine && dosage && timing && duration) {
      setPrescription([...prescription, { medicine, dosage, timing, duration }]);
      setMedicine('');
      setDosage('');
      setTiming('');
      setDuration('');
      setMedicineSuggestions([]);
      setPrescriptiondosagesuggestion([]);
      setTimingSuggestions([]);
      setDurationsuggestions([]);
    }
  };

  const handleEditPrescription = (index) => {
    const item = prescription[index];
    setMedicine(item.medicine);
    setDosage(item.dosage);
    setTiming(item.timing);
    setDuration(item.duration);
    handleDeleteHistory(prescription, setPrescription, item);
  };

  // Handle file uploads
  const handleMultipleFilesChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setMultipleFiles((prev) => [...prev, ...filesArray]);
  };

  const removeFile = (index) => {
    setMultipleFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [stream]);

  // Handle doctor/nurse selection
  const fetchNurseSuggestions = async () => {
    try {
      console.log("Fetching doctors for location:", urlParams.franchiselocation);
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/api/doctor-suggestions', {
        params: { franchiselocation: urlParams.franchiselocation }
      });
      console.log("API Response:", response.data);
      setNurseSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching doctor suggestions:', error);
      setNurseSuggestions([]);
    }
  };

  const handleAddNurseName = async (name) => {
    if (name.trim() === '') return;
    try {
      await axios.post('http://amrithaahospitals.visualplanetserver.in/addDoctorName', {
        doctorName: name,
        location: urlParams.franchiselocation
      });
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

  const fetchDoctorSuggestions = async (term) => {
    try {
      const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/api/doctor-suggestions', {
        params: {
          term,
          franchiselocation: urlParams.franchiselocation
        }
      });
      setDoctorSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching doctor suggestions:', error);
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

  // Generate prescription PDF

  const handleGeneratePrescription = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = templateImage;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 210, 297);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Draw white box with black border for Name, A/G, Patient ID, Date
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 45, 190, 12, 'FD'); // Positioned as before

      // Place text inside the box
      doc.text(`Name: ${urlParams.name || 'youtube'}`, 13, 53);
      doc.text(`A/G: ${vitals.Age || '32'} Years / ${vitals.Gender || 'Male'}`, 60, 53);
      doc.text(`Patient ID: ${urlParams.id || 'ITK00117513'}`, 110, 53);
      doc.text(`Date: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, 150, 53);

      // Filter vitals to exclude certain keys
      const vitalsToExclude = ['Age', 'Gender', 'Name', 'Phone_number', 'Visit'];
      const filteredVitals = Object.entries(vitals).filter(([key, value]) => !vitalsToExclude.includes(key) && value);

      // Draw white box with black border for vitals (two rows, five columns each)
      const vitalBoxHeight = 20; // 10mm per row, 2 rows

      // Distribute vitals across two rows
      const columnWidth = 38; // 190mm width / 5 columns = 38mm per column
      let row1Y = 65; // First row y-position
      let row2Y = 75; // Second row y-position

      filteredVitals.forEach(([key, value], index) => {
        const vitalText = `${key}: ${value}`;
        const columnIndex = index % 5; // Determine column (0 to 4)
        const xPosition = 15 + columnIndex * columnWidth; // Calculate x position
        const yPosition = index < 5 ? row1Y : row2Y; // First row for first 5, second row for next 5
        doc.text(vitalText, xPosition, yPosition);
      });

      // Calculate the starting Y position for the next section
      const nextSectionY = 70 + vitalBoxHeight + 10; // Below the vitals box with some margin

      // Create table for Chief Complaints and Diagnosis
      autoTable(doc, {
        startY: nextSectionY,
        head: [['Chief Complaints', 'Diagnosis']],
        body: [[majorComplaints || 'Acidity (2 Days)', dignosis || 'Ulcer']],
        theme: 'grid',
        styles: { halign: 'left', cellPadding: 2, fontSize: 10, lineWidth: 0.5, lineColor: [0, 0, 0] },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], halign: 'center' },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 80 },
        },
        margin: { left: 15, right: 15 },
      });

      const tableHeadings = ['Medicine', 'Dosage', 'Timing', 'Duration'];
      const tableData = prescription.map(item => [
        item.medicine || 'N/A',
        item.dosage || 'N/A',
        item.timing || 'N/A',
        item.duration || 'N/A'
      ]) || [];
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
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
        },
        margin: { left: 15, right: 15 },
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
  // Generate test report PDF
  const handleGenerateTestReport = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = letterpadImage;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 210, 297); // A4 size in mm
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      // Fill in patient details at the top (positions based on the template image)
      doc.text(`${urlParams.name || 'Patient Name'}`, 45, 75); // Name position
      doc.text(`${vitals.Age || '32'} Years / ${vitals.Gender || 'Male'}`, 137, 75); // Age/Sex position
      doc.text(`${new Date().toLocaleString('en-US', { dateStyle: 'medium' })}`, 173, 67.5); // Date position

      // Get selected tests
      const selectedTests = Object.keys(selectavailableTests)
        .filter((key) => selectavailableTests[key])
        .map((key) => {
          return (
            availableTests.find(
              (test) => test.toLowerCase().replace(/\s+/g, '') === key
            ) || key
          );
        });

      // Position below Rx (Rx is at approximately y=60 in the template)
      let yPosition = 130; // Starting below Rx

      if (selectedTests.length > 0) {
        selectedTests.forEach((test, index) => {
          doc.text(`${index + 1}. ${test}`, 50, yPosition); // Left-aligned tests
          yPosition += 8; // Increment y position for each test
        });
      } else {
        doc.text('No tests selected.', 15, yPosition);
      }

      const filename = `${urlParams.businessName}_${urlParams.id}_${urlParams.visited}_test_report.pdf`;
      doc.save(filename);
    };
    img.onerror = (error) => {
      console.error('Error loading background image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load the template image from src/images/Letterpad.jpg.',
      });
    };
  };



  const handleAddDoctorName = async (name) => {
    if (name.trim() === '') return;
    if (!urlParams.franchiselocation) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Franchise location is missing. Please ensure it is provided in the URL.',
      });
      return;
    }
    try {
      await axios.post('http://amrithaahospitals.visualplanetserver.in/addDoctorName', {
        doctorName: name,
        location: urlParams.franchiselocation // Include location from urlParams
      });
      setDoctorName(name);
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


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalFamilyHistory = familyHistoryInput.trim() !== ""
      ? [...familyHistory, familyHistoryInput.trim()]
      : [...familyHistory];

    const finalBirthHistory = birthHistoryInput.trim() !== ""
      ? [...birthHistory, birthHistoryInput.trim()]
      : [...birthHistory];

    const finalSurgicalHistory = surgicalHistoryInput.trim() !== ""
      ? [...surgicalHistory, surgicalHistoryInput.trim()]
      : [...surgicalHistory];

    const finalOtherHistory = otherHistoryInput.trim() !== ""
      ? [...otherHistory, otherHistoryInput.trim()]
      : [...otherHistory];
    const { name, businessName, visited } = urlParams;
    const hasDentalData = Object.values(dental).some(value => value !== "");
    const formData = new FormData();
    formData.append("dignosis", dignosis);
    formData.append("majorComplaints", majorComplaints);
    formData.append("followupdate", followupdate);
    formData.append("advicegiven", advicegiven);
    formData.append("local", local);
    formData.append("name", name);
    formData.append("businessName", businessName);
    formData.append("visited", visited || 0);
    formData.append("doctorName", doctorName);
    vitals["Name"] = name
    vitals["Phone_number"] = businessName
    vitals["Visit"] = visited
    // Append vitals
    Object.entries(vitals).forEach(([key, value]) => {
      formData.append(`vitals[${key}]`, value);
    });
    console.log("vitals--->", vitals)
    // Append selected tests
    const selectedTests = Object.entries(selectavailableTests)
      .filter(([key, value]) => value)
      .map(([key]) => key);
    console.log('Selected Tests:', selectedTests);
    selectedTests.forEach((test) => formData.append("selectavailableTests[]", test));

    // Append selected on examination fields
    const selectedOnExamination = Object.entries(selectonexamination)
      .filter(([key, value]) => value)
      .map(([key]) => key);
    console.log('Selected On Examination:', selectedOnExamination);
    selectedOnExamination.forEach((field) => formData.append("selectonexamination[]", field));

    // Append selected systematic examination fields
    const selectedSystematic = Object.entries(selectsystematic)
      .filter(([key, value]) => value)
      .map(([key]) => key);
    console.log('Selected Systematic Examination:', selectedSystematic);
    selectedSystematic.forEach((field) => formData.append("selectsystematic[]", field));

    // Append history arrays
    finalFamilyHistory.forEach((item) => formData.append("familyHistory[]", item));
    finalBirthHistory.forEach((item) => formData.append("birthHistory[]", item));
    finalSurgicalHistory.forEach((item) => formData.append("surgicalHistory[]", item));
    finalOtherHistory.forEach((item) => formData.append("otherHistory[]", item));

    // Append treatment
    treatment.forEach((t, index) => {
      formData.append(`treatment[${index}][treatmentgivenname]`, t.treatmentgivenname);
      formData.append(`treatment[${index}][treatmentdosage]`, t.treatmentdosage);
      formData.append(`treatment[${index}][treatmentrout]`, t.treatmentrout);
    });

    // Append prescription
    prescription.forEach((p, index) => {
      formData.append(`prescription[${index}][medicine]`, p.medicine);
      formData.append(`prescription[${index}][dosage]`, p.dosage);
      formData.append(`prescription[${index}][timing]`, p.timing);
      formData.append(`prescription[${index}][duration]`, p.duration);
    });

    try {
      // Save general form data
      const response = await fetch("http://amrithaahospitals.visualplanetserver.in/save-data", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Form data response:", response);

      // Save dental data
      if (hasDentalData) {
        const encodedName = encodeURIComponent(name);
        const encodedVisit = encodeURIComponent(visited);
        const encodedPhone = encodeURIComponent(businessName);
        console.log("Dental data to be sent:", dental);
        const dentalData = { dental: JSON.stringify(dental) };
        const den = await axios.post(
          `http://amrithaahospitals.visualplanetserver.in/adddental/${encodedName}/${encodedVisit}/${encodedPhone}`,
          dentalData,
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log("Dental data response:", den.data);
      }

      // Upload files
      const fileData = new FormData();
      multipleFiles.forEach((file) => fileData.append("upload", file));
      if (multipleFiles.length > 0) {
        const fileUploadResponse = await axios.post(
          `http://amrithaahospitals.visualplanetserver.in/upload/${businessName}/${visited}/${name}`,
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

  // Send to bill
  const handleSendToBill = async () => {
    const { name, businessName, visited, loginLocation, franchiselocation } = urlParams;
    try {
      const response = await axios.post('http://amrithaahospitals.visualplanetserver.in/update-status', {
        name,
        businessName,
        visited: visited || 0,
        status: 'doctorcompleted'
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Patient status updated to doctorcompleted.',
        confirmButtonText: 'OK',
      });
      navigate(`/PatientsFollowUpOut?loginlocation=${loginLocation}&franchiselocation=${franchiselocation}`, {
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

  // Suggestion list component
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

  // Fetch additional data
  const fetchData = async (url, setData) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
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
                  <span className="info-value">{basic.full_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Number:</span>
                  <span className="info-value">{basic.phone_number}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{basic.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Visited:</span>
                  <span className="info-value">{basic.visted}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nurse:</span>
                  <span className="info-value">
                    {basic.nursename ? basic.nursename : "Not Checked by any nurse"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">
                    {basic.belongedlocation ? basic.belongedlocation:""}
                  </span>
                </div>
                {basic.room_number!=null&&(
                  <div className="info-row">
                  <span className="info-label">Room number:</span>
                  <span className="info-value">
                    {basic.room_number ? basic.room_number:""}
                  </span>
                </div>
                )}
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
                  {nurseSuggestions === null ? (
                    <div className="nurse-listbox-item">Loading doctors...</div>
                  ) : nurseSuggestions.length > 0 ? (
                    nurseSuggestions.map((doctor, index) => (
                      <div
                        key={index}
                        className={`nurse-listbox-item ${doctorName === doctor ? 'selected' : ''}`}
                        onClick={() => {
                          setDoctorName(doctor);
                          setIsNurseModalOpen(false);
                        }}
                      >
                        {doctor}
                      </div>
                    ))
                  ) : (
                    <div className="nurse-listbox-item disabled">
                      {urlParams.franchiselocation
                        ? `No doctors available for ${urlParams.franchiselocation}`
                        : 'No location specified'}
                    </div>
                  )}
                </div>
                <div>
                  <label>Add New Doctor</label>
                  <input
                    type="text"
                    value={newNurseName}
                    onChange={(e) => setNewNurseName(e.target.value)}
                    placeholder="Enter doctor name"
                    className="responsive-input"
                  />
                </div>
                <div className="modal-buttons">
                  <button
                    className="buttonred responsive-button"
                    onClick={() => {
                      if (newNurseName) handleAddDoctorName(newNurseName);
                      setNewNurseName('');
                    }}
                  >
                    Add New Doctor
                  </button>
                  <button
                    className="buttonblack responsive-button"
                    onClick={() => {
                      setIsNurseModalOpen(false);
                      setNewNurseName('');
                    }}
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
                    {vitals && Object.keys(vitals).length > 0 ? (
                      Object.keys(vitals).map((item, index) => (
                        <div className="vitals-column" key={index}>
                          <label>{item}</label>
                          <input
                            name={item}
                            value={vitals[item] || ""}
                            onChange={handleVitalsChange}
                            className="responsive-input"
                            rows="4"
                            cols="50"
                          />
                        </div>
                      ))
                    ) : (
                      <p>Data illa da daii</p>
                    )}
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
                                  className="buttonred responsive-button"
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
                        value={familyHistoryInput}
                        onChange={(e) => setFamilyHistoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddHistoryItem(familyHistoryInput, familyHistory, setFamilyHistory);
                            setFamilyHistoryInput("")
                            e.target.value = ""
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
                        value={birthHistoryInput}
                        onChange={(e) => setBirthHistoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddHistoryItem(birthHistoryInput, birthHistory, setBirthHistory);
                            setBirthHistoryInput("")
                            e.target.value = ""
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
                        value={surgicalHistoryInput}
                        onChange={(e) => setSurgicalHistoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddHistoryItem(
                              surgicalHistoryInput,
                              surgicalHistory,
                              setSurgicalHistory
                            );
                            setSurgicalHistoryInput("")
                            e.target.value = ""
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
                        value={otherHistoryInput}
                        onChange={(e) => setOtherHistoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddHistoryItem(otherHistoryInput, otherHistory, setOtherHistory);
                            otherHistoryInput("")
                            e.target.value = ""
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
                                  onClick={() => handleDental(option, selectedTooth)}
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
                            type="checkbox"
                            className="checkbox-input"
                            checked={selectonexamination[field] === 1}
                            onChange={(e) => {
                              setSelectonexamination(prev => ({
                                ...prev,
                                [field]: e.target.checked ? 1 : 0
                              }));
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
                            className="checkbox-input"
                            checked={selectsystematic[field] === 1}
                            onChange={(e) => {
                              setSelectsystematic(prev => ({
                                ...prev,
                                [field]: e.target.checked ? 1 : 0
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
                            type="checkbox"
                            className="checkbox-input"
                            checked={selectavailableTests[field] === 1}
                            onChange={(e) => {
                              setSelectavailableTests(prev => ({
                                ...prev,
                                [field]: e.target.checked ? 1 : 0
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
                        onChange={(e) => setLocal(e.target.value)}
                        className="local-examination-textarea"
                      />
                    </div>
                    <div className="diagnosis-column">
                      <label>Diagnosis</label>
                      <textarea
                        placeholder="Type"
                        value={dignosis}
                        onChange={(e) => setDignosis(e.target.value)}
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
                                  onClick={() => handleDeleteHistory(treatment, setTreatment, item)}
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
                                  onBlur={() => setTimeout(() => setTreatmentgivennameSuggestions([]), 200)}
                                  placeholder="Name"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={treatmentgivennameSuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    setTreatmentgivenname(suggestion);
                                    setTreatmentgivennameSuggestions([]);
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
                                    setTreatmentdosage(suggestion);
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
                                  onChange={handleRoa}
                                  onBlur={() => setTimeout(() => setRoaSuggestion([]), 200)}
                                  placeholder="Route of Administration"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={roaSuggestion}
                                  onSuggestionClick={(suggestion) => {
                                    setTreatmentrout(suggestion);
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
                                  onChange={handlePrescriptionDosageChange}
                                  onBlur={() => setTimeout(() => setPrescriptiondosagesuggestion([]), 200)}
                                  placeholder="Dosage"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={prescriptiondosagesuggestion}
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
                                  onBlur={() => setTimeout(() => setTimingSuggestions([]), 200)}
                                  placeholder="Timing"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={timingSuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    setTiming(suggestion);
                                    setTimingSuggestions([]);
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
                                  onBlur={() => setTimeout(() => setDurationsuggestions([]), 200)}
                                  placeholder="Duration"
                                  className="responsive-input"
                                />
                                <SuggestionList
                                  suggestions={durationsuggestions}
                                  onSuggestionClick={(suggestion) => {
                                    setDuration(suggestion);
                                    setDurationsuggestions([]);
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
                        onChange={(e) => setFollowupdate(e.target.value)}
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
                          onBlur={() => setTimeout(() => setAdvicegivenSuggestions([]), 200)}
                          className="advice-given-textarea"
                        />
                        <SuggestionList
                          suggestions={advicegivenSuggestions}
                          onSuggestionClick={(suggestion) => {
                            setAdvicegiven(suggestion);
                            setAdvicegivenSuggestions([]);
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
        .buttongrey {
          background-color: #6c757d;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .buttongrey:hover {
          background-color: #5a6268;
        }
        .buttondelete {
          background-color: #dc3545;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .buttondelete:hover {
          background-color: #c82333;
        }
        .responsive-button {
          width: 100%;
          margin: 5px;
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
          border-bottom: 1px solid #eee;
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
        .dental-tooth-cell.has-value {
          background-color: #e0f7fa;
        }
        .dental-table {
          width: 100%;
          border-collapse: collapse;
        }
        .dental-tooth-cell {
          border: 1px solid #ccc;
          padding: 5px;
          text-align: center;
          cursor: pointer;
        }
        .tooth-number {
          font-weight: bold;
        }
        .tooth-condition {
          font-size: 0.9em;
        }
        .responsive-input {
          width: 100%;
          padding: 8px;
          margin: 5px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .responsive-textarea {
          width: 100%;
          padding: 8px;
          margin: 5px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: vertical;
        }
        .vitals-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .vitals-column {
          flex: 1 1 200px;
        }
        .history-section {
          margin-bottom: 20px;
        }
        .responsive-table {
662          width: 100%;
          border-collapse: collapse;
        }
        .responsive-table th, .responsive-table td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }
        .file-upload-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .file-list-section {
          margin-top: 20px;
        }
        .file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .file-preview {
          max-width: 100px;
          max-height: 100px;
        }
        .local-examination-textarea, .diagnosis-textarea, .advice-given-textarea {
          height: 100px;
        }
        .suggestions-dropdown {
          position: absolute;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
        }
        .suggestion-item {
          padding: 8px;
          cursor: pointer;
        }
        .suggestion-item:hover {
          background-color: #f0f0f0;
        }
        @media (min-width: 768px) {
          .responsive-button {
            width: auto;
            margin: 0 5px;
          }
          .file-upload-controls {
            flex-direction: row;
          }
        }
      `}</style>
    </>
  );
};

export default AdminFormOut;