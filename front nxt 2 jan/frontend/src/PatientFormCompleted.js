import React, { useState, useEffect, useRef } from 'react';
import './PatientsForm.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import templateImage from './images/templatepre.jpg';
import letterpadImage from './images/Letterpad.jpg';

const toothMapping = {
  1: '18', 2: '17', 3: '16', 4: '15', 5: '14', 6: '13', 7: '12', 8: '11',
  9: '21', 10: '22', 11: '23', 12: '24', 13: '25', 14: '26', 15: '27', 16: '28',
  17: '38', 18: '37', 19: '36', 20: '35', 21: '34', 22: '33', 23: '32', 24: '31',
  25: '48', 26: '47', 27: '46', 28: '45', 29: '44', 30: '43', 31: '42', 32: '41'
};

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

const PatientFormCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = localStorage.getItem('authToken');

  const [urlParams, setUrlParams] = useState({
    locaationlogin: '',
    businessName: '',
    name: '',
    id: '',
    visited: '',
    nursename: '',
    doctorname: '',
  });
  const [familyHistoryInput, setFamilyHistoryInput] = useState("");
  const [birthHistoryInput, setBirthHistoryInput] = useState("");
  const [surgicalHistoryInput, setSurgicalHistoryInput] = useState("");
  const [otherHistoryInput, setOtherHistoryInput] = useState("");
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
  const [doctorName, setDoctorName] = useState('');
  const [nurseName, setNurseName] = useState('');
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
  const [dental, setdental] = useState({});
  const [dentalOptions, setDentalOptions] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [docname, setdocname] = useState('')
  const [Name, setname] = useState('')
  const [Number, setNumber] = useState('')
  const [Id, setid] = useState('')
  const [visit, setvisit] = useState("")
  const [Nurse, setnurse] = useState("")
  const [visitlocation, setvisitlocation] = useState('')
  const [basic,setbasic]=useState({})

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

  const addOneDay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      locaationlogin: searchParams.get('loginlocation'),
      businessName: searchParams.get('businessname'),
      name: searchParams.get('name'),
      id: searchParams.get('id'),
      visited: searchParams.get('visited'),
      nursename: searchParams.get('nursename'),
      doctorname: searchParams.get('doctorname'),
    };
  };

  const fetchDentalOptions = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/dental-suggestions');
      setDentalOptions(response.data);
    } catch (error) {
      console.error('Error fetching dental options:', error);
    }
  };


  // Send to bill
  const handleSendToBill = async () => {
    handleSubmit()
    const { name, businessName, visited, loginLocation, franchiselocation } = urlParams;
    try {
      const response = await axios.post('https://amrithaahospitals.visualplanetserver.in/update-status', {
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

  useEffect(() => {
    fetchDentalOptions();
  }, []);

  const handleGeneratePrescription = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = templateImage;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 210, 297);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 45, 190, 12, 'FD');

      doc.text(`Name: ${urlParams.name || 'youtube'}`, 13, 53);
      doc.text(`A/G: ${vitals.Age || '32'} Years / ${vitals.Gender || 'Male'}`, 60, 53);
      doc.text(`Patient ID: ${urlParams.id || 'ITK00117513'}`, 110, 53);
      doc.text(`Date: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, 150, 53);

      const vitalsToExclude = ['Age', 'Gender', 'Name', 'Phone_number', 'Visit'];
      const filteredVitals = Object.entries(vitals).filter(([key, value]) => !vitalsToExclude.includes(key) && value);

      const vitalBoxHeight = 20;
      const columnWidth = 38;
      let row1Y = 65;
      let row2Y = 75;

      filteredVitals.forEach(([key, value], index) => {
        const vitalText = `${key}: ${value}`;
        const columnIndex = index % 5;
        const xPosition = 15 + columnIndex * columnWidth;
        const yPosition = index < 5 ? row1Y : row2Y;
        doc.text(vitalText, xPosition, yPosition);
      });

      const nextSectionY = 70 + vitalBoxHeight + 10;

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

  const fetchvitalsinput = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/column-vitals');
      const data = await response.data;
      const filteredData = data.filter(col => col !== 'Name' && col !== 'Visit' && col !== 'Phone number');
      const vitalsObject = Object.fromEntries(filteredData.map(field => [field, '']));
      setvitalsinput(vitalsObject);
    } catch (error) {
      console.error('Error fetching vitals input:', error);
    }
  };

  const apifetchData = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/get-data', {
        params: {
          businessname: urlParams.businessName,
          name: urlParams.name,
          visited: urlParams.visited
        }
      });
      console.log("to find=>>", response.data.patient[response.data.patient.length - 1].doctor_name)
      setdocname(response.data.patient[response.data.patient.length - 1].doctor_name)
      const data = response.data;
      setapidata(data);
      // const lastPatient = apidata?.patient?.[apidata.patient.length - 1];
      // if (lastPatient) {
      //   console.log("to find =>>", lastPatient.doctor_name);
      //   setdocname(lastPatient.doctor_name);
      // }
      const visit = await axios.get('https://amrithaahospitals.visualplanetserver.in/get-visited', {
        params: {
          phone_number: urlParams.businessName,
          full_name: urlParams.name,
        },
      });

      setVisitedCount(visit.data);
      const res = await axios.get(`https://amrithaahospitals.visualplanetserver.in/getvitals/${urlParams.name}/${urlParams.visited}/${urlParams.businessName}`);
      setVitals(res.data[0] || {});
      setdental(data.dental)
      const transformed = {};
      Object.keys(data.dental).forEach((key) => {
        transformed[key] = { mapped: data.dental[key] };
      });
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
      console.log("dental->", data.dental)
      if (data.dental) {

        setdental(data.dental);
      } else {
        setdental({});
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
      const onExamCheckboxState = convertArrayToCheckboxState(data.onexamform);
      setselectonexamination(onExamCheckboxState);
      setselectsystematic(convertArrayToCheckboxState(data.sysexam_forms));
      setselectavailableTests(convertArrayToCheckboxState(data.testtotake));
      const fileResponse = await axios.get(`https://amrithaahospitals.visualplanetserver.in/files/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`);
      if (fileResponse.data.files) {
        setUploadedFiles(fileResponse.data.files);
      }
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

  const basicData=async()=>{
    const searchParams = new URLSearchParams(location.search);
    // setUrlParams(getUrlParams());
    // console.log("sdfghsfjgn",urlParams)
    const res= await axios.get(`https://amrithaahospitals.visualplanetserver.in/get-basic-detail/${searchParams.get('id')}/${searchParams.get('name')}/${searchParams.get('businessname')}/${searchParams.get('visited')}`)
    console.log(res)
    setbasic(res.data)
  }
  useEffect(() => {
    setUrlParams(getUrlParams());
  }, [location]);

  useEffect(() => {
    if (urlParams.businessName && urlParams.visited) {
      fetchImage(urlParams.businessName, urlParams.visited);
      basicData()
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
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
        text: 'Unable to access the back camera. Please allow camera permissions and ensure a back camera is available.',
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
    const onExaminationArray = Object.entries(selectonexamination)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    const systematicArray = Object.entries(selectsystematic)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    const testsArray = Object.entries(selectavailableTests)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    const formData = {
      dignosis,
      vitals,
      majorComplaints,
      familyHistory:finalFamilyHistory,
      birthHistory:finalBirthHistory,
      surgicalHistory:finalSurgicalHistory,
      otherHistory:finalOtherHistory,
      selectavailableTests: testsArray,
      selectonexamination: onExaminationArray,
      selectsystematic: systematicArray,
      followupdate: followupdate || null,
      advicegiven,
      treatment,
      prescription,
      local,
      doctorName: urlParams.doctorname,
      nurseName: urlParams.nursename,
      name: urlParams.name,
      businessName: urlParams.businessName,
      visited: urlParams.visited,
      id: urlParams.id,
    };

    try {
      const transformedDental = {};
      for (let i = 1; i <= 32; i++) {
        const toothNumber = toothMapping[i];
        transformedDental[i] = dental[toothNumber] || null;
      }
      formData.vitals.Phone_number = urlParams.businessName;
      formData.vitals.Name = urlParams.name;
      formData.vitals.Visit = urlParams.visited;
      formData.tooth = dental;

      const vitalsColumnsResponse = await axios.get('https://amrithaahospitals.visualplanetserver.in/column-vitals');
      const validColumns = vitalsColumnsResponse.data;

      const replaceSpacesInKeys = (obj) => {
        return Object.keys(obj).reduce((acc, key) => {
          const newKey = key.replace(" ", "_");
          if (validColumns.includes(newKey) || ['Name', 'Phone_number', 'Visit'].includes(newKey)) {
            acc[newKey] = obj[key];
          }
          return acc;
        }, {});
      };
      const currentVitals = { ...vitals };
      currentVitals.Phone_number = urlParams.businessName;
      currentVitals.Name = urlParams.name;
      currentVitals.Visit = urlParams.visited;

      const updatedVitals = replaceSpacesInKeys(formData.vitals);
      formData.vitals = updatedVitals;
      console.log(dental, surgicalHistory);
      const response = await axios.put('https://amrithaahospitals.visualplanetserver.in/update-datas', { formData, vitals });
      console.log("res from update-datas->", response)
      if (multipleFiles.length > 0) {
        const fileData = new FormData();
        multipleFiles.forEach((file) => fileData.append('upload', file));
        const fileUploadResponse = await axios.post(
          `https://amrithaahospitals.visualplanetserver.in/upload/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`,
          fileData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Patient data and files uploaded successfully.',
        confirmButtonText: 'OK',
      });
      if (multipleFiles) {
        const fileResponse = await axios.get(
          `https://amrithaahospitals.visualplanetserver.in/files/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`
        );

        if (fileResponse.data.files) {
          setUploadedFiles(fileResponse.data.files);
        }
      }
      setMultipleFiles([]);
    } catch (error) {
      console.error('Error in handleSubmit:', error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error Saving Data',
        text: `Failed to save data: ${error.message}. Please check the form and try again.`,
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
      treatmentrout: document.querySelector('input[placeholder="Route of Administration"]').value,
      treatmentgivenname: document.querySelector('input[placeholder="Name"]').value
    };
    if (newTreatment.treatmentdosage && newTreatment.treatmentrout && newTreatment.treatmentgivenname) {
      settreatment([...treatment, newTreatment]);
      document.querySelector('input[placeholder="Dosage"]').value = '';
      document.querySelector('input[placeholder="Route of Administration"]').value = '';
      document.querySelector('input[placeholder="Name"]').value = '';
    }
  };

  const [newPrescription, setNewPrescription] = useState({
    medicine: '',
    dosage: '',
    timing: '',
    duration: ''
  });

  const handleAddPrescription = () => {
    const row = document.querySelector('.add-prescription-row');
    const newPrescription = {
      medicine: row.querySelector('input[placeholder="Medicine"]').value,
      dosage: row.querySelector('input[placeholder="Dosage"]').value,
      timing: row.querySelector('input[placeholder="Timing"]').value,
      duration: row.querySelector('input[placeholder="Duration"]').value
    };

    if (
      newPrescription.medicine &&
      newPrescription.dosage &&
      newPrescription.timing &&
      newPrescription.duration
    ) {
      setPrescription([...prescription, newPrescription]);
      row.querySelector('input[placeholder="Medicine"]').value = '';
      row.querySelector('input[placeholder="Dosage"]').value = '';
      row.querySelector('input[placeholder="Timing"]').value = '';
      row.querySelector('input[placeholder="Duration"]').value = '';
    }
  };

  const handleGenerateTestReport = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = letterpadImage;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 210, 297);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      doc.text(`${urlParams.name || 'Patient Name'}`, 45, 75);
      doc.text(`${vitals.Age || '32'} Years / ${vitals.Gender || 'Male'}`, 137, 75);
      doc.text(`${new Date().toLocaleString('en-US', { dateStyle: 'medium' })}`, 173, 67.5);

      const selectedTests = Object.keys(selectavailableTests)
        .filter((key) => selectavailableTests[key])
        .map((key) => {
          return (
            availableTests.find(
              (test) => test.toLowerCase().replace(/\s+/g, '') === key
            ) || key
          );
        });

      let yPosition = 130;

      if (selectedTests.length > 0) {
        selectedTests.forEach((test, index) => {
          doc.text(`${index + 1}. ${test}`, 50, yPosition);
          yPosition += 8;
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

  const handleAddHistoryItem = (newHistoryItem, historyList, setHistoryList) => {
    if (!historyList.includes(newHistoryItem) && newHistoryItem.trim() !== '') {
      setHistoryList([...historyList, newHistoryItem]);
    }
  };

  const handleEditTreatment = (index) => {
    const item = treatment[index];
    document.querySelector('input[placeholder="Name"]').value = item.treatmentgivenname;
    document.querySelector('input[placeholder="Dosage"]').value = item.treatmentdosage;
    document.querySelector('input[placeholder="Route of Administration"]').value = item.treatmentrout;
    handleDeleteHistory(treatment, settreatment, item);
  };

  const handleEditPrescription = (index) => {
    const item = prescription[index];
    document.querySelector('input[placeholder="Duration"]').value = item.duration;
    document.querySelector('input[placeholder="Timing"]').value = item.timing;
    document.querySelector('input[id="dos"]').value = item.dosage;
    document.querySelector('input[placeholder="Medicine"]').value = item.medicine;
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
    navigate(`/PatientFormCompleted?loginlocation=${username}&businessname=${businessname}&name=${name}&visited=${i}&id=${urlParams.id}&doctorname=${urlParams.doctorname}&nursename=${urlParams.nursename}`);
  };

  const TabButton = ({ visitedCount, handlevisitedpage }) => {
    return (
      <div className="tab-button-container">
        {Array.from({ length: visitedCount }, (_, i) => visitedCount - i).map((num) => (
          <button
            onClick={() => handlevisitedpage(num)}
            className={`custom-tab-button ${urlParams.visited == num ? 'active' : ''}`}
            key={num}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  const handledental = (value, toothNumber) => {
    setdental((prev) => ({
      ...prev,
      [toothNumber]: value,
    }));
    setSelectedTooth(null);
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
                  <span className="info-label">Location:</span>
                  <span className="info-value">
                    {basic.belongedlocation ? basic.belongedlocation:""}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nurse:</span>
                  <span className="info-value">
                    {basic.nursename ? basic.nursename : "Not Checked by any nurse"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Doctor:</span>
                  <span className="info-value">
                    {basic.doctorname ? basic.doctorname : "Not Checked by any doctor"}
                  </span>
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
                          ].map((toothNumber, index) => (
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
                                className="buttondred responsive-button"
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
                                className="buttondred responsive-button"
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
                                className="buttondred responsive-button"
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
                      className="responsive-textarea local-examination-textarea"
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
                    {onexamination.length > 0 ? (
                      onexamination.map((field, index) => (
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
                      ))
                    ) : (
                      <p>No examination fields available</p>
                    )}
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
                      <div className="modal-image-container">
                        <img
                          src={`https://amrithaahospitals.visualplanetserver.in/${uploadedFiles[currentImageIndex].FilePath}`}
                          alt={uploadedFiles[currentImageIndex].File_Name}
                          className="modal-image"
                          onError={(e) => {
                            console.error('Error loading image:', e.target.src);
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                            Swal.fire({
                              icon: 'error',
                              title: 'Image Load Error',
                              text: 'Failed to load the image. Displaying placeholder.',
                            });
                          }}
                          onLoad={() => console.log('Image loaded successfully:', `https://amrithaahospitals.visualplanetserver.in/${uploadedFiles[currentImageIndex].FilePath}`)}
                        />
                      </div>
                    </>
                  ) : (
                    <p>No images available</p>
                  )}
                  <div className="modal-buttons">
                    <button
                      onClick={handlePrevImage}
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
                      className="responsive-textarea local-examination-textarea"
                    />
                  </div>
                  <div className="vitals-column">
                    <label>Diagnosis</label>
                    <textarea
                      placeholder="Type"
                      value={dignosis || ''}
                      onChange={(e) => setdignosis(e.target.value)}
                      className="responsive-textarea local-examination-textarea"
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
                            <td data_title="Name">{item.treatmentrout}</td>
                            <td data-title="Dosage">{item.treatmentdosage}</td>
                            <td data-title="Route of Administration">{item.treatmentgivenname}</td>
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
                          <td data_title="Name">
                            <input
                              type="text"
                              placeholder="Name"
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
                        <tr className="add-prescription-row">
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
                              id="dosage"
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
            <button className="buttonblack responsive-button btn-save" onClick={() => setTimeout(handleSubmit, 0)}>Save</button>

            <button className="buttonblue responsive-button btn-bill" onClick={handleSendToBill}>Send to Bill</button>

            <button
              className="buttongrey responsive-button btn-generate"
              onClick={handleGeneratePrescription}
            >
              Generate Prescription
            </button>
            <button
              className="buttonred responsive-button btn-test"
              onClick={handleGenerateTestReport}
            >
              Test Report Requirement
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientFormCompleted;