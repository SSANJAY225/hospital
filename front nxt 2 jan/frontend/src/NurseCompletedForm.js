import React, { useState, useEffect } from 'react';
import './Adminform.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';

const NurseCompletedForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useState({
    loginLocation: '',
    franchiselocation: '',
    businessName: '',
    name: '',
    id: '',
    visited: '',
    nursename:''
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
      loginLocation: searchParams.get('loginlocation') || '',
      franchiselocation: searchParams.get('franchiselocation') || '',
      businessName: searchParams.get('businessname') || '',
      name: searchParams.get('name') || '',
      id: searchParams.get('id') || '',
      visited: searchParams.get('visited') || '',
      nursename: searchParams.get('nursename')
    };
  };

  const fetchData = async () => {
    const params = getUrlParams();
    if (params.name && params.businessName && params.visited) {
      try {
        // Fetch vitals
        const vitalsResponse = await axios.get(`http://localhost:5000/getvitals/${params.name}/${params.visited}/${params.businessName}`);
        if (vitalsResponse.data && vitalsResponse.data.length > 0) {
          setVitals(vitalsResponse.data[0]); // Assuming single record
        }

        // Fetch major complaints
        const majorResponse = await axios.get(`http://localhost:5000/get-major/${params.name}/${params.visited}/${params.businessName}`);
        if (majorResponse.data && majorResponse.data.length > 0) {
          setMajorComplaints(majorResponse.data[0].Major_Complaints || '');
        }
        // Fetch other data (to be expanded with additional endpoints)
        // Example: Fetch treatment, prescription, etc., if backend endpoints exist
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Fetch Error',
          text: 'Failed to load patient data. Please try again.',
        });
      }
    }
  };

  const fetchvitalsinput = async () => {
    try {
      const response = await fetch('http://localhost:5000/column-vitals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Expected an array but got:", data);
        return;
      }
      const filteredData = data.filter(col => col !== 'Name' && col !== 'Visit' && col !== 'Phone number');
      const vitalsObject = Object.fromEntries(filteredData.map(field => [field, '']));
      setvitalsinput(vitalsObject);
    } catch (error) {
      console.error("Error fetching vitals:", error);
    }
  };
  const fetchNurseSuggestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/nurse-suggestions');
      setNurseSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching nurse names:', error);
    }
  };

  const handleAddNurseName = async (name) => {
    if (name.trim() === '') return;
    try {
      await axios.post('http://localhost:5000/addNurseName', { nurseName: name });
      setNurseName(name);
      setIsNurseModalOpen(false);
      fetchNurseSuggestions();
    } catch (error) {
      console.error('Error adding nurse name:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add nurse name.',
      });
    }
  };

  useEffect(() => {
    setUrlParams(getUrlParams());
    fetchData();
    fetchvitalsinput();
    fetchNurseSuggestions();
  }, [location]);

  useEffect(() => {
    if (urlParams.businessName && urlParams.visited) {
      fetchImage(urlParams.businessName, urlParams.visited);
    }
  }, [urlParams]);

  const fetchImage = async (phoneNumber, visited) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user-photo`, {
        params: { phoneNumber, visited },
      });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Error fetching image:', error);
      setImageUrl(null);
    }
  };


  useEffect(() => {
    const params = getUrlParams();
    setUrlParams(params);
    // Set nurse name from URL params if available
    if (params.nursename) {
      setNurseName(params.nursename);
    }
    fetchData();
    fetchvitalsinput();
    fetchNurseSuggestions();
  }, [location]);

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
      formData.vitals.Name = urlParams.name;
      formData.vitals.Phone_number = urlParams.businessName;
      formData.vitals.Visit = urlParams.visited;
      formData.nurseName = nurseName;
      const updatedFormData = Object.keys(formData.vitals).reduce((acc, key) => {
        const newKey = key.replace(" ", " ");
        acc[newKey] = formData.vitals[key];
        return acc;
      }, {});
      await axios.put(`http://localhost:5000/update-data`, { ...formData, vitals: updatedFormData }, {
        headers: { 'Content-Type': 'application/json' },
      });
      await Swal.fire({
        icon: 'success',
        title: 'Patient Updated!',
        text: 'The patient data has been successfully updated.',
        confirmButtonText: 'OK',
      });
      navigate(`/nursefollow?loginlocation=${urlParams.loginLocation}&franchiselocation=${urlParams.franchiselocation}`, { replace: true });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed!',
        text: 'Something went wrong while updating the patient data. Please try again.',
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
    fetchSuggestions(value, 'http://localhost:5000/api/dosage-suggestions', setDosageSuggestions);
  };

  const handlePriscriptionDosageChange = (e) => {
    const value = e.target.value;
    setDosage(value);
    fetchSuggestions(value, 'http://localhost:5000/api/dosage-suggestions', setPrescriptiondosagesuggestion);
  };

  const handleTiming = (e) => {
    const value = e.target.value;
    setTiming(value);
    fetchSuggestions(value, 'http://localhost:5000/api/timing-suggestions', settimingSuggestions);
  };

  const handleDuration = (e) => {
    const value = e.target.value;
    setDuration(value);
    fetchSuggestions(value, 'http://localhost:5000/api/duration-suggestions', setdurationsuggestions);
  };

  const handleAdvicegiven = (e) => {
    const value = e.target.value;
    setadvicegiven(value);
    fetchSuggestions(value, 'http://localhost:5000/api/advicegiven-suggestions', setadvicegivenSuggestions);
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

  const fetchDataLists = async (url, setData) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  useEffect(() => {
    fetchDataLists('http://localhost:5000/api/onexamination', setOnExamination);
    fetchDataLists('http://localhost:5000/api/onsystem', setOnSystem);
    fetchDataLists('http://localhost:5000/api/tests', setavalableTests);
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
    <span className="section-toggle">+</span> 
    {nurseName ? `Nurse Name - ${nurseName}` : 'Choose Nurse Name'}
  </div>
</div>


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
        <button className="button-forwardtodoctor" onClick={handleSubmit}>Update Patient</button>
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

export default NurseCompletedForm;