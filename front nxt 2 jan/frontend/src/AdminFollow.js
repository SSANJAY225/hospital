import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import './AdminFollow.css';
import { faCalendarAlt, faPlus, faBroom, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { RiFileExcel2Line } from "react-icons/ri";
import { TbFilterCheck } from "react-icons/tb";
import { HiMiniCalendarDateRange } from "react-icons/hi2";

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import myImage from './AmirthaLogo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function BusinessList({ onBusinessClick, businesses, onDownloadBill }) {
  const sortedBusinesses = [...businesses].sort((a, b) => b.id - a.id);

  return (
    <div className="container-fluid">
      <h2 className='bus'></h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age / Gender</th>
              <th>Phone Number</th>
              <th>Services</th>
              <th>Appointment Date</th>
              <th>Visit</th>
            </tr>
          </thead>
          <tbody>
            {sortedBusinesses.map((business, index) => (
              <tr key={index} onClick={() => onBusinessClick(business)}>
                <td>{business.full_name}</td>
                <td>{business.age} / {business.gender}</td>
                <td>{business.phone_number}</td>
                <td>{business.services}</td>
                <td>{formatDate(String(business.appointment_date))}</td>
                <td>{business.visted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const handleDownloadBill = async (business) => {
  try {
    const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/get-billing-details', {
      params: {
        phone_number: business.phone_number,
        visted: business.visted,
      },
    });

    const { patient, billing_header, billing_details } = response.data;
    if (!billing_header || !billing_details) {
      alert('No billing information found for this patient.');
      return;
    }

    const doc = new jsPDF();
    const logo = new Image();
    logo.src = myImage;

    doc.addImage(logo, 'PNG', 10, 10, 50, 20);
    doc.setFontSize(16);
    doc.text('Patient Billing Receipt', 70, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${patient.full_name || '-'}`, 10, 40);
    doc.text(`Phone Number: ${patient.phone_number || '-'}`, 10, 50);
    doc.text(`Visit Number: ${business.visted || '-'}`, 10, 60);
    doc.text(`Billing Date: ${formatDate(billing_header.billing_date) || '-'}`, 10, 70);

    if (patient.photo_url) {
      try {
        const photo = new Image();
        photo.src = patient.photo_url;
        doc.addImage(photo, 'JPEG', 150, 40, 40, 40);
      } catch (e) {
        console.error('Error loading patient photo:', e);
        doc.text('No photo available', 150, 60);
      }
    } else {
      doc.text('No photo available', 150, 60);
    }

    autoTable(doc, {
      startY: 90,
      head: [['Service', 'Price']],
      body: billing_details.map(detail => [detail.service_name, `₹${parseFloat(detail.price).toFixed(2)}`]),
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
    });

    const finalY = doc.lastAutoTable.finalY || 90;
    doc.text(`Total Price: ₹${parseFloat(billing_header.total_price).toFixed(2)}`, 10, finalY + 10);
    doc.save(`bill_${patient.phone_number}_${business.visted}.pdf`);
  } catch (error) {
    console.error('Error generating bill PDF:', error);
    alert('Failed to generate bill PDF. Please try again.');
  }
};

function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '-';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
}

function BusinessDetails({ selectedBusiness }) {
  return (
    <div className="business-details">
      <h2>Business Details</h2>
      <p><strong>Name:</strong> {selectedBusiness.phone_number}</p>
      <p><strong>Next Meeting:</strong> {formatDate(selectedBusiness.dateofnextmeeting)}</p>
      <p><strong>Spanco Stage:</strong> {selectedBusiness.spanco}</p>
      <p><strong>Phone Number:</strong> {selectedBusiness.email}</p>
      <p><strong>Business ID:</strong> {selectedBusiness.id}</p>
    </div>
  );
}

function AdminFollow() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get('loginlocation');
  const franchiselocation = searchParams.get('franchiselocation');
  const id = searchParams.get('id');

  const navigate = useNavigate();

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [spanco, setSpanco] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [Location, setLocation] = useState('');
  const [Country, setCountry] = useState('');
  const [State, setState] = useState('');
  const [District, setDistrict] = useState('');
  const [Area, setArea] = useState('');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [BusinessID, setBusinessID] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [BusinessName, setBusinessName] = useState('');
  const [Visisted, setVisted] = useState('');
  const [productCounts, setProductCounts] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [spancoCount, setSpancoCount] = useState({
    Suspect: 0,
    Prospect: 0,
    Approach: 0,
    Negotiation: 0,
    Close: 0,
    Order: 0,
    Omission: 0
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [servicesSuggestions, setServicesSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedServices, setSelectedServices] = useState('');
  const [nurseOptions, setNurseOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [filterClicked, setFilterClicked] = useState(false);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(false);
  const [PatientType, setPatientType] = useState('')

  const filterRef = useRef(null);

  const handleBusinessClick = async (business) => {
    const businessname = encodeURIComponent(business.phone_number);
    const name = encodeURIComponent(business.full_name);
    const visited = encodeURIComponent(business.visted);
    const id = encodeURIComponent(business.id);
    const nursename = encodeURIComponent(business.nursename);
    const doctorname = encodeURIComponent(business.doctorname);

    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/get-data', {
        params: {
          businessname,
          name,
          visited,
        },
      });
      const data = response.data;
      navigate(`/patientdetails?loginlocation=${username}&businessname=${businessname}&name=${name}&id=${id}&visited=${visited}&nursename=${nursename}&doctorname=${doctorname}`, {
        state: {
          loginlocation: username,
          businessname: business.phone_number,
          name: business.full_name,
          id: business.id,
          visited: business.visted,
          apiData: data,
        },
      });
    } catch (e) {
      console.log(e);
    }
    setSelectedBusiness(business);
  };


  useEffect(() => {
    console.log('Current franchiselocation:', franchiselocation);
    const fetchNursesAndDoctors = async () => {
      try {
        const [nurseResponse, doctorResponse] = await Promise.all([
          axios.get('https://amrithaahospitals.visualplanetserver.in/api/nurse-suggestions', {
            params: { franchiselocation }
          }),
          axios.get('https://amrithaahospitals.visualplanetserver.in/api/doctor-suggestions', {
            params: { franchiselocation }
          })
        ]);
        console.log('Nurse options:', nurseResponse.data);
        console.log('Doctor options:', doctorResponse.data);
        setNurseOptions(nurseResponse.data);
        setDoctorOptions(doctorResponse.data);
      } catch (error) {
        console.error('Error fetching nurse and doctor suggestions:', error);
      }
    };
    if (franchiselocation) {
      fetchNursesAndDoctors();
    }
  }, [franchiselocation]);





  const handleSpancoChange = (newValue) => {
    setSpanco(newValue);
  };

  const handleLocationChange = async (event) => {
    const value = event.target.value;
    setSelectedLocation(value); // Store the raw input (case preserved for display)
    if (value && value.trim().length > 0) {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/adminlocations', {
          params: { search: value }
        });
        setLocationSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setLocationSuggestions([]);
      }
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleServicesChange = async (event) => {
    const value = event.target.value;
    setSelectedServices(value);
    if (value && value.trim().length > 0) {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/adminservices', {
          params: { search: value }
        });
        setServicesSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching services suggestions:', error);
        setServicesSuggestions([]);
      }
    } else {
      setServicesSuggestions([]);
    }
  };

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    setCountry(selectedCountry);
    setState('');
    setDistrict('');
    setArea('');
    fetchStates(selectedCountry);
  };

  const handleStateChange = (event) => {
    const selectedState = event.target.value;
    setState(selectedState);
    setDistrict('');
    setArea('');
    fetchDistrict(selectedState);
  };

  const handleDistrictChange = (event) => {
    const selectedDistrict = event.target.value;
    setDistrict(selectedDistrict);
    setArea('');
    fetchArea(selectedDistrict);
  };

  const handleCompanyChange = (event) => {
    setBusinessName(event.target.value);
    setVisted(event.target.value);
  };

  const handleAreaChange = (event) => {
    setArea(event.target.value);
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleBusinessIDChange = (event) => {
    setBusinessID(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date instanceof Date && !isNaN(date) ? date : null);
  };

  const handleToDateChange = (date) => {
    setToDate(date instanceof Date && !isNaN(date) ? date : null);
  };

  const handleNurseChange = (event) => {
    setSelectedNurse(event.target.value);
  };

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const formatDateToYYMMDD = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const handleSearch = async () => {
    try {
      const formattedDate = formatDateToYYMMDD(selectedDate);
      const formattedFromDate = formatDateToYYMMDD(fromDate);
      const formattedToDate = formatDateToYYMMDD(toDate);

      const queryParams = {
        loginlocation: username,
        spanco,
        Location: selectedLocation, // This will now pass the selected dropdown value
        Services: selectedServices,
        selectedDate: formattedDate,
        id,
        Country,
        State,
        District,
        Area,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        PhoneNumber,
        BusinessID,
        BusinessName,
        franchiselocation,
        NurseName: selectedNurse,
        DoctorName: selectedDoctor
      };
      if (username != 'admin') {
        queryParams.Location = searchParams.get("franchiselocation")
        console.log("Not admin")
      }
      if (PatientType) {
        queryParams.PatientType = PatientType
        console.log("frm submit", PatientType)
      }
      const queryString = new URLSearchParams(queryParams).toString();
      console.log("params=>", queryParams)
      const response = await axios.get(`https://amrithaahospitals.visualplanetserver.in/api/getpatients?${queryString}`);
      const sortedPatients = response.data.sort((a, b) => b.id - a.id);
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching business names:', error);
    }
  };


  useEffect(() => {
    const fetchLoginLocations = async () => {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/adminlocations');
        setLocationOptions(response.data);
      } catch (error) {
        console.error('Error fetching login locations:', error);
      }
    };
    fetchLoginLocations();
  }, []);


  useEffect(() => {
    handleSearch();
    const token = localStorage.getItem('AuthToken')
    console.log("token=>", token)
  }, []);

  useEffect(() => {
    const fetchNursesAndDoctors = async () => {
      try {
        const [nurseResponse, doctorResponse] = await Promise.all([
          axios.get('https://amrithaahospitals.visualplanetserver.in/api/nurse-suggestions', {
            params: { franchiselocation }
          }),
          axios.get('https://amrithaahospitals.visualplanetserver.in/api/doctor-suggestions', {
            params: { franchiselocation }
          })
        ]);
        setNurseOptions(nurseResponse.data);
        setDoctorOptions(doctorResponse.data);
      } catch (error) {
        console.error('Error fetching nurse and doctor suggestions:', error);
      }
    };
    if (franchiselocation) {
      fetchNursesAndDoctors();
    }
  }, [franchiselocation]);

  const handleOpenModal = () => {
    setModalIsOpen(true);
    const spancoCounts = {
      Suspect: 0,
      Prospect: 0,
      Approach: 0,
      Negotiation: 0,
      Close: 0,
      Order: 0,
      Omission: 0
    };

    businesses.forEach(business => {
      spancoCounts[business.spanco]++;
    });

    setSpancoCount(spancoCounts);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setInputFieldsVisible();
  };

  const toggleInputFields = () => {
    setInputFieldsVisible(!inputFieldsVisible);
    const spancoCounts = {};
    businesses.forEach(business => {
      if (business.spanco in spancoCounts) {
        spancoCounts[business.spanco]++;
      } else {
        spancoCounts[business.spanco] = 1;
      }
    });
    setSpancoCount(spancoCounts);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setInputFieldsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchLoginLocations = async () => {
      try {
        const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/adminlocations');
        setLocationOptions(response.data);
      } catch (error) {
        console.error('Error fetching login locations:', error);
      }
    };
    fetchLoginLocations();
  }, []);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get('http://localhost:8081/admincountires');
        setCountryOptions(response.data);
      } catch (error) {
        console.error('Error fetching login locations:', error);
      }
    };
    fetchCountry();
  }, []);

  const fetchStates = async (selectedCountry) => {
    try {
      const response = await axios.get(`http://localhost:8081/adminstates?country=${selectedCountry}`);
      setStateOptions(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchDistrict = async (selectedState) => {
    try {
      const response = await axios.get(`http://localhost:8081/admindistricts?state=${selectedState}`);
      setDistrictOptions(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchArea = async (selectedDistrict) => {
    try {
      const response = await axios.get(`http://localhost:8081/adminareas?district=${selectedDistrict}`);
      setAreaOptions(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get('http://localhost:8081/admincompany');
        setCompanyOptions(response.data);
      } catch (error) {
        console.error('Error fetching login locations:', error);
      }
    };
    fetchCompany();
  }, []);

  const handleClear = () => {
    setSelectedDate(null);
    setFromDate(null);
    setToDate(null);
    setPhoneNumber('');
    setBusinessID('');
    setBusinessName('');
    setSelectedLocation(''); // Reset location dropdown
    setSelectedServices('');
    setSelectedNurse('');
    setSelectedDoctor('');
  };

  const fetchProductCounts = async (queryParamsCount) => {
    try {
      const queryStringCount = new URLSearchParams(queryParamsCount).toString();
      const response = await axios.get(`http://localhost:8081/adminproductcounts?${queryStringCount}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product counts:', error);
      throw error;
    }
  };

  const handleProductClick = async (productName) => {
    try {
      const queryParams = {
        productName,
        Location: selectedLocation,
        Services: selectedServices,
        Country,
        State,
        District,
        Area
      };
      if (productName) {
        queryParams.productName = productName;
      }
      const queryString = new URLSearchParams(queryParams).toString();

      const response = await axios.get(`http://localhost:8081/adminfollowproduct?${queryString}`);
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching business names:', error);
    }
  };

  const handleExportToExcel = () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const ws = XLSX.utils.json_to_sheet(businesses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patient Details");
    XLSX.writeFile(wb, `patient_details_${dateString}.xlsx`);
  };

  const CustomInputF = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <button className="custom-input mrg Date grey" onClick={onClick} ref={ref}>
      {value || 'From'} <FontAwesomeIcon icon={faCalendarAlt} />
    </button>
  ));

  const CustomInputT = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <button className="custom-input mrg Date" onClick={onClick} ref={ref}>
      {value || 'To'} <FontAwesomeIcon icon={faCalendarAlt} />
    </button>
  ));



  return (
    <>
      <div className='admin-header'>
        <img src={myImage} alt="My Image" className="admin-panel-image" />
      </div>
      <div className="centered">
        <h1 className='vp'>
          <span></span>
        </h1>
        <div className='inbody'>
          <div className='inbtn'>
            <div>
              <input
                className="input_AdminFollow"
                type="text"
                placeholder='Enter Patient Name'
                value={BusinessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <input
                className="input_AdminFollow"
                type="text"
                placeholder='Enter Phone Number'
                value={PhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <input
                className="input_AdminFollow"
                type="text"
                placeholder='Enter Patient ID'
                value={BusinessID}
                onChange={handleBusinessIDChange}
              />
            </div>
            {username === 'admin' &&
              <div>
                <select
                  className="input_AdminFollow"
                  value={selectedLocation}
                  onChange={(e) => { setSelectedLocation(e.target.value); console.log(e.target.value) }}
                >
                  <option value="">Select Location</option>
                  {locationOptions.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            }
            <div>
              <input
                className="input_AdminFollow"
                type="text"
                placeholder="Enter Services"
                value={selectedServices}
                onChange={(e) => setSelectedServices(e.target.value)}
              />
            </div>
            <div>
              <select
                className="input_AdminFollow"
                value={selectedNurse}
                onChange={handleNurseChange}
              >
                <option value="">Select Nurse</option>
                {nurseOptions && nurseOptions.length > 0 ? (
                  nurseOptions.map((nurse, index) => (
                    <option key={index} value={nurse}>{nurse}</option>
                  ))
                ) : (
                  <option disabled>No nurses available</option>
                )}
              </select>
            </div>
            <div>
              <select
                className='input_AdminFollow'
                value={PatientType}
                onChange={(e) => { setPatientType(e.target.value); console.log(e.target.value) }}>
                <option value="">Select patient type</option>
                <option value="Inpatient">In-Patient</option>
                <option value="Outpatient">Out-Patient</option>
              </select>
            </div>
            <div>
              <select
                className="input_AdminFollow"
                value={selectedDoctor}
                onChange={handleDoctorChange}
              >
                <option value="">Select Doctor</option>
                {doctorOptions && doctorOptions.length > 0 ? (
                  doctorOptions.map((doctor, index) => (
                    <option key={index} value={doctor}>{doctor}</option>
                  ))
                ) : (
                  <option disabled>No doctors available</option>
                )}
              </select>
            </div>
            <div className="date-picker-container">
              <DatePicker
                selected={fromDate}
                onChange={handleFromDateChange}
                customInput={<CustomInputF className="CustomInputF grey" placeholder="FD" />}
                popperPlacement="bottom-start"
              />
              <DatePicker
                selected={toDate}
                onChange={handleToDateChange}
                customInput={<CustomInputT className="CustomInputT" placeholder="Select Date" />}
                popperPlacement="bottom"
              />
            </div>
          </div>
          <div className="button-row">
            <span
              className="action-icon add-appointment"
              onClick={() => {
                if (username === 'admin') {
                  navigate(`/AddPatientsadmin?loginlocation=${username}`)
                } else {
                  navigate(`/AddPatient?loginlocation=${username}&franchiselocation=${franchiselocation}`)
                }
              }
              }
              title="Add Appointment"
            >
              <FontAwesomeIcon icon={faPlus} />
            </span>
            <span
              className="action-icon clear-filters"
              onClick={handleClear}
              title="Clear Filters"
            >
              <FontAwesomeIcon icon={faBroom} />
            </span>
            <span
              className='action-icon clear-filters'
              onClick={handleSearch}
              title='Apply'
            >
              <TbFilterCheck />
            </span>
            <span className='action-icon clear-filters'
              onClick={handleExportToExcel}
              title='Export to Excel'>
              <RiFileExcel2Line />
            </span>
            <span
              onClick={() => { handleClear(); navigate(`/nursefollow?loginlocation=${username}&franchiselocation=${franchiselocation}`) }}
              title="Appoinments"
              className='action-icon clear-filters'
            >
              <HiMiniCalendarDateRange />
            </span>
            {/* <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleClear(); navigate(`/AddPatientsadmin?loginlocation=${username}`); }}>
              Add Appointment
            </button> */}
            {/* <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleClear(); navigate(`/nursefollow?loginlocation=${username}&franchiselocation=${franchiselocation}`); }}>
              Appointments
            </button> */}
            {/* <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleClear(); }}>
              Clear
            </button> */}
            {/* <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleSearch(); }}>
              Apply
            </button> */}

            {/* <button className='inlabel Afollowbuttonsearchblack' onClick={handleExportToExcel}>
              Export to Excel
            </button> */}
          </div>
        </div>
        <BusinessList
          onBusinessClick={handleBusinessClick}
          businesses={businesses}
          onDownloadBill={handleDownloadBill}
        />
        {selectedBusiness && <BusinessDetails selectedBusiness={selectedBusiness} />}
      </div>
    </>
  );
}

export default AdminFollow;