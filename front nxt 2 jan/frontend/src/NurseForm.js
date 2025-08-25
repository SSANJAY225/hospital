import React, { useState, useEffect } from 'react';
import './Adminform.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';

const NurseForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useState({
    businessName: '',
    name: '',
    id: '',
    visited: '',
    nursename: ''
  });

  const [imageUrl, setImageUrl] = useState(null);
  const [majorComplaints, setMajorComplaints] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [birthHistory, setBirthHistory] = useState([]);
  const [surgicalHistory, setSurgicalHistory] = useState([]);
  const [otherHistory, setOtherHistory] = useState([]);
  const [followupdate, setfollowupdate] = useState('');
  const [advicegiven, setadvicegiven] = useState('');
  const [nurseName, setNurseName] = useState('');
  const [nurseSuggestions, setNurseSuggestions] = useState([]);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [newNurseName, setNewNurseName] = useState('');
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);

  const [onexamination, setOnExamination] = useState([]);
  const [onsystem, setOnSystem] = useState([]);
  const [availableTests, setavalableTests] = useState([]);
  const [dosageSuggestions, setDosageSuggestions] = useState([]);
  const [isTestListVisible, setIsTestListVisible] = useState(false);
  const [isOnExamListVisible, setIsOnExamListVisible] = useState(false);
  const [isSystematicListVisible, setIsSystematicListVisible] = useState(false);
  const [isFamilyHistoryListVisible, setIsFamilyHistoryListVisible] = useState(true);
  const [isBirthHistoryListVisible, setIsBirthHistoryListVisible] = useState(true);
  const [isSurgicalHistoryListVisible, setIsSurgicalHistoryListVisible] = useState(true);
  const [isOtherHistoryListVisible, setIsOtherHistoryListVisible] = useState(true);
  const [dynamicOnExaminations, setDynamicOnExaminations] = useState([]);
  const [dynamicSystematic, setDynamicSystematic] = useState([]);
  const [additionalTests, setAdditionalTests] = useState([]);
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
  const [editingPrescriptionIndex, setEditingPrescriptionIndex] = useState(null);
  const [editingTreatmentIndex, setEditingTreatmentIndex] = useState(null);
  const [selectavailableTests, setselectavailableTests] = useState(availableTests);
  const [selectonexamination, setselectonexamination] = useState(onexamination);
  const [selectsystematic, setselectsystematic] = useState(onsystem);
  const [examination, setExamination] = useState({ selectavailableTests, selectonexamination, selectsystematic });
  const [complaintsSuggestions, setcomplaintsSuggestions] = useState([]);
  const [vitalsSuggestions, setvitalsSuggestions] = useState([]);
  const [tratmentgivenSuggestions, settratmentgivenSuggestions] = useState([]);
  const [DrugsSuggestions, setDrugsSuggestions] = useState([]);
  const [timingSuggestions, settimingSuggestions] = useState([]);
  const [durationsuggestions, setdurationsuggestions] = useState([]);
  const [advicegivenSuggestions, setadvicegivenSuggestions] = useState([]);
  const [vaccineSuggestions, setvaccineSuggestions] = useState([]);
  const [Prescriptiondosagesuggestion, setPrescriptiondosagesuggestion] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [vitalsinput, setvitalsinput] = useState({});
  const [vitals, setVitals] = useState({});

  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      loginLocation: searchParams.get('loginlocation'),
      franchiselocation: searchParams.get('franchiselocation'),
      businessName: searchParams.get('businessname'),
      name: searchParams.get('name'),
      id: searchParams.get('id'),
      visited: searchParams.get('visited'),
      nursename: searchParams.get('nursename')
    };
  };

  const fetchvitalsinput = async () => {
    try {
      const response = await fetch('https://amrithaahospitals.visualplanetserver.in/column-vitals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Expected an array but got:", data);
        return;
      }
      const filteredData = data.filter(
        col => col !== 'Name' && col !== 'Visit' && col !== 'Phone_number' && col !== 'Phone number'
      );
      console.log("Filtered vitals columns:", filteredData);
      const vitalsObject = Object.fromEntries(filteredData.map(field => [field, '']));
      setVitals(vitalsObject);
    } catch (error) {
      console.error("Error fetching vitals:", error);
    }
  };

  const fetchNurseSuggestions = async (franchiselocation) => {
    if (!franchiselocation) return;
    setIsLoadingNurses(true);
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/nurse-suggestions', {
        params: { franchiselocation }
      });
      setNurseSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching nurse suggestions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch nurse suggestions.',
      });
    } finally {
      setIsLoadingNurses(false);
    }
  };

  useEffect(() => {
    const params = getUrlParams();
    setUrlParams(params);
    
    if (params.nursename) {
      setNurseName(params.nursename);
    }
    
    fetchvitalsinput();
    
    if (params.franchiselocation) {
      fetchNurseSuggestions(params.franchiselocation);
    }
  }, [location]);

  const handleAddNurseName = async (name) => {
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
      await axios.post('https://amrithaahospitals.visualplanetserver.in/addNurseName', {
        nurseName: name,
        location: urlParams.franchiselocation
      });
      setNurseName(name);
      setIsNurseModalOpen(false);
      fetchNurseSuggestions(urlParams.franchiselocation);
    } catch (error) {
      console.error('Error adding nurse name:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add nurse name.',
      });
    }
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

  useEffect(() => {
    if (urlParams.businessName && urlParams.visited) {
      fetchImage(urlParams.businessName, urlParams.visited);
    }
  }, [urlParams]);

  const handleSubmit = async () => {
    const urlParams = getUrlParams();
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
      additionalTests,
      followupdate,
      advicegiven,
      treatment,
      prescription,
      local,
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
        `https://amrithaahospitals.visualplanetserver.in/adddata-vitals/`,
        vitalsData
      );
  
      if (!vitalsResponse.data || !vitalsResponse.data.message.includes("success")) {
        throw new Error("Failed to save vitals: " + (vitalsResponse.data?.message || "Unknown error"));
      }
  
      formData.Phone_number = urlParams.businessName;
      console.log(urlParams.franchiselocation)
      formData.location=urlParams.franchiselocation;
      console.log("Nurse Form Data to Send:", formData);
      const response = await axios.post(
        'https://amrithaahospitals.visualplanetserver.in/save-data-nurse',
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
      navigate(`/nursefollow?loginlocation=${urlParams.loginLocation}&franchiselocation=${urlParams.franchiselocation}`, { replace: true });
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

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitals(prevVitals => ({ ...prevVitals, [name]: value }));
  };

  const handleDeleteHistory = (history, setHistory, item) => {
    setHistory(history.filter((entry) => entry !== item));
  };

  const handleAddTreatment = () => {
    settreatment([...treatment, { treatmentdosage, treatmentrout }]);
    settreatmentdosage('');
    settreatmentrout('');
  };

  const handleAddPrescription = () => {
    setPrescription([...prescription, { medicine, dosage, timing, duration }]);
    setMedicine('');
    setDosage('');
    setTiming('');
    setDuration('');
  };

  const handleAddHistoryItem = (newHistoryItem, historyList, setHistoryList) => {
    if (!historyList.includes(newHistoryItem) && newHistoryItem.trim() !== '') {
      setHistoryList([...historyList, newHistoryItem]);
    }
    setIsBirthHistoryListVisible(false);
    setIsFamilyHistoryListVisible(false);
    setIsSurgicalHistoryListVisible(false);
    setIsOtherHistoryListVisible(false);
  };

  const handleEditTreatment = (index) => {
    const item = treatment[index];
    settreatmentdosage(item.treatmentdosage);
    settreatmentrout(item.treatmentrout);
    setEditingTreatmentIndex(index);
    handleDeleteHistory(treatment, settreatment, item);
  };

  const fetchSuggestions = async (value, apiUrl, setSuggestionState) => {
    if (value.length > 0) {
      try {
        const response = await axios.get(apiUrl, { params: { term: value } });
        setSuggestionState(response.data);
      } catch (error) {
        console.error(`Error fetching suggestions from ${apiUrl}:`, error);
      }
    } else {
      setSuggestionState([]);
    }
  };

  const handleDosageChange = (e) => {
    const value = e.target.value;
    settreatmentdosage(value);
    fetchSuggestions(value, 'https://amrithaahospitals.visualplanetserver.in/api/dosage-suggestions', setDosageSuggestions);
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
    setEditingPrescriptionIndex(index);
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

  const handleExaminationChange = (e) => {
    const { name, checked } = e.target;
    setExamination((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSystemChange = (e) => {
    const { name, checked } = e.target;
    setExamination((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddItem = (item, setDynamicList, dynamicList) => {
    setDynamicList([...dynamicList, item]);
  };

  const handleMultipleFilesChange = (e) => {
    setMultipleFiles(e.target.files);
  };

  const uploadMultipleFiles = async () => {
    const formData = new FormData();
    for (let i = 0; i < multipleFiles.length; i++) {
      formData.append('files', multipleFiles[i]);
    }
    try {
      const uploadedFileNames = Array.from(multipleFiles).map((file) => file.name);
      setUploadedFiles((prev) => [...prev, ...uploadedFileNames]);
    } catch (error) {
      alert('Error uploading multiple files');
    }
  };

  const displayUploadedFiles = () => {
    alert(`Uploaded files: ${uploadedFiles.join(', ')}`);
  };

  const SuggestionList = ({ suggestions, onSuggestionClick }) => {
    if (suggestions.length === 0) return null;
    return (
      <ul className="suggestion-list">
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
    );
  };

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

  const toggleSection = (section) => {
    setIsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <div className="scrollable-container">
        <h5 className="title"></h5>
        
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

        <div className="section-container">
          <div className="section-header" onClick={() => setIsNurseModalOpen(true)}>
            <span className="section-toggle">+</span> {nurseName ? `Nurse Name - ${nurseName}` : 'Choose Nurse Name'}
          </div>
        </div>

        {isNurseModalOpen && (
<div className="nurse-input-overlay">
  <label>Select Nurse Name</label>
  <div className="nurse-listbox">
    {isLoadingNurses ? (
      <div className="nurse-listbox-item disabled">Loading nurses...</div>
    ) : nurseSuggestions.length === 0 ? (
      <div className="nurse-listbox-item disabled">
        {urlParams.franchiselocation 
          ? `No nurses available for ${urlParams.franchiselocation}`
          : 'No location specified in URL'}
      </div>
    ) : (
      nurseSuggestions.map((nurse, index) => (
        <div
          key={index}
          className={`nurse-listbox-item ${nurseName === nurse ? 'selected' : ''}`}
          onClick={() => {
            setNurseName(nurse);
            setIsNurseModalOpen(false);
          }}
        >
          {nurse}
        </div>
      ))
    )}
  </div>
  <div>
    <label>Add New Nurse</label>
    <input
      type="text"
      value={newNurseName}
      onChange={(e) => setNewNurseName(e.target.value)}
      placeholder="Enter nurse name"
      className="responsive-input"
    />
  </div>
  <div className="modal-buttons">
    <button
      className="buttonred responsive-button"
      onClick={() => {
        if (newNurseName) handleAddNurseName(newNurseName);
        setNewNurseName('');
      }}
    >
      Add New Nurse
    </button>
    <button
      className="buttonblack responsive-button"
      onClick={() => {
        setIsNurseModalOpen(setNewNurseName(''));
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
      </div>

      <div className='title' style={{ marginTop: '50px' }}>
        <button className="button-forwardtodoctor" onClick={handleSubmit}>Forward to Doctor</button>
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
      `}</style>
    </>
  );
};

export default NurseForm;