import React, { useState, useEffect, useRef } from 'react';
import style from './style/PatientsForm.module.css';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import templateImage from './images/templatepre.jpg';
import letterpadImage from './images/Letterpad.jpg';
import { jwtDecode } from "jwt-decode";
import SuggestionList from './suggestionList.jsx';
import HistorySection from './HistorySection.jsx';

const toothMapping = {
  1: '18', 2: '17', 3: '16', 4: '15', 5: '14', 6: '13', 7: '12', 8: '11',
  9: '21', 10: '22', 11: '23', 12: '24', 13: '25', 14: '26', 15: '27', 16: '28',
  17: '38', 18: '37', 19: '36', 20: '35', 21: '34', 22: '33', 23: '32', 24: '31', 74: '74',
  25: '48', 26: '47', 27: '46', 28: '45', 29: '44', 30: '43', 31: '42', 32: '41', 56: '56'
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

const PatientForm = () => {
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
    franchiselocation: '',
  });
  const [familyHistoryInput, setFamilyHistoryInput] = useState("");
  const [birthHistoryInput, setBirthHistoryInput] = useState("");
  const [surgicalHistoryInput, setSurgicalHistoryInput] = useState("");
  const [otherHistoryInput, setOtherHistoryInput] = useState("");
  const [majorComplaints, setMajorComplaints] = useState('');
  const [oralHygiene, setOralHygiene] = useState('')
  const [familyHistory, setFamilyHistory] = useState([]);
  const [birthHistory, setBirthHistory] = useState([]);
  const [surgicalHistory, setSurgicalHistory] = useState([]);
  const [otherHistory, setOtherHistory] = useState([]);
  const [pastMedicalHistory, setPastMedicalHistory] = useState([])
  const [pastDentalHistory, setPastDentalHistory] = useState([])
  const [pastMedicationHistory, setPastMedicationHistory] = useState([]);
  const [allergyHistory, setAllergyHistory] = useState([])
  const [habitHistory, setHabitHistory] = useState([])
  const [pastMedicalHistoryInput, setPastMedicalHistoryInput] = useState("")
  const [pastDentalHistoryInput, setPastDentalHistoryInput] = useState("")
  const [pastMedicationHistoryInput, setPastMedicationHistoryInput] = useState("");
  const [allergyHistoryInput, setAllergyHistoryInput] = useState("")
  const [habitHistoryInput, setHabitHistoryInput] = useState("")
  const [followupdate, setfollowupdate] = useState('');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false)
  const [advicegiven, setadvicegiven] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [dignosis, setdignosis] = useState('');
  const [local, setlocal] = useState('');
  const [vitals, setVitals] = useState({});
  const [doctorName, setDoctorName] = useState('');
  const [nurseName, setnurseName] = useState('');
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
  const [vitalinput, setvitalinput] = useState([])
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
    oralHygiene: true,
    investigation: true,
    finaldiagonsis: true,
    dignosis: true,
  });
  const [basic, setbasic] = useState({})
  const [tokendecode, settokendecode] = useState({})
  const { type } = useParams();
  const [nurseSuggestions, setNurseSuggestions] = useState([]);
  const [docSuggestions, setDocSuggestions] = useState([])
  const [newDocName, setNewDocName] = useState('');
  const [newNurseName, setNewNurseName] = useState('')
  const [cookie, setCookie] = useState({})
  const rowRef = useRef(null);
  const [treatmentgivennameSuggestions, setTreatmentgivennameSuggestions] = useState([]);
  const [dosageSuggestions, setDosageSuggestions] = useState([]);
  const [roaSuggestion, setRoaSuggestion] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [prescriptiondosagesuggestion, setPrescriptiondosagesuggestion] = useState([]);
  const [timingSuggestions, setTimingSuggestions] = useState([]);
  const [durationsuggestions, setDurationsuggestions] = useState([]);
  const [advicegivenSuggestions, setAdvicegivenSuggestions] = useState([]);
  // const [advicegiven, setAdvicegiven] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('');
  const [duration, setDuration] = useState('');
  const [treatmentdosage, setTreatmentdosage] = useState('');
  const [treatmentrout, setTreatmentrout] = useState('');
  const [treatmentgivenname, setTreatmentgivenname] = useState('');
  const [tmj, setTmj] = useState([])
  const [tmjInput, setTmjInput] = useState("")
  const [salivary, setSalivary] = useState([])
  const [salivaryInput, setSalivaryInput] = useState('')
  const [lymph, setLymph] = useState([])
  const [lymphInput, setLymphInput] = useState('')
  const [otherFinding, setOtherFinding] = useState([])
  const [OtherFindingInput, setOtherFindingInput] = useState('')
  const [softTissue, setSoftTissue] = useState([])
  const [softTissueInput, setSoftTissueInput] = useState('')
  const [malocclusion, setMalocclusion] = useState([])
  const [malocclutionInput, setMalocclusionInput] = useState('')
  const [localFactor, setLocalFactor] = useState([])
  const [localFactorInput, setLocalFactorInput] = useState('')
  const [bloodInvestigation, setBloodInvestigation] = useState([])
  const [radiographyInvestigation, setRadiographyInvestigation] = useState([])
  const [histopathologicalInvestigation, setHistopathologicalInvestigation] = useState([])
  const [otherInvestigation, setOtherInvestigation] = useState([])
  const [bloodInvestigationInput, setBloodInvestigationInput] = useState('')
  const [radiographyInvestigationInput, setRadiographyInvestigationInput] = useState('')
  const [histopathologicalInvestigationInput, setHistopathologicalInvestigationInput] = useState('')
  const [otherInvestigationInput, setOtherInvestigationInput] = useState('')
  const [finaldiagonsis, setFinaldiagonsis] = useState('')
  const [treatmentPlan, setTreatmentPlan] = useState([])
  const [procedureDone, setProcedureDone] = useState([])
  const [treatmentPlanInput, setTreatmentPlanInput] = useState('')
  const [procedureDoneInput, setProcedureDoneInput] = useState('')
  const [moa, setMoa] = useState('')
  const [moaSuggestion, setMoaSuggestion] = useState([])
  const [consultantName, setConsultantName] = useState('')
  const [followUpTime, setFollowUpTime] = useState('')
  const [reviewCall, setReviewCall] = useState()
  useEffect(() => {
    if (auth) {
      try {
        const decoded = jwtDecode(auth);
        console.log(decoded)
        setCookie(decoded);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
    if (!auth) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Authenticated',
        text: 'Please log in to access this page.',
      });
      navigate('/');
    }
    if (type != 'admin') {
      setIsOpen({
        investgation: false,
        finaldiagonsis: false,
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
        oralHygiene: false,
        dignosis: false,
      })
    }
  }, [auth, navigate]);

  function addOneDay(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
      console.error("Invalid date passed to addOneDay:", dateString);
      return ""; // or handle accordingly
    }
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }


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
      franchiselocation: searchParams.get('franchiselocation'),
    };
  };

  const fetchDentalOptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dental-suggestions');
      setDentalOptions(response.data);
    } catch (error) {
      console.error('Error fetching dental options:', error);
    }
  };
  const [isdisable, setisdisable] = useState(true)
  const basicData = async () => {
    const searchParams = new URLSearchParams(location.search);
    // setUrlParams(getUrlParams());
    // console.log("sdfghsfjgn",urlParams)
    const res = await axios.get(`http://localhost:5000/get-basic-detail/${searchParams.get('id')}/${searchParams.get('name')}/${searchParams.get('businessname')}/${searchParams.get('visited')}`)
    // console.log("basic", res)
    setbasic(res.data)
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // console.log("Decoded JWT:", decoded);
        settokendecode(decoded)
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
    setisdisable(basic.status === "billingcompleted" && tokendecode.roll != "admin")
  }
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
        item.moa || 'N/A',
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

  const fetchImage = async (phoneNumber, visited) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user-photo`, {
        params: { phoneNumber, visited },
      });
      setImageUrl(response.data.imageUrl);
      // console.log("image", response.data.imageUrl)
    } catch (error) {
      console.error('Error fetching image:', error);
      setImageUrl(null);
    }
  };

  const fetchvitalsinput = async () => {
    try {
      const response = await fetch('http://localhost:5000/column-vitals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      const filteredData = data.filter(col => col !== 'Name' && col !== 'Visit' && col !== 'Phone number');
      const vitalsObject = Object.fromEntries(filteredData.map(field => [field, '']));
      // console.log("vital name",vitalsObject)
      // setvitalsinput(vitalsObject);
      setVitals(vitalsObject);
    } catch (error) {
      console.error('Error fetching vitals input:', error);
    }
  };

  const apifetchData = async () => {
    try {
      const params = getUrlParams();
      setUrlParams(params);
      const searchParams = new URLSearchParams(location.search);
      // console.log("url->>", searchParams.get('name'))
      const response = await axios.get('http://localhost:5000/get-data', {
        params: {
          businessname: searchParams.get('businessname'),
          name: searchParams.get('name'),
          visited: searchParams.get('visited')
        }
      });
      console.log("tofind->>", response.data)
      setnurseName(response.data.input[response.data.input.length - 1].nursename)
      setDoctorName(response.data.input[response.data.input.length - 1].doctorname)
      const res = await axios.get(`http://localhost:5000/getvitals/${searchParams.get('name')}/${searchParams.get('visited')}/${searchParams.get('businessname')}`);
      const result = Object.fromEntries(vitalinput.map(key => [key, ""]))
      // setVitals(res.data[res.data.length - 1] || result);
      const vit = res.data
      console.log("length=>", vit.length, "data", vit)
      if (vit.length == 0) {
        // console.log("No visit data");
        fetchvitalsinput();
      } else {
        // console.log("api vitals=>", res.data)
        setVitals(res.data[res.data.length - 1])
      }
      const data = response.data;
      setapidata(data);
      // console.log("api=>", data)
      const visit = await axios.get('http://localhost:5000/get-visited', {
        params: {
          phone_number: searchParams.get('businessname'),
          full_name: searchParams.get('name'),
        },
      });

      setVisitedCount(visit.data);
      // Set vitals based on response or fallback res.data && res.data.length != 0 ? res.data[res.data.length - 1] :

      setdental(data.dental)
      const transformed = {};
      Object.keys(data.dental).forEach((key) => {
        transformed[key] = { mapped: data.dental[key] };
      });
      // setdental(transformed);
      console.log("dental>>", dental)
      // console.log("Last index:", data.patient[data.patient.length - 1]);
      if (data.patient?.length > 0) {
        // data.patient.find(p => p.LocalExamination && p.Dignosis) ||
        const validPatient = data.patient[data.patient.length - 1];

        setMajorComplaints(validPatient.Major_Complaints || '');
        setOralHygiene(validPatient.Oral_Hygiene || "")
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
      if (data.dental && typeof data.dental === 'object') {
        const mappedDental = Object.keys(data.dental).reduce((acc, toothNumber) => {
          const mappedValue = data.dental[toothNumber];
          const condition = Object.keys(conditionMap).find(
            (key) => conditionMap[key] === mappedValue
          ) || mappedValue;
          acc[toothNumber] = { condition, mapped: mappedValue };
          return acc;
        }, {});
      } else {
        setdental({});
      }
      console.log("all data=>", data)
      setConsultantName(data.consultantName||"")
      setReviewCall(data.reviewCall)
      setFollowUpTime(data.followuptime)
      setTreatmentPlan(data.treatment_plan || [])
      setProcedureDone(data.procedure_done || [])
      setFinaldiagonsis(data.patient[data.patient.length - 1].FinalDiagnosis)
      setOtherInvestigation(data.other_investigation)
      setRadiographyInvestigation(data.radiographic_investigation)
      setHistopathologicalInvestigation(data.histopathological_investigation)
      setBloodInvestigation(data.blood_investigation || [])
      setSoftTissue(data.softTissue || [])
      setMalocclusion(data.malocclusion || [])
      setOtherFinding(data.otherFinding || [])
      setLymph(data.lymph || [])
      setTmj(data.tmj || [])
      setLocalFactor(data.localFactor || [])
      setSalivary(data.salivary || [])
      setSurgicalHistory(data.surgicalhistory || []);
      setPastMedicationHistory(data.pastMedicationHistory || []);
      setPastDentalHistory(data.pastDentalHistory || [])
      setPastMedicalHistory(data.pastMedicalHistory || [])
      setAllergyHistory(data.allergyHistory || [])
      setHabitHistory(data.habitHistory || [])
      setPrescription(data.prescriptionForm);
      setFamilyHistory(data.familyHistory || []);
      setBirthHistory(data.birthHistory || []);
      setOtherHistory(data.anyOtherHistory || []);
      settreatment(data.treatmentgivenform || []);
      setseonexam(data.onexamform || []);
      setsesysexam(data.sysexam_forms || []);
      sesetesttotake(data.testtotake || []);
      const onExamCheckboxState = convertArrayToCheckboxState(data.onexamform);
      setselectonexamination(onExamCheckboxState);
      // console.log('On Examination Checkbox State:', onExamCheckboxState);
      setselectsystematic(convertArrayToCheckboxState(data.sysexam_forms));
      setselectavailableTests(convertArrayToCheckboxState(data.testtotake));
      const fileResponse = await axios.get(`http://localhost:5000/files/${searchParams.get('businessname')}/${searchParams.get('visited')}/${searchParams.get('name')}`);
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

  useEffect(() => {
    const params = getUrlParams();
    setUrlParams(params);
    // fetchvitalsinput();
    basicData()
    apifetchData();
    fetchData('http://localhost:5000/api/onexamination', setOnExamination);
    fetchData('http://localhost:5000/api/onsystem', setOnSystem);
    fetchData('http://localhost:5000/tests', setavalableTests);
    fetchData('http://localhost:5000/column-vitals', setvitalinput);

    if (params.businessName && params.visited) {
      fetchImage(params.businessName, params.visited);
    }
  }, [location]);

  useEffect(() => {
    // apifetchData()
    if (apidata?.patient?.length > 0) {
      setlocal(apidata.patient[0].LocalExamination || '');
      setdignosis(apidata.patient[0].Dignosis || '');
    }
  }, [apidata]);


  const handleNextImage = () => {
    // console.log(uploadedFiles.length)
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
          facingMode: 'environment' // Use the back camera
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
    // e.preventDefault();
    if (isdisable) {
      Swal.fire({
        icon: 'warning',
        title: 'Submission Blocked',
        text: 'Patient details cannot be edited or submitted because billing is already completed.'
      });
      return;
    }

    const buildFinalList = (list, input) => {
      const value = input.trim();
      return value ? [...list, value] : [...list];
    };

    const finalFamilyHistory = buildFinalList(familyHistory, familyHistoryInput);
    const finalBirthHistory = buildFinalList(birthHistory, birthHistoryInput);
    const finalSurgicalHistory = buildFinalList(surgicalHistory, surgicalHistoryInput);
    const finalOtherHistory = buildFinalList(otherHistory, otherHistoryInput);

    const finalPastMedicalHistory = buildFinalList(pastMedicalHistory, pastMedicalHistoryInput);
    const finalPastMedicationHistory = buildFinalList(pastMedicationHistory, pastMedicationHistoryInput);
    const finalPastDentalHistory = buildFinalList(pastDentalHistory, pastDentalHistoryInput);

    const finalAllergyHistory = buildFinalList(allergyHistory, allergyHistoryInput);
    const finallHabitHistory = buildFinalList(habitHistory, habitHistoryInput);

    const finalTMJ = buildFinalList(tmj, tmjInput);
    const finalSalivaryGlands = buildFinalList(salivary, salivaryInput)
    const finalLymphNodes = buildFinalList(lymph, lymphInput)
    const finalOtherFindings = buildFinalList(otherFinding, otherHistoryInput)

    const finalSoftTissue = buildFinalList(softTissue, softTissueInput)
    const finalMaloccusion = buildFinalList(malocclusion, malocclutionInput)
    const finalLocalFactor = buildFinalList(localFactor, localFactorInput)

    const finalBloodInvestigation = buildFinalList(bloodInvestigation, bloodInvestigationInput)
    const finalRadiographyInvestigation = buildFinalList(radiographyInvestigation, radiographyInvestigationInput)
    const finalHistopathologialInvestigation = buildFinalList(histopathologicalInvestigation, histopathologicalInvestigationInput)
    const finalOtherInvestigation = buildFinalList(otherInvestigation, otherInvestigationInput)

    const finalTreatmentPlan = buildFinalList(treatmentPlan, treatmentPlanInput)
    const finalProcedureDone = buildFinalList(procedureDone, procedureDoneInput)
    // Transform checkbox states to arrays
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
      followUpTime,
      consultantName,
      reviewCall,
      procedureDone: finalProcedureDone,
      treatmentPlan: finalTreatmentPlan,
      bloodInvestigation: finalBloodInvestigation,
      radiographyInvestigation: finalRadiographyInvestigation,
      histopathologicalInvestigation: finalHistopathologialInvestigation,
      otherInvestigation: finalOtherInvestigation,
      finaldiagonsis,
      softTissue: finalSoftTissue,
      malocclusion: finalMaloccusion,
      localFactor: finalLocalFactor,
      tmj: finalTMJ,
      salivary: finalSalivaryGlands,
      lymphNode: finalLymphNodes,
      otherFinding: finalOtherFindings,
      dignosis,
      vitals,
      majorComplaints,
      familyHistory: finalFamilyHistory,
      birthHistory: finalBirthHistory,
      surgicalHistory: finalSurgicalHistory,
      otherHistory: finalOtherHistory,
      pastMedicalHistory: finalPastMedicalHistory,
      pastDentalHistory: finalPastDentalHistory,
      pastMedicationHistory: finalPastMedicationHistory,
      allergyHistory: finalAllergyHistory,
      habitHistory: finallHabitHistory,
      selectavailableTests: testsArray, // Send array instead of object
      selectonexamination: onExaminationArray, // Send array
      selectsystematic: systematicArray, // Send array
      followupdate,
      advicegiven,
      treatment,
      prescription,
      local,
      doctorName: doctorName,
      nurseName: urlParams.nursename,
      name: urlParams.name,
      businessName: urlParams.businessName,
      visited: urlParams.visited,
      id: urlParams.id,
      oralHygiene,
    };
    console.log("vitals", vitals)
    try {
      // Delete existing records
      // Handle dental data
      const transformedDental = {};
      for (let i = 1; i <= 32; i++) {
        const toothNumber = toothMapping[i];
        transformedDental[i] = dental[toothNumber]?.mapped || null;
      }
      // Update vitals
      formData.vitals.Phone_number = urlParams.businessName;
      formData.vitals.Name = urlParams.name;
      formData.vitals.Visit = urlParams.visited;
      formData.tooth = dental

      const vitalsColumnsResponse = await axios.get('http://localhost:5000/column-vitals');
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
      const currentVitals = { ...vitals }; // force fresh clone
      currentVitals.Phone_number = urlParams.businessName;
      currentVitals.Name = urlParams.name;
      currentVitals.Visit = urlParams.visited;

      const updatedVitals = replaceSpacesInKeys(formData.vitals);
      formData.vitals = updatedVitals;
      console.log("update data=>", formData)

      const response = await axios.put('http://localhost:5000/update-datas', { formData, vitals })
      console.log(response)
      // Save form data
      // const response = await fetch('http://localhost:5000/save-data', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Network response was not ok');
      // }

      // Handle file uploads
      if (multipleFiles.length > 0) {
        const fileData = new FormData();
        multipleFiles.forEach((file) => fileData.append('upload', file));
        const fileUploadResponse = await axios.post(
          `http://localhost:5000/upload/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`,
          fileData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log("Uploaded Files:", fileUploadResponse.data.fileData);
      }

      // const data = await response.json()
      // Refresh uploaded files
      // const fileResponse = await axios.get(
      //   `http://localhost:5000/files/${urlParams.businessName}/${urlParams.visited}/${urlParams.name}`
      // );
      // if (fileResponse.data.files) {
      //   setUploadedFiles(fileResponse.data.files);
      // }
      setMultipleFiles([]);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Patient data and files uploaded successfully.',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Saving Data',
        text: `Failed to save data: ${error.message}. Please check the form and try again.`,
        confirmButtonText: 'OK',
      });
    }
  };
  // useEffect(() => {
  //   console.log("Updated vitals:", vitals);
  // }, [vitals]);

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitals((prevVitals) => ({ ...prevVitals, [name]: value }));
    // console.log("updating vitals",vitals)
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
      document.querySelector('input[placeholder="Name"]').value = ''
      setTreatmentdosage("")
      setTreatmentgivenname("")
      setTreatmentrout("")

    }
  };

  const handleAddPrescription = () => {
    const row = rowRef.current;
    const newPrescription = {
      medicine: row.querySelector('input[placeholder="Medicine"]').value,
      moa: row.querySelector('input[placeholder="MOA"]').value,
      timing: row.querySelector('input[placeholder="Timing"]').value,
      duration: row.querySelector('input[placeholder="Duration"]').value
    };

    if (
      newPrescription.medicine &&
      newPrescription.moa &&
      newPrescription.timing &&
      newPrescription.duration
    ) {
      setPrescription([...prescription, newPrescription]);
      row.querySelector('input[placeholder="Medicine"]').value = '';
      row.querySelector('input[placeholder="MOA"]').value = '';
      row.querySelector('input[placeholder="Timing"]').value = '';
      row.querySelector('input[placeholder="Duration"]').value = '';
      setMedicine("")
      setMoa("")
      setTiming("")
      setDuration("")
    }
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

  const handleAddHistoryItem = (newHistoryItem, historyList, setHistoryList) => {
    if (!historyList.includes(newHistoryItem) && newHistoryItem.trim() !== '') {
      setHistoryList([...historyList, newHistoryItem]);
    }
  };

  const
    handleEditTreatment = (index) => {
      const item = treatment[index];
      document.querySelector('input[placeholder="Name"]').value = item.treatmentgivenname
      document.querySelector('input[placeholder="Dosage"]').value = item.treatmentdosage
      document.querySelector('input[placeholder="Route of Administration"]').value = item.treatmentrout
      handleDeleteHistory(treatment, settreatment, item);
    };

  const handleEditPrescription = (index) => {
    setMoa(prescription[index].moa)
    setDuration(prescription[index].duration)
    setMedicine(prescription[index].medicine)
    setTiming(prescription[index].timing)
    handleDeleteHistory(prescription, setPrescription, item);
  };

  const fetchData = async (url, setData) => {
    try {
      console.log("type", type)
      const response = await fetch(url);
      const data = await response.json();
      // console.log("fetch",data)
      setData(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  const handlevisitedpage = (i) => {
    const username = urlParams.locaationlogin;
    const businessname = urlParams.businessName;
    const name = urlParams.name;
    navigate(`/patient-follow/${type}?loginlocation=${username}&businessname=${businessname}&name=${name}&visited=${i}&id=${urlParams.id}&doctorname=${urlParams.doctorname}&nursename=${urlParams.nursename}`);
  };
  const tabcss = (num) => {
    const visited = Number(urlParams.visited);

    return `${style.custom_tab_button} ${visited === num ? style.custom_tab_button_active : ""}`;
  };
  const TabButton = ({ visitedCount, handlevisitedpage }) => {
    return (
      <div className={style.tab_button_container}>
        {Array.from({ length: visitedCount }, (_, i) => visitedCount - i).map((num) => (
          <button
            onClick={() => handlevisitedpage(num)}
            className={tabcss(num)}
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
  const handleSendToBill = async () => {

    const { name, businessName, visited, loginLocation, franchiselocation } = urlParams;
    try {
      const response = await axios.put('http://localhost:5000/update-status', {
        name,
        businessName,
        visited: visited || 0,
        status: 'doctorcompleted'
      });
      console.log("update", response)
      handleSubmit();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Patient status updated to doctorcompleted.',
        confirmButtonText: 'OK',
      });
      navigate(`/patients-followup/${type}?loginlocation=${loginLocation}&franchiselocation=${franchiselocation}`, { replace: true, });
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

  const fetchNurseSuggestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/nurse-suggestions', {
        params: { franchiselocation: urlParams.franchiselocation }
      });
      setNurseSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching doctor suggestions:', error);
      setNurseSuggestions([]);
    }
  }
  const fetchDocSuggestions = async () => {
    try {
      console.log(urlParams)
      console.log("Fetching doctors for location:", urlParams.franchiselocation);
      const response = await axios.get('http://localhost:5000/api/doctor-suggestions', {
        params: { franchiselocation: urlParams.franchiselocation }
      });
      setDocSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching doctor suggestions:', error);
      setDocSuggestions([]);
    }
  };
  const nursecss = (doctor) => {
    return `${style.nurse_listbox_item} ${doctorName === doctor ? style.selected : ''}`
  }

  const handleAddNurseName = async (name) => {
    try {
      const req = await axios.post("http://localhost:5000/addNurseName", { nurseName: name, location: urlParams.franchiselocation })
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'New nurse name added successfully.',
        confirmButtonText: 'OK',
      });
    } catch (err) {
      console.log(err)
      Swal.fire({
        icon: 'error',
        title: 'Error Saving Data',
        text: `Failed to save data: ${err.message}. Please check the form and try again.`,
        confirmButtonText: 'OK',
      });
    }
  }
  const handleAddDoctorName = async (name) => {
    try {
      const req = await axios.post("http://localhost:5000/addDoctorName", { doctorName: name, location: urlParams.franchiselocation })
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'New doctor name added successfully.',
        confirmButtonText: 'OK',
      })
    } catch (err) {
      console.log(err)
      Swal.fire({
        icon: 'error',
        title: 'Error Saving Data',
        text: `Failed to save data: ${err.message}. Please check the form and try again.`,
        confirmButtonText: 'OK',
      });
    }
  }
  const handleForward = async () => {
    const urlParams = getUrlParams();
    const formData = {
      vitals,
      majorComplaints,
      ...urlParams,
      nurseName,
    };
    try {
      if (!urlParams.name || !urlParams.businessName || !urlParams.visited) {
        await Swal.fire({
          icon: 'warning',
          title: 'Missing Data',
          text: 'Please ensure Name, Phone Number, and Visit are provided in the URL parameters.',
          confirmButtonText: 'OK',
        });
        return;
      }

      // if (!vitals['Blood Type'] || vitals['Blood Type'].trim() === '') {
      //   await Swal.fire({
      //     icon: 'warning',
      //     title: 'Missing Blood Type',
      //     text: 'Please enter a valid Blood Type.',
      //     confirmButtonText: 'OK',
      //   });
      //   return;
      // }

      const vitalsData = {
        ...vitals,
        Name: urlParams.name,
        Phone_number: urlParams.businessName,
        Visit: urlParams.visited
      };

      console.log("Vitals Data to Send:", vitalsData);

      const vitalsResponse = await axios.post(
        `http://localhost:5000/adddata-vitals/`,
        vitalsData
      );

      if (!vitalsResponse.data || !vitalsResponse.data.message.includes("success")) {
        throw new Error("Failed to save vitals: " + (vitalsResponse.data?.message || "Unknown error"));
      }

      formData.Phone_number = urlParams.businessName;
      console.log(urlParams.franchiselocation)
      formData.location = urlParams.franchiselocation;
      console.log("Nurse Form Data to Send:", formData);
      const response = await axios.post(
        'http://localhost:5000/save-data-nurse',
        formData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.data || !response.data.message.includes("successfully")) {
        throw new Error("Failed to save nurse data: " + (response.data?.message || "Unknown error"));
      }

      await Swal.fire({
        icon: 'success',
        title: 'Patient Checked!',
        text: 'The Patient Checked Successfully.',
        confirmButtonText: 'OK',
      });
      // navigate(`/nursefollow?loginlocation=${urlParams.loginLocation}&franchiselocation=${urlParams.franchiselocation}`, { replace: true });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'An Error Occurred!',
        text: error.message || 'Something went wrong while checking the patient. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

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

  const handleTreatmentNameChange = (e) => {
    const value = e.target.value;
    setTreatmentgivenname(value);
    fetchSuggestions(
      value,
      'http://localhost:5000/api/treatment-name-suggestions',
      setTreatmentgivennameSuggestions
    );
  };

  const handleMedicineChange = (e) => {
    const value = e.target.value;
    setMedicine(value);
    fetchSuggestions(value, 'http://localhost:5000/api/drugs-suggestions', setMedicineSuggestions);
  };

  const handleDosageChange = (e) => {
    const value = e.target.value;
    setTreatmentdosage(value);
    fetchSuggestions(value, 'http://localhost:5000/api/dosage-suggestions', setDosageSuggestions);
  };

  const handleRoa = (e) => {
    const value = e.target.value;
    setTreatmentrout(value);
    fetchSuggestions(value, 'http://localhost:5000/api/roa-suggestions', setRoaSuggestion);
  };

  const handlePrescriptionMoaChange = (e) => {
    const value = e.target.value;
    setMoa(value);
    fetchSuggestions(value, 'http://localhost:5000/api/Moa-suggestions', setMoaSuggestion);
  };

  const handleTiming = (e) => {
    const value = e.target.value;
    setTiming(value);
    fetchSuggestions(value, 'http://localhost:5000/api/timing-suggestions', setTimingSuggestions);
  };

  const handleDuration = (e) => {
    const value = e.target.value;
    setDuration(value);
    fetchSuggestions(value, 'http://localhost:5000/api/duration-suggestions', setDurationsuggestions);
  };

  const handleAdvicegiven = (e) => {
    const value = e.target.value;
    setadvicegiven(value);
    fetchSuggestions(value, 'http://localhost:5000/api/advicegiven-suggestions', setAdvicegivenSuggestions);
  };
  const isDisabled =
    basic.status === "billingcompleted" && tokendecode.roll !== "admin";
  const handleDignosis = (e) => {
    setdignosis(e.target.value)
  }
  return (
    <>
      <div className={style.main}>
        <div className={style.maincontent}>
          <div className={style.scrollable_container}>
            <div className={style.user_details_container}>
              <div className={style.user_image}>
                {imageUrl ? (
                  <div className={style.responsive_image_box}>
                    <img src={imageUrl} alt="User" />
                  </div>
                ) : (
                  <div className={style.image_placeholder}>Image</div>
                )}
              </div>

              <div className={style.user_info}>
                <div className={style.info_row}>
                  <span className={style.info_label}>OP No:</span>
                  <span className={style.info_value}>{basic.id}</span>
                </div>
                <div className={style.info_row}>
                  <span className={style.info_label}>Patient Name:</span>
                  <span className={style.info_value}>{basic.full_name}</span>
                </div>
                <div className={style.info_row}>
                  <span className={style.info_label}>Age/Sex:</span>
                  <span className={style.info_value}>{`${basic.age}/${basic.gender}`}</span>
                </div>
                <div className={style.info_row}>
                  <span className={style.info_label}>Phone Number:</span>
                  <span className={style.info_value}>{basic.phone_number}</span>
                </div>
                {cookie.roll != 'nurse' && (<>
                  <div className={style.info_row}>
                    <span className={style.info_label}>Occupation:</span>
                    <span className={style.info_value}>{basic.occupation}</span>
                  </div>
                  <div className={style.info_row}>
                    <span className={style.info_label}>Parent / Spouse Name:</span>
                    <span className={style.info_value}>{basic.parent_name}</span>
                  </div>
                  <div className={style.info_row}>
                    <span className={style.info_label}>Parent / Spouse Occuaption:</span>
                    <span className={style.info_value}>{basic.phone_number}</span>
                  </div>
                  <div className={style.info_row}>
                    <span className={style.info_label}>Place:</span>
                    <span className={style.info_value}>{basic.belongedlocation}</span>
                  </div>
                  <div className={style.info_row}>
                    <span className={style.info_label}>Patient Address:</span>
                    <span className={style.info_value}>{basic.address}</span>
                  </div>
                  <div className={style.info_row}>
                    <span className={style.info_label}>Nurse Name:</span>
                    <span className={style.info_value}>
                      {basic.nursename ? basic.nursename : "Not Checked by any nurse"}
                    </span>
                  </div>
                  <div className={style.info_row}>
                    <span className={style.info_label}>Rceptionist Name:</span>
                    <span className={style.info_value}>
                      {basic.receptionistname ? basic.receptionistname : "Not Checked by any Receptionist"}
                    </span>
                  </div>

                </>)}
                {(cookie.roll == "admin") && (
                  <div className={style.info_row}>
                    <span className={style.info_label}>Doctor:</span>
                    <span className={style.info_value}>
                      {basic.doctorname ? basic.doctorname : "Not Checked by any doctor"}
                    </span>
                  </div>
                )}
                <div className={style.info_row}>
                  <span className={style.info_label}>Visited:</span>
                  <span className={style.info_value}>{basic.visted}</span>
                </div>
                {basic.room_number != null && (
                  <div className={style.info_row}>
                    <span className={style.info_label}>Room number:</span>
                    <span className={style.info_value}>
                      {basic.room_number ? basic.room_number : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {cookie.roll == 'admin' && (
              <TabButton visitedCount={visitedCount} handlevisitedpage={handlevisitedpage} />
            )}
            {/* doctor */}
            {(cookie.roll == 'doctor') && (<>
              <div className={style.section_container}>
                <div className={style.section_header} onClick={() => {
                  setIsDocModalOpen(true);
                  fetchDocSuggestions();
                }}>
                  <span className={style.section_toggle}>+</span> {doctorName ? `Doctor - ${doctorName}` : 'Choose Doctor Name'}
                </div>
              </div>
              {isDocModalOpen && (
                <div className={style.nurse_input_overlay}>
                  <label>Select Doctor Name</label>
                  <div className={style.nurse_listbox}>
                    {docSuggestions === null ? (
                      <div className={style.nurse_listbox_item}>Loading doctors...</div>
                    ) : docSuggestions.length > 0 ? (
                      docSuggestions.map((doctor, index) => (
                        <div
                          key={index}
                          className={nursecss(doctor)}
                          onClick={() => {
                            setDoctorName(doctor);
                            setIsDocModalOpen(false);
                          }}
                        >
                          {doctor}
                        </div>
                      ))
                    ) : (
                      <div className={`${style.nurse_listbox_item} ${style.disabled}`}>
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
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Enter doctor name"
                      className={style.responsive_input}
                    />
                  </div>
                  <div className={style.modal_buttons}>
                    <button
                      className={`${style.buttonred} ${style.responsive_button}`}
                      onClick={() => {
                        if (newDocName) handleAddDoctorName(newDocName);
                        setNewDocName('');
                      }}
                    >
                      Add New Doctor
                    </button>
                    <button
                      className={`${style.buttonblack} ${style.responsive_button}`}
                      onClick={() => {
                        setIsDocModalOpen(false);
                        setNewDocName('');
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>)}
            {/* Nurse */}
            {cookie.roll == 'nurse' && (<>
              <div className={style.section_container}>
                <div className={style.section_header} onClick={() => { setIsNurseModalOpen(true); fetchNurseSuggestions() }}>
                  <span className={style.section_toggle}>+</span>{nurseName ? `Nurse - ${nurseName} ` : 'choose nurse Name'}
                </div>
              </div>
              {isNurseModalOpen && (
                <div className={style.nurse_input_overlay}>
                  <label>Select Nurse Name</label>
                  <div className={style.nurse_listbox}>
                    {nurseSuggestions == null ? (
                      <div className={style.nurse_listbox_item}> Loding Nurse</div>
                    ) : nurseSuggestions.length > 0 ? (
                      nurseSuggestions.map((nurse, index) => (
                        <div key={index}
                          className={nursecss(nurse)}
                          onClick={() => {
                            setnurseName(nurse)
                            setIsNurseModalOpen(false)
                          }}>{nurse}</div>
                      ))
                    ) : (
                      <div className={`${style.nurse_listbox_item} ${style.disabled}`}>
                        {urlParams.franchiselocation
                          ? `No nurse available for ${urlParams.franchiselocation}`
                          : 'No location specified'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label>Add New Nurse</label>
                    <input type='text'
                      value={newNurseName}
                      onChange={(e) => setNewNurseName(e.target.value)}
                      placeholder='Enter Nurse name'
                      className={style.responsive_input}
                    />
                  </div>
                  <div className={style.modal_buttons}>
                    <button
                      className={`${style.buttonred} ${style.responsive_button}`}
                      onClick={() => {
                        if (newNurseName) handleAddNurseName(newNurseName)
                        setNewNurseName('')
                      }}>Add New Nurse</button>
                    <button
                      className={`${style.buttonblack} ${style.responsive_button}`}
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
            </>)}
            {/* vitals */}
            <div className={style.section_container}>
              <div className={style.section_header} onClick={() => toggleSection("vitals")}>
                <span className={style.section_toggle}>{isOpen.vitals ? "-" : "+"}</span> Vitals
              </div>
              {isOpen.vitals && (
                <div className={style.vitals_container}>
                  {(
                    Object.keys(vitals).map((item, index) => (
                      <div className={style.vitals_column} key={index}>
                        <label>{item}</label>
                        <input
                          type="text"
                          name={item}
                          value={vitals[item] || ''}
                          onChange={handleVitalsChange}
                          className={style.responsive_input}
                          disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {type != 'nurse' && (
              // Major Complaint
              <div className={style.section_container}>
                <div className={style.section_header} onClick={() => toggleSection("major")}>
                  <span className={style.section_toggle}>{isOpen.major ? "-" : "+"}</span> Chief Complaints
                </div>
                {isOpen.major && (
                  <div className={style.vitals_container}>
                    <div className={style.textarea_container}>
                      <textarea
                        value={majorComplaints}
                        onChange={(e) => setMajorComplaints(e.target.value)}
                        disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        placeholder="Type..."
                        className={`${style.responsive_textarea} ${style.local_examination_textarea}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* history */}
            <div className={style.section_container}>
              {type != 'nurse' && (
                <div className={style.section_header} onClick={() => toggleSection("history")}>
                  <span className={style.section_toggle}>{isOpen.history ? "-" : "+"}</span> History
                </div>
              )}
              {isOpen.history && (
                <div className={style.vitals_container}>
                  <HistorySection
                    title="Past Medical History"
                    history={pastMedicalHistory}
                    setHistory={setPastMedicalHistory}
                    inputValue={pastMedicalHistoryInput}
                    setInputValue={setPastMedicalHistoryInput}
                    placeholder="Add Past Medical History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={basic.status === "billingcompleted" && tokendecode.roll !== "admin"}
                    style={style}
                  />
                  <HistorySection
                    title="Past Dental History"
                    history={pastDentalHistory}
                    setHistory={setPastDentalHistory}
                    inputValue={pastDentalHistoryInput}
                    setInputValue={setPastDentalHistoryInput}
                    placeholder="Add Past Dental History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={basic.status === "billingcompleted" && tokendecode.roll !== "admin"}
                    style={style}
                  />
                  <HistorySection
                    title="Past Medication History"
                    history={pastMedicationHistory}
                    setHistory={setPastMedicationHistory}
                    inputValue={pastMedicationHistoryInput}
                    setInputValue={setPastMedicationHistoryInput}
                    placeholder="Add Past Medication History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={basic.status === "billingcompleted" && tokendecode.roll !== "admin"}
                    style={style}
                  />
                  <HistorySection
                    title="Past Surgical History"
                    history={surgicalHistory}
                    setHistory={setSurgicalHistory}
                    inputValue={surgicalHistoryInput}
                    setInputValue={setSurgicalHistoryInput}
                    placeholder="Add Surgical History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />
                  <HistorySection
                    title="Family History"
                    history={familyHistory}
                    setHistory={setFamilyHistory}
                    inputValue={familyHistoryInput}
                    setInputValue={setFamilyHistoryInput}
                    placeholder="Add Family History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                    deleteButtonClass={style.buttondred}
                  />
                  <HistorySection
                    title="Birth History"
                    history={birthHistory}
                    setHistory={setBirthHistory}
                    inputValue={birthHistoryInput}
                    setInputValue={setBirthHistoryInput}
                    placeholder="Add Birth History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                    deleteButtonClass={style.buttonred}
                  />
                  <HistorySection
                    title="Allergy History"
                    history={allergyHistory}
                    setHistory={setAllergyHistory}
                    inputValue={allergyHistoryInput}
                    setInputValue={setAllergyHistoryInput}
                    placeholder="Add Allergy History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />
                  <HistorySection
                    title="Habit History"
                    history={habitHistory}
                    setHistory={setHabitHistory}
                    inputValue={habitHistoryInput}
                    setInputValue={setHabitHistoryInput}
                    placeholder="Add Habit History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />
                  <HistorySection
                    title="Any Other History"
                    history={otherHistory}
                    setHistory={setOtherHistory}
                    inputValue={otherHistoryInput}
                    setInputValue={setOtherHistoryInput}
                    placeholder="Add Other History"
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />

                </div>
              )}
            </div>
            {/* oral hygiene */}
            {cookie.roll == 'doctor' && (<>
              <div className={style.section_container}>
                <div className={style.section_header} onClick={() => toggleSection('oralHygiene')}>
                  <span className={style.section_toggle}>{isOpen.oralHygiene ? "- " : "+ "}</span> Oral Hygiene
                </div>
                {isOpen.oralHygiene && (
                  <div className={style.vitals_container}>
                    <div className={style.textarea_continer}>
                      <textarea
                        value={oralHygiene}
                        onChange={(e) => setOralHygiene(e.target.value)}
                        disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        placeholder="Type..."
                        className={`${style.responsive_textarea} ${style.local_examination_textarea}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>)}
            {/* examination */}
            <div className={style.section_container}>
              {type != 'nurse' && (
                <div className={style.section_header} onClick={() => toggleSection("examination")}>
                  <span className={style.section_toggle}>{isOpen.examination ? "-" : "+"}</span> Examination
                </div>
              )}
              {isOpen.examination && (
                <div className={style.vitals_container}>
                  <div className={style.examination_section}>
                    <h5>General Examination</h5>
                    {onexamination.length > 0 ? (
                      onexamination.map((field, index) => (
                        <div className={style.checkbox_item} key={index}>
                          <input
                            type="checkbox"
                            name={field.toLowerCase().replace(/\s+/g, '')}
                            disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
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
                  <div className={style.examination_section}>
                    <h5>Systemic Examination</h5>
                    {onsystem.map((field, index) => (
                      <div className={style.checkbox_item} key={index}>
                        <input
                          disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
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
                  <div className={style.examination_section}>
                    <h5>Investigation</h5>
                    {availableTests.map((field, index) => (
                      <div className={style.checkbox_item} key={index}>
                        <input
                          disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                          type="checkbox"
                          name={field.tests_text.toLowerCase().replace(/\s+/g, '')}
                          checked={selectavailableTests[field.tests_text.toLowerCase().replace(/\s+/g, '')] || false}
                          onChange={(e) => {
                            const { name, checked } = e.target;
                            setselectavailableTests((prev) => ({ ...prev, [name]: checked }));
                          }}
                        />
                        <label>{field.tests_text}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* files */}
            <div className={style.section_container}>
              {type != 'nurse' && (
                <div className={style.section_header} onClick={() => toggleSection("file")}>
                  <span className={style.section_toggle}>{isOpen.file ? "-" : "+"}</span> View Reports
                </div>
              )}
              {isOpen.file && (
                <div className={style.vitals_container}>
                  <div className={style.file_section}>
                    <button
                      className={`${style.buttonblack} ${style.responsive_button}`}
                      onClick={() => setIsModalOpen(true)}
                      disabled={uploadedFiles.length === 0}
                    >
                      View Files
                    </button>
                  </div>
                  <div className={style.file_upload_section}>
                    {!useCamera && (
                      <div className={style.file_upload_controls}>
                        <input
                          disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                          type="file"
                          multiple
                          onChange={handleMultipleFilesChange}
                          accept="image/*"
                          className={style.responsive_file_input}
                        />
                        <button
                          type="button"
                          onClick={startCamera}
                          className={`${style.buttonblack} ${style.responsive_button}`}
                          disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        >
                          Use Camera
                        </button>
                      </div>
                    )}
                    {useCamera && (
                      <div className={style.camera_section}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className={style.responsive_video}
                          disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        />
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className={`${style.buttonblack} ${style.responsive_button}`}
                          disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        >
                          Capture Photo
                        </button>
                      </div>
                    )}
                  </div>
                  {multipleFiles.length > 0 && (
                    <div className={style.file_list_section}>
                      <h3>Selected Files/Images:</h3>
                      <ul className={style.file_list}>
                        {multipleFiles.map((file, index) => (
                          <li key={index} className={style.file_item}>
                            <span>{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className={style.remove_file_button}
                              disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                            >
                              Remove
                            </button>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className={style.file_preview}
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
              <div className={style.modal_overlay}>
                <div className={style.modal_content}>
                  {uploadedFiles.length > 0 ? (
                    <>
                      <div className={style.modal_file_name}>
                        <p>{uploadedFiles[currentImageIndex].File_Name}</p>
                      </div>
                      <div className={style.modal_image_container}>
                        <img
                          src={`http://localhost:5000/${uploadedFiles[currentImageIndex].FilePath}`}
                          alt={uploadedFiles[currentImageIndex].File_Name}
                          className={style.modal_image}
                          onError={(e) => {
                            console.error('Error loading image:', e.target.src);
                            e.target.src = 'http://localhost:5000/150?text=Image+Not+Found';
                            Swal.fire({
                              icon: 'error',
                              title: 'Image Load Error',
                              text: 'Failed to load the image. Displaying placeholder.',
                            });
                          }}
                          onLoad={() => console.log('Image loaded successfully:', `http://localhost:5000/${uploadedFiles[currentImageIndex].FilePath}`)}
                        />
                      </div>
                    </>
                  ) : (
                    <p>No images available</p>
                  )}
                  <div className={style.modal_buttons}>
                    <button
                      onClick={handlePrevImage}
                      // disabled={uploadedFiles.length <= 1}
                      className={style.modal_button}
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className={`${style.modal_button} ${style.close_button}`}
                    >
                      Close
                    </button>
                    <button
                      onClick={handleNextImage}
                      // disabled={uploadedFiles.length <= 1}
                      className={style.modal_button}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* local Examination */}
            <div className={style.section_container}>
              {type != 'nurse' && (
                <div className={style.section_header} onClick={() => toggleSection("localdiagnosis")}>
                  <span className={style.section_toggle}>{isOpen.localdiagnosis ? "-" : "+"}</span> Local Examination
                </div>
              )}
              {isOpen.localdiagnosis && (
                <div className={style.local_container}>
                  <div className={style.local_column}>
                    <h4>Extraoral</h4>
                    <div className={style.history}>
                      <HistorySection
                        title='TMJ'
                        history={tmj}
                        setHistory={setTmj}
                        inputValue={tmjInput}
                        setInputValue={setTmjInput}
                        placeholder='Add TMJ'
                        handleAddHistoryItem={handleAddHistoryItem}
                        handleDeleteHistory={handleDeleteHistory}
                        disabled={isDisabled}
                        style={style}
                      />
                      <HistorySection
                        title='Salivary Glands'
                        history={salivary}
                        setHistory={setSalivary}
                        inputValue={salivaryInput}
                        setInputValue={setSalivaryInput}
                        placeholder='Add Salivary Gland'
                        handleAddHistoryItem={handleAddHistoryItem}
                        handleDeleteHistory={handleDeleteHistory}
                        disabled={isDisabled}
                        style={style}
                      />
                      <HistorySection
                        title='Lymph Nodes'
                        history={lymph}
                        setHistory={setLymph}
                        inputValue={lymphInput}
                        setInputValue={setLymphInput}
                        placeholder='Add Lymph Nodes'
                        handleAddHistoryItem={handleAddHistoryItem}
                        handleDeleteHistory={handleDeleteHistory}
                        disabled={isDisabled}
                        style={style}
                      />
                      <HistorySection
                        title='Any Other Findings'
                        history={otherFinding}
                        setHistory={setOtherFinding}
                        inputValue={OtherFindingInput}
                        setInputValue={setOtherFindingInput}
                        placeholder='Add Other Findings'
                        handleAddHistoryItem={handleAddHistoryItem}
                        handleDeleteHistory={handleDeleteHistory}
                        disabled={isDisabled}
                        style={style}
                      />
                    </div>
                  </div>
                  <div className={style.local_column}>
                    <h4>Intraoral</h4>
                    <div className={style.history}>
                      <HistorySection
                        title='Soft Tissue Findings'
                        history={softTissue}
                        setHistory={setSoftTissue}
                        inputValue={softTissueInput}
                        setInputValue={setSoftTissueInput}
                        placeholder='Add Soft Tissue Finding'
                        handleAddHistoryItem={handleAddHistoryItem}
                        handleDeleteHistory={handleDeleteHistory}
                        disabled={isDisabled}
                        style={style}
                      />
                      <HistorySection
                        title='Malocclusion'
                        history={malocclusion}
                        setHistory={setMalocclusion}
                        inputValue={malocclutionInput}
                        setInputValue={setMalocclusionInput}
                        placeholder='Add Malocclusion'
                        handleAddHistoryItem={handleAddHistoryItem}
                        handleDeleteHistory={handleDeleteHistory}
                        disabled={isDisabled}
                        style={style}
                      />
                      <HistorySection
                        title='Local Factor'
                        history={localFactor}
                        setHistory={setLocalFactor}
                        inputValue={localFactorInput}
                        setInputValue={setLocalFactorInput}
                        placeholder='Add Local Factor'
                        handleAddHistoryItem={handleAddHistoryItem}
                        handleDeleteHistory={handleDeleteHistory}
                        disabled={isDisabled}
                        style={style}
                      />
                    </div>
                  </div>
                  <div className={style.dental_chart_table}>
                    <h5>Intra-Oral Examination</h5>
                    <table className={style.dental_table}>
                      <tbody>
                        <tr>
                          <td />
                          <td />
                          <td />
                          {[55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65].map((toothNumber, index) => (
                            <td
                              key={toothNumber}
                              className={`dental-tooth-cell ${dental[toothNumber] ? 'has-value' : ''}`}
                              onClick={() => {
                                if (!isdisable) {
                                  setSelectedTooth(toothNumber)
                                }
                              }}
                            >
                              <div className={style.tooth_number}>{toothNumber}</div>
                              <div className={style.tooth_condition}>
                                {dental[toothNumber] || "Select"}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          {[
                            18, 17, 16, 15, 14, 13, 12, 11,
                            21, 22, 23, 24, 25, 26, 27, 28
                          ].map((toothNumber, index) => (
                            <td
                              key={toothNumber}
                              className={`dental-tooth-cell ${dental[toothNumber] ? 'has-value' : ''}`}
                              onClick={() => {
                                if (!isdisable) {
                                  setSelectedTooth(toothNumber)
                                }
                              }}
                            >
                              <div className={style.tooth_number}>{toothNumber}</div>
                              <div className={style.tooth_condition}>
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
                              onClick={() => {
                                if (!isdisable) {
                                  setSelectedTooth(toothNumber)
                                }
                              }}
                            >
                              <div className={style.tooth_number}>{toothNumber}</div>
                              <div className={style.tooth_condition}>
                                {dental[toothNumber] || "Select"}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className={style.nobrder} />
                          <td />
                          <td />
                          {[85, 84, 83, 82, 81, 70, 71, 72, 73, 74, 75].map((toothNumber, index) => (
                            <td
                              key={toothNumber}
                              className={`dental-tooth-cell ${dental[toothNumber] ? 'has-value' : ''}`}
                              onClick={() => {
                                if (!isdisable) {
                                  setSelectedTooth(toothNumber)
                                }
                              }}
                            >
                              <div className={style.tooth_number}>{toothNumber}</div>
                              <div className={style.tooth_condition}>
                                {dental[toothNumber] || "Select"}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {selectedTooth && (
                    <div className={style.dental_input_overlay}>
                      <label>Tooth {selectedTooth}</label>
                      <div className={style.dental_listbox}>
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
                          <div className={`${style.dental_listbox_item} ${style.disabled}`}>
                            No dental values available
                          </div>
                        )}
                      </div>
                      <button
                        className={`${style.buttonblack} ${style.responsive_button}`}
                        onClick={() => setSelectedTooth(null)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* provisional dignosis */}
            <div className={style.section_container}>
              {(cookie.roll == 'doctor') && (
                <div className={style.section_header} onClick={() => toggleSection('dignosis')}>
                  <span className={style.section_toggle}>{isOpen.dignosis ? '-' : '+'}</span> Provisional Dignosis
                </div>
              )}
              {isOpen.dignosis && (
                <div className={style.vitals_container}>
                  <textarea
                    readOnly={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                    placeholder="Type..."
                    value={dignosis || ''}
                    onChange={handleDignosis}
                    className={style.responsive_textarea}
                  />
                </div>
              )}
            </div>
            {/* investigation */}
            {(cookie.roll == 'doctor') && (<>
              <div className={style.section_header} onClick={() => toggleSection('investigation')}>
                <span className={style.section_toggle}>{isOpen.investigation ? '-' : '+'}</span> Investigation
              </div>
              {isOpen.investigation && (
                <div className={style.vitals_container}>
                  <HistorySection
                    title='Blood Investigation'
                    history={bloodInvestigation}
                    setHistory={setBloodInvestigation}
                    inputValue={bloodInvestigationInput}
                    setInputValue={setBloodInvestigationInput}
                    placeholder='Add Blood Investigation'
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />
                  <HistorySection
                    title='Radiography Investigation'
                    history={radiographyInvestigation}
                    setHistory={setRadiographyInvestigation}
                    inputValue={radiographyInvestigationInput}
                    setInputValue={setRadiographyInvestigationInput}
                    placeholder='Add Radiography Investigation'
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />
                  <HistorySection
                    title='Histopathological Investigation'
                    history={histopathologicalInvestigation}
                    setHistory={setHistopathologicalInvestigation}
                    inputValue={histopathologicalInvestigationInput}
                    setInputValue={setHistopathologicalInvestigationInput}
                    placeholder='Add Histopathological Investigation'
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />
                  <HistorySection
                    title='other Investigation'
                    history={otherInvestigation}
                    setHistory={setOtherInvestigation}
                    inputValue={otherInvestigationInput}
                    setInputValue={setOtherInvestigationInput}
                    placeholder='Add Any Other Investigation'
                    handleAddHistoryItem={handleAddHistoryItem}
                    handleDeleteHistory={handleDeleteHistory}
                    disabled={isDisabled}
                    style={style}
                  />
                </div>
              )}
            </>)}
            {/* diagonasis */}
            {cookie.roll == 'doctor' && (
              <div className={style.section_container}>
                <div className={style.section_header} onClick={() => toggleSection('finaldiagonsis')}>
                  <span className={style.section_toggle}>{isOpen.finaldiagonsis ? "- " : "+ "}</span> Final Diagnosis
                </div>
                {isOpen.finaldiagonsis && (
                  <div className={style.vitals_container}>
                    <div className={style.textarea_continer}>
                      <textarea
                        value={finaldiagonsis}
                        onChange={(e) => setFinaldiagonsis(e.target.value)}
                        disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        placeholder="Type..."
                        className={`${style.responsive_textarea} ${style.local_examination_textarea}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className={style.section_container}></div>
            {/* treatment */}
            <div className={style.section_container}>
              {type != 'nurse' && (
                <div className={style.section_header} onClick={() => toggleSection("treatment")}>
                  <span className={style.section_toggle}>{isOpen.treatment ? "-" : "+"}</span> Treatment
                </div>
              )}
              {isOpen.treatment && (
                <div className={style.treatment_container}>
                  <div className={style.treatment_section}>
                    <HistorySection
                      title='Treatment Plan'
                      history={treatmentPlan}
                      setHistory={setTreatmentPlan}
                      inputValue={treatmentPlanInput}
                      setInputValue={setTreatmentPlanInput}
                      placeholder='Add Treatment Plan'
                      handleAddHistoryItem={handleAddHistoryItem}
                      handleDeleteHistory={handleDeleteHistory}
                      disabled={isDisabled}
                      style={style}
                    />
                    <HistorySection
                      title='Procedure Done'
                      history={procedureDone}
                      setHistory={setProcedureDone}
                      inputValue={procedureDoneInput}
                      setInputValue={setProcedureDoneInput}
                      placeholder='Add Prodecure Done'
                      handleAddHistoryItem={handleAddHistoryItem}
                      handleDeleteHistory={handleDeleteHistory}
                      disabled={isDisabled}
                      style={style}
                    />
                  </div>
                  <div className={style.treatment_section}>
                    <h5>Treatment Given</h5>
                    <table className={style.responsive_table}>
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
                                className={`${style.buttondelete} ${style.responsive_button}`}
                                onClick={() => handleDeleteHistory(treatment, settreatment, item)}
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                              >
                                Delete
                              </button>
                            </td>
                            <td data-title="Edit">
                              <button
                                className={`${style.buttongrey} ${style.responsive_button}`}
                                onClick={() => handleEditTreatment(index)}
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td data_title="Name">
                            <div className={style.input_with_suggestions}>
                              <input
                                onChange={handleTreatmentNameChange}
                                onBlur={() => setTimeout(() => setTreatmentgivennameSuggestions([]), 200)}
                                type="text"
                                placeholder="Name"
                                value={treatmentgivenname}
                                className={style.responsive_input}
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
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
                            <div className={style.input_with_suggestions}>
                              <input
                                type="text"
                                placeholder="Dosage"
                                onChange={handleDosageChange}
                                value={treatmentdosage}
                                onBlur={() => setTimeout(() => setDosageSuggestions([]), 200)}
                                className={style.responsive_input}
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
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
                            <div className={style.input_with_suggestions}>

                              <input
                                type="text"
                                placeholder="Route of Administration"
                                className={style.responsive_input}
                                onChange={handleRoa}
                                value={treatmentrout}
                                onBlur={() => setTimeout(() => setRoaSuggestion([]), 200)}
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
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
                            <div className={style.button_wrapper}>
                              <button
                                className={`${style.buttonblack} ${style.responsive_button}`}
                                onClick={handleAddTreatment}
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
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
            {/* prescription */}
            <div className={style.section_container}>
              {type != 'nurse' && (
                <div className={style.section_header} onClick={() => toggleSection("prescription")}>
                  <span className={style.section_toggle}>{isOpen.prescription ? "-" : "+"}</span> Prescription
                </div>
              )}
              {isOpen.prescription && (
                <div className={style.vitals_container}>
                  <div className={style.prescription_section}>
                    <h5>Prescription</h5>
                    <table className={style.responsive_table}>
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>MOA</th>
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
                            <td data-title="Dosage">{item.moa}</td>
                            <td data-title="Timing">{item.timing}</td>
                            <td data-title="Duration">{item.duration}</td>
                            <td data-title="Delete">
                              <button
                                className={`${style.buttondelete} ${style.responsive_button}`}
                                onClick={() => handleDeleteHistory(prescription, setPrescription, item)}
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                              >
                                Delete
                              </button>
                            </td>
                            <td data-title="Edit">
                              <button
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                                className={`${style.buttongrey} ${style.responsive_button}`}
                                onClick={() => handleEditPrescription(index)}>
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr ref={rowRef} className={style.add_prescription_row}>
                          <td data-title="Medicine">
                            <div className={style.input_with_suggestions}>
                              <input
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                                type="text"
                                onChange={handleMedicineChange}
                                value={medicine}
                                onBlur={() => setTimeout(() => setMedicineSuggestions([]), 200)}
                                placeholder="Medicine"
                                className={style.responsive_input}
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
                            <div className={style.input_with_suggestions}>
                              <input
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                                type="text"
                                placeholder="MOA"
                                id="MOA"
                                value={moa}
                                onChange={handlePrescriptionMoaChange}
                                onBlur={() => setTimeout(() => setMoaSuggestion([]), 200)}
                                className={style.responsive_input}
                              />
                              <SuggestionList
                                suggestions={moaSuggestion}
                                onSuggestionClick={(suggestion) => {
                                  setMoa(suggestion);
                                  setMoaSuggestion([]);
                                }}
                              />
                            </div>
                          </td>
                          <td data-title="Timing">
                            <div className={style.input_with_suggestions}>
                              <input
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                                type="text"
                                placeholder="Timing"
                                onChange={handleTiming}
                                onBlur={() => setTimeout(() => setTimingSuggestions([]), 200)}
                                value={timing}
                                className={style.responsive_input}
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
                            <div className={style.input_with_suggestions}>
                              <input
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                                type="text"
                                placeholder="Duration"
                                onChange={handleDuration}
                                value={duration}
                                onBlur={() => setTimeout(() => setDurationsuggestions([]), 200)}
                                className={style.responsive_input}
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
                            <div className={style.button_wrapper}>
                              <button
                                disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                                className={`${style.buttonblack} ${style.responsive_button}`}
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
            {/* follow update */}
            <div className={style.section_container}>
              {type != 'nurse' && (
                <div className={style.section_header} onClick={() => toggleSection("follow")}>
                  <span className={style.section_toggle}>{isOpen.follow ? "-" : "+"}</span> Follow Update
                </div>
              )}
              {isOpen.follow && (
                <div className={style.vitals_container}>
                  <div className={style.vitals_column}>
                    <label>Follow Up Date</label>
                    <input
                      disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                      type="date"
                      value={followupdate || ''}
                      onChange={(e) => setfollowupdate(e.target.value)}
                      className={style.responsive_input}
                    />
                  </div>
                  <div className={style.vitals_column}>
                    <label>Follow Up Time</label>
                    <input
                      disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                      type="time"
                      value={followUpTime || ''}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className={style.responsive_input}
                    />
                  </div>
                  <div className={style.vitals_column}>
                    <label>Consultant Name</label>
                    <input
                      type='text'
                      disabled={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                      value={consultantName || ''}
                      onChange={(e) => setConsultantName(e.target.value)}
                      className={style.responsive_input}
                    />
                  </div>
                  <div className={style.vitals_column}>
                    <div className={style.input_with_suggestions}>
                      <label>Procedure to Done</label>
                      <textarea
                        readOnly={basic.status === "billingcompleted" && tokendecode.roll != "admin"}
                        placeholder="Type..."
                        value={advicegiven || ''}
                        onChange={handleAdvicegiven}
                        className={style.responsive_textarea}
                      />
                      <SuggestionList
                        suggestions={advicegivenSuggestions}
                        onSuggestionClick={(suggestion) => {
                          setadvicegiven(suggestion);
                          setAdvicegivenSuggestions([]);
                        }}
                      />
                    </div>
                  </div>
                  <div >
                    <input
                      type="checkbox"
                      disabled={basic.status === "billingcompleted" && tokendecode.roll !== "admin"}
                      checked={reviewCall}
                      onChange={(e) => setReviewCall(e.target.checked)}
                      className={style.responsive_input}
                    />
                    <span>Review Call</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={style.button_container}>
            {(cookie.roll === 'doctor' || cookie.roll === 'admin') && (
              <button className={`${style.buttonblack} ${style.responsive_button} ${style.btn_save}`} onClick={() => handleSubmit()}>Save</button>
            )}
            {(cookie.roll === 'doctor') && (
              <button className={`${style.buttonblue} ${style.responsive_button} ${style.btn_bill}`} onClick={handleSendToBill}>Send to Bill</button>
            )}
            {cookie.roll === 'nurse' && (
              <button className={style.button_forwardtodoctor} onClick={handleForward}>Forward to Doctor</button>
            )}
            {(cookie.roll === 'doctor' || cookie.roll === 'admin') && (
              <button
                className={`${style.buttongrey} ${style.responsive_button} ${style.btn_generate}`}
                onClick={handleGeneratePrescription}
              >
                Generate Prescription
              </button>
            )}
            {(cookie.roll === 'doctor' || cookie.roll === 'admin') && (
              <button
                className={`${style.buttonred} ${style.responsive_button} ${style.btn_test}`}
                onClick={handleGenerateTestReport}
              >
                Test Report Requirement
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientForm;