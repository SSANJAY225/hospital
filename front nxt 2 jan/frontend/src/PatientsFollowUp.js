import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Import SweetAlert2

import Modal from 'react-modal';
import './PatientsFollowUp.css';
import myImage from './AmirthaLogo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function BusinessList({ onBusinessClick, businesses }) {
  // Sort by id in descending order
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

function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return '-';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
  const day = String(date.getDate()).padStart(2, '0');

  // Format the date as DD-MM-YYYY
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
  const franchiselocation = searchParams.get('franchiselocation');

  const username = searchParams.get('loginlocation');
  const id = searchParams.get('id');

  const navigate = useNavigate()
  const auth = localStorage.getItem('authToken')
  useEffect(() => {
    if (!auth) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Authenticated',
        text: 'Please log in to access this page.',
      });
      navigate('/')
    }
  }, [auth])

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

  const [filterClicked, setFilterClicked] = useState(false);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(false);

  const filterRef = useRef(null);

  const handleBusinessClick = (business) => {
    const businessname = encodeURIComponent(business.phone_number);
    const name = encodeURIComponent(business.full_name)
    const visited = encodeURIComponent(business.visted)
    const id = encodeURIComponent(business.id);
    navigate(`/adminform?loginlocation=${username}&businessname=${businessname}&name=${name}&id=${id}&visited=${visited}`);
    setSelectedBusiness(business);
  };



  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleBusinessIDChange = (event) => {
    setBusinessID(event.target.value);
  };


  const handleFromDateChange = (date) => {
    setFromDate(date instanceof Date ? date : null);
  };

  const handleToDateChange = (date) => {
    setToDate(date instanceof Date ? date : null);
  };


  const handleClear = () => {
    setSelectedDate(null);
    setFromDate(null);
    setToDate(null);
    setPhoneNumber('');
    setBusinessID('');
    setBusinessName('');
  };

  const filterBusinessesByToday = () => {
    const today = new Date();
    const filteredBusinesses = businesses.filter(business => {
      const businessDate = new Date(business.dateofnextmeeting);
      return businessDate.getDate() === today.getDate() &&
        businessDate.getMonth() === today.getMonth() &&
        businessDate.getFullYear() === today.getFullYear();
    });
    return filteredBusinesses;
  };
  const formatDateToYYMMDD = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return ''; // Ensure valid date
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
    const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
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
        Location,
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
        franchiselocation, // Already included
      };

      const queryParamsCount = {
        Country,
        State,
        District,
        Area,
        Location,
      };

      const queryString = new URLSearchParams(queryParams).toString();
      const queryStringCount = new URLSearchParams(queryParamsCount).toString();

      const response = await axios.get(`http://amrithaahospitals.visualplanetserver.in/api/fetch-patients?${queryString}`);
      const sortedPatients = response.data.sort((a, b) => b.id - a.id); // Sort in descending order

      setBusinesses(response.data);
      setProductCounts(productCounts);
    } catch (error) {
      console.error('Error fetching business names:', error);
    }
  };


  // Fetch data on component mount and every 5 seconds
  useEffect(() => {
    handleSearch();

    // Cleanup interval on component unmount
  }, []); // Empty dependency array ensures this runs only on mount

  // Function to fetch product counts (assumed to be defined elsewhere)


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


  const handleExportToExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = 'business_data_detailed_summary';

    const spancoCounts = {};
    businesses.forEach(business => {
      spancoCounts[business.spanco] = (spancoCounts[business.spanco] || 0) + 1;
    });

    const handleFromDateChange = (date) => {
      setFromDate(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
    };

    const handleToDateChange = (date) => {
      setToDate(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
    };


    const summaryItems = businesses.map(business => ({
      ...business,
      'Spanco Count': spancoCounts[business.spanco] > 1 ? `${business.spanco} (${spancoCounts[business.spanco]})` : business.spanco
    }));

    const ws = XLSX.utils.json_to_sheet(summaryItems);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, fileName + fileExtension);
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
  const CustomInputN = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <button className="custom-input mrg Date" onClick={onClick} ref={ref}>
      {value || ''} <FontAwesomeIcon icon={faCalendarAlt} />
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
            <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleClear(); navigate(`/AddPatient?loginlocation=${username}`); }}>
              Add Appointment
            </button>

            <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleClear(); navigate(`/nursefollow? loginlocation=${username}`); }}>Appoinments</button>

            <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleClear(); }}>
              Clear
            </button>
            <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleSearch(); }}>
              Apply
            </button>
          </div>
        </div>
        <BusinessList onBusinessClick={handleBusinessClick} businesses={businesses} />
        {selectedBusiness && <BusinessDetails selectedBusiness={selectedBusiness} />}
      </div>
    </>
  );
}


export default AdminFollow;