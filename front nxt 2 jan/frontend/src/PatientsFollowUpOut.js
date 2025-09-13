import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { faCalendarAlt, faPlus, faBroom, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import './PatientsFollowUp.css';
import myImage from './AmirthaLogo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function BusinessList({ onBusinessClick, businesses }) {
  // Sort businesses by queue in descending order
  const sortedBusinesses = Array.isArray(businesses)
    ? [...businesses].sort((a, b) => {
      const queueA = a.queue != null ? Number(a.queue) : -Infinity;
      const queueB = b.queue != null ? Number(b.queue) : -Infinity;
      return queueB - queueA;
    })
    : [];

  return (
    <div className="container-fluid">
      <h2 className="bus"></h2>
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
              <tr key={business.id || index} onClick={() => onBusinessClick(business)}>
                <td>{business.full_name || '-'}</td>
                <td>
                  {business.age || business.gender
                    ? `${business.age || '-'} / ${business.gender || '-'}`
                    : '-'}
                </td>
                <td>{business.phone_number || '-'}</td>
                <td>{business.services || '-'}</td>
                <td>{formatDate(String(business.appointment_date))}</td>
                <td>{business.visted || '-'}</td>
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
      <p><strong>Name:</strong> {selectedBusiness.phone_number || '-'}</p>
      <p><strong>Next Meeting:</strong> {formatDate(selectedBusiness.dateofnextmeeting) || '-'}</p>
      <p><strong>Spanco Stage:</strong> {selectedBusiness.spanco || '-'}</p>
      <p><strong>Phone Number:</strong> {selectedBusiness.email || '-'}</p>
      <p><strong>Business ID:</strong> {selectedBusiness.id || '-'}</p>
    </div>
  );
}

function PatientsFollowUpOut() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const franchiselocation = searchParams.get('franchiselocation');
  const username = searchParams.get('loginlocation');
  const id = searchParams.get('id');

  const navigate = useNavigate();
  const auth = localStorage.getItem('authToken');

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
  const [Visited, setVisited] = useState('');
  const [productCounts, setProductCounts] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [spancoCount, setSpancoCount] = useState({
    Suspect: 0,
    Prospect: 0,
    Approach: 0,
    Negotiation: 0,
    Close: 0,
    Order: 0,
    Omission: 0,
  });
  const [statusFilter, setStatusFilter] = useState('notCompleted');

  const filterRef = useRef(null);

  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBusinessClick = (business) => {
    const businessname = encodeURIComponent(business.phone_number || '');
    const name = encodeURIComponent(business.full_name || '');
    const visited = encodeURIComponent(business.visted || '');
    const id = encodeURIComponent(business.id || '');
    const nursename = encodeURIComponent(business.nursename || '');

    const basePath = statusFilter === 'completed' ? '/PatientFormCompleted' : '/adminformout';
    const queryString = `loginlocation=${username}&businessname=${businessname}&name=${name}&id=${id}&visited=${visited}&nursename=${nursename}&franchiselocation=${franchiselocation}`;

    console.log(`Navigating to: ${basePath}?${queryString}`);
    navigate(`${basePath}?${queryString}`);
    setSelectedBusiness(business);
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
      const currentDate = getCurrentDate();

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
        franchiselocation,
        statusFilter,
        currentDate,
      };

      console.log('Query Params:', queryParams);

      const queryString = new URLSearchParams(queryParams).toString();

      const response = await axios.get(`http://amrithaahospitals.visualplanetserver.in/api/fetch-patients-out?${queryString}`);
      console.log('API Response:', response.data);

      setBusinesses(response.data);
      console.log('Businesses state updated:', response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Error',
        text: 'Failed to fetch patients. Please try again.',
      });
    }
  };

  useEffect(() => {
    console.log('Effect triggered with statusFilter:', statusFilter);
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [BusinessName, PhoneNumber, BusinessID, fromDate, toDate, statusFilter]);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleOpenModal = () => {
    setModalIsOpen(true);

    const spancoCounts = {
      Suspect: 0,
      Prospect: 0,
      Approach: 0,
      Negotiation: 0,
      Close: 0,
      Order: 0,
      Omission: 0,
    };

    businesses.forEach((business) => {
      spancoCounts[business.spanco]++;
    });

    setSpancoCount(spancoCounts);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleExportToExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = 'business_data_detailed_summary';

    const spancoCounts = {};
    businesses.forEach((business) => {
      spancoCounts[business.spanco] = (spancoCounts[business.spanco] || 0) + 1;
    });

    const summaryItems = businesses.map((business) => ({
      ...business,
      'Spanco Count':
        spancoCounts[business.spanco] > 1
          ? `${business.spanco} (${spancoCounts[business.spanco]})`
          : business.spanco,
    }));

    const ws = XLSX.utils.json_to_sheet(summaryItems);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
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

  return (
    <>
      <div className="admin-header">
        <img src={myImage} alt="My Image" className="admin-panel-image" />
      </div>
      <div className="centered">
        <h1 className="vp">
          <span></span>
        </h1>

        <div className="filter-section">
          <div className="filter-container">
            <div className="filter-inputs">
              <input
                className="filter-input"
                type="text"
                placeholder="Enter Patient Name"
                value={BusinessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <input
                className="filter-input"
                type="text"
                placeholder="Enter Phone Number"
                value={PhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <input
                className="filter-input"
                type="text"
                placeholder="Enter Patient ID"
                value={BusinessID}
                onChange={(e) => setBusinessID(e.target.value)}
              />
            </div>
            <div className="filter-dates">
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date instanceof Date ? date : null)}
                customInput={<CustomInputF className="custom-input grey" placeholder="From Date" />}
                popperPlacement="bottom-start"
              />
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date instanceof Date ? date : null)}
                customInput={<CustomInputT className="custom-input" placeholder="To Date" />}
                popperPlacement="bottom"
              />
            </div>
            <div className="filter-status">
              <label className="status-label">
                <input
                  type="radio"
                  value="notCompleted"
                  checked={statusFilter === 'notCompleted'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                Not Completed
              </label>
              <label className="status-label">
                <input
                  type="radio"
                  value="completed"
                  checked={statusFilter === 'completed'}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                Completed
              </label>
            </div>
            <div className="filter-actions">
              {/* <button
                className="professional-btn btn-primary"
                onClick={() => navigate(`/AddPatient?loginlocation=${username}&franchiselocation=${franchiselocation}`)}
              >
                Add Appointment
              </button> */}
              <span
                className="action-icon add-appointment"
                onClick={() =>
                  navigate(`/AddPatient?loginlocation=${username}&franchiselocation=${franchiselocation}`)
                }
                title="Add Appointment"
              >
                <FontAwesomeIcon icon={faPlus} />
              </span>
            </div>
          </div>
        </div>
        <BusinessList onBusinessClick={handleBusinessClick} businesses={businesses} />
        {selectedBusiness && <BusinessDetails selectedBusiness={selectedBusiness} />}
      </div>
    </>
  );
}

export default PatientsFollowUpOut;