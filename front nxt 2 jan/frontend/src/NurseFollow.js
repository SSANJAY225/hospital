import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { faCalendarAlt, faPlus, faBroom, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import './NurseFollow.css';
import myImage from './AmirthaLogo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function BusinessList({ onBusinessClick, businesses, isLoading }) {
  console.log('BusinessList businesses:', businesses);

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
        {isLoading ? (
          <p>Loading...</p>
        ) : sortedBusinesses.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table className="table table-bordered">
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
        )}
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');
}

function BusinessDetails({ selectedBusiness }) {
  return (
    <div className="business-details">
      <h2>Business Details</h2>
      <p><strong>Name:</strong> {selectedBusiness.phone_number || '-'}</p>
      <p><strong>Next Meeting:</strong> {formatDate(selectedBusiness.dateofnextmeeting)}</p>
      <p><strong>Spanco Stage:</strong> {selectedBusiness.spanco || '-'}</p>
      <p><strong>Phone Number:</strong> {selectedBusiness.email || '-'}</p>
      <p><strong>Business ID:</strong> {selectedBusiness.id || '-'}</p>
    </div>
  );
}

function NurseFollow() {
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
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [nextDate, setNextDate] = useState(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  });
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
    Omission: 0,
  });
  const [completionStatus, setCompletionStatus] = useState('not_completed');
  const [isLoading, setIsLoading] = useState(false);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(false);
  const filterRef = useRef(null);

  const handleClearFilters = () => {
    setBusinessName('');
    setPhoneNumber('');
    setBusinessID('');
    setFromDate(null);
    setToDate(null);
    setCompletionStatus('not_completed');
    setSpanco('');
    setLocation('');
    setCountry('');
    setState('');
    setDistrict('');
    setArea('');
    setSelectedDate(null);

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    const nextDayFormatted = nextDay.toISOString().split('T')[0];
    setCurrentDate(todayFormatted);
    setNextDate(nextDayFormatted);
  };

  const handleBusinessClick = (business) => {
    const businessname = encodeURIComponent(business.phone_number || '');
    const name = encodeURIComponent(business.full_name || '');
    const visited = encodeURIComponent(business.visted || '');
    const id = encodeURIComponent(business.id || '');
    const nursename = encodeURIComponent(business.nursename || '');

    if (completionStatus === 'completed') {
      navigate(
        `/NurseCompletedForm?loginlocation=${username}&businessname=${businessname}&name=${name}&id=${id}&visited=${visited}&franchiselocation=${franchiselocation}&nursename=${nursename}`
      );
    } else if (completionStatus === 'not_completed') {
      navigate(
        `/nurseform?loginlocation=${username}&businessname=${businessname}&name=${name}&id=${id}&visited=${visited}&franchiselocation=${franchiselocation}`
      );
    }
    setSelectedBusiness(business);
  };

  const handleSpancoChange = (newValue) => {
    setSpanco(newValue);
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleBusinessIDChange = (event) => {
    setBusinessID(event.target.value);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleCompletionStatusChange = (value) => {
    setCompletionStatus(value);
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    const nextDayFormatted = nextDay.toISOString().split('T')[0];

    setCurrentDate(todayFormatted);
    setNextDate(nextDayFormatted);
  };

  const formatDateToYYMMDD = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const handleSearch = async (overrideCurrentDate, overrideNextDate) => {
    try {
      setIsLoading(true);
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
        PhoneNumber: PhoneNumber.trim(),
        BusinessID,
        BusinessName: BusinessName.trim(),
        franchiselocation,
        completionStatus,
        currentDate: overrideCurrentDate || currentDate || '',
        nextDate: overrideNextDate || nextDate || '',
      };

      console.log('Query Parameters:', queryParams);
      const queryString = new URLSearchParams(queryParams).toString();

      const response = await axios.get(
        `https://amrithaahospitals.visualplanetserver.in/api/fetch-patients-nurse?${queryString}`
      );
      console.log('Fetched Data:', response.data);
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching business names:', error);
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    handleSearch(currentDate, nextDate);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setIsLoading(true);
      handleSearch();
    }, 300);

    return () => clearTimeout(debounce);
  }, [
    BusinessName,
    PhoneNumber,
    BusinessID,
    fromDate,
    toDate,
    completionStatus,
    spanco,
    Location,
    Country,
    State,
    District,
    Area,
    selectedDate,
    username,
    id,
    franchiselocation,
  ]);


  const handleLogout = () => {
    navigate('/');
    localStorage.removeItem('authToken');
  };


  useEffect(() => {
    console.log('businesses state updated:', businesses);
  }, [businesses]);

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
    setInputFieldsVisible(false);
  };

  const toggleInputFields = () => {
    setInputFieldsVisible(!inputFieldsVisible);
    const spancoCounts = {};
    businesses.forEach((business) => {
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

        <div className="inbody">
          <div className="inbtn">
            <div>
              <input
                className="input_AdminFollow"
                type="text"
                placeholder="Enter Patient Name"
                value={BusinessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <input
                className="input_AdminFollow"
                type="text"
                placeholder="Enter Phone Number"
                value={PhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <input
                className="input_AdminFollow"
                type="text"
                placeholder="Enter Patient ID"
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
                isClearable
              />
              <DatePicker
                selected={toDate}
                onChange={handleToDateChange}
                customInput={<CustomInputT className="CustomInputT" placeholder="Select Date" />}
                popperPlacement="bottom"
                isClearable
              />
            </div>
            <div className="completion-status-filter">
              <label>
                <input
                  type="radio"
                  value="not_completed"
                  checked={completionStatus === 'not_completed'}
                  onChange={() => handleCompletionStatusChange('not_completed')}
                />
                Not Completed
              </label>
              <label>
                <input
                  type="radio"
                  value="completed"
                  checked={completionStatus === 'completed'}
                  onChange={() => handleCompletionStatusChange('completed')}
                />
                Completed
              </label>
            </div>
          </div>
          <div className="button-row">
            <span
              className="action-icon add-appointment"
              onClick={() =>
                navigate(`/AddPatient?loginlocation=${username}&franchiselocation=${franchiselocation}`)
              }
              title="Add Appointment"
            >
              <FontAwesomeIcon icon={faPlus} />
            </span>
            <span
              className="action-icon clear-filters"
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <FontAwesomeIcon icon={faBroom} />
            </span>

            <span
              className="action-icon logoutnurse"
              onClick={handleLogout}
              title="LogOut"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </span>

          </div>
        </div>
        <BusinessList onBusinessClick={handleBusinessClick} businesses={businesses} isLoading={isLoading} />
        {selectedBusiness && <BusinessDetails selectedBusiness={selectedBusiness} />}
      </div>
    </>
  );
}

export default NurseFollow;