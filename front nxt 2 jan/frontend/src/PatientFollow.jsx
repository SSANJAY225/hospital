import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { TbFilterCheck } from "react-icons/tb";
import { RiFileExcel2Line } from "react-icons/ri";
import { HiMiniCalendarDateRange } from "react-icons/hi2";
import myImage from './AmirthaLogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faPlus, faBroom, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import style from './style/PatientFollow.module.css'
import { jwtDecode } from "jwt-decode";
import BusinessList from "./Table";
const CONFIG = {
    in: {
        title: "Appointments (InPatients)",
        apiUrl: "http://localhost:5000/api/fetch-patients-in",
        showStatus: true,

    },
    out: {
        title: "Appointments (OutPatients)",
        apiUrl: "http://localhost:5000/api/fetch-patients-out",
        showStatus: true,

    },
    admin: {
        title: "Patients",
        apiUrl: "http://localhost:5000/api/getpatients",
        showStatus: false,

    },
};

function PatientsFollowUpCommon() {
    const { type } = useParams();
    const config = CONFIG[type];
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const username = searchParams.get("loginlocation");
    const franchiselocation = searchParams.get("franchiselocation");
    const [selectedServices, setSelectedServices] = useState('');
    const [data, setData] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [patientId, setPatientId] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [status, setStatus] = useState("notCompleted");
    const [loading, setLoading] = useState(false);
    const [nurseOptions, setNurseOptions] = useState([]);
    const [doctorOptions, setDoctorOptions] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [PatientType, setPatientType] = useState('')
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const getCookie = () => {
        const token = localStorage.getItem("authToken");
        console.log(token);
    }
    if (!config) {
        return <h2 className="text-center">Invalid Page</h2>;
    }

    function formatDate(dateString) {
        if (!dateString) {
            return '-';
        }
    }
    const formatDateToYYMMDD = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return '';
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    const fetchData = async () => {
        try {
            const today = new Date();
            const todayFormatted = today.toISOString().split('T')[0];
            setCurrentDate(todayFormatted);
            const formattedDate = formatDateToYYMMDD(selectedDate);
            const formattedFromDate = formatDateToYYMMDD(fromDate);
            const formattedToDate = formatDateToYYMMDD(toDate);
            const res = await axios.get(config.apiUrl, {
                params: {
                    BusinessName: name,
                    PhoneNumber: phone,
                    BusinessID: patientId,
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                    selectedDate: formattedDate,
                    // loginlocation: username,
                    franchiselocation,
                    NurseName: selectedNurse,
                    DoctorName: selectedDoctor,
                    PatientType,
                    Services: selectedServices,
                    statusFilter: status,
                    currentDate: currentDate,
                },
            });
            console.log({
                BusinessName: name,
                PhoneNumber: phone,
                BusinessID: patientId,
                fromDate: formattedFromDate,
                toDate: formattedToDate,
                selectedDate: formattedDate,
                // loginlocation: username,
                franchiselocation,
                NurseName: selectedNurse,
                DoctorName: selectedDoctor,
                PatientType,
                Services: selectedServices,
                statusFilter: status,
            })
            console.log("get patient", res.data)
            setData(res.data);
            setLoading(true);
        } catch (err) {
            Swal.fire("Error", "Failed to load data", "error");
            console.log(err)
        } finally {
            setLoading(false);
        }
    };
const [first,setFirst]=useState(true)
    useEffect(() => {
        if(first){
        getCookie();
        fetchData();
        setFirst(false)
    }
    }, [type, name, phone, patientId, fromDate, toDate, status]);

    const handleRowClick = (row) => {
        // navigate(
        //     `/patient-follow?id=${row.id}&loginlocation=${username}&franchiselocation=${franchiselocation}`
        // );
        // http://localhost:3000/patientdetails?loginlocation=doctor&businessname=9952535675&name=sanjayy&id=A00U14100&
        // visited=1&nursename=Testing%20nurse%20akka&doctorname=dr%20anna%202
        const businessname = encodeURIComponent(row.phone_number);
        const name = encodeURIComponent(row.full_name);
        const visited = encodeURIComponent(row.visted);
        const id = encodeURIComponent(row.id);
        const nursename = encodeURIComponent(row.nursename);
        const doctorname = encodeURIComponent(row.doctorname);
        navigate(`/patient-follow/${type}?id=${row.id}&name=${name}&businessname=${businessname}&loginlocation=${username}&franchiselocation=${franchiselocation}&visited=${visited}&nursename=${nursename}&doctorname=${doctorname}`)
    };


    // 📤 EXPORT TO EXCEL
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Patients");
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buf]), `${type}-patients.xlsx`);
    };
    const CustomInputT = React.forwardRef(({ value, onClick, placeholder }, ref) => (
        <button className={`${style.custom_input} ${style.mrg} ${style.Date}`} onClick={onClick} ref={ref}>
            {value || 'To'} <FontAwesomeIcon icon={faCalendarAlt} />
        </button>
    ));
    const CustomInputF = React.forwardRef(({ value, onClick, placeholder }, ref) => (
        <button className={`${style.custom_input} ${style.mrg} ${style.Date} ${style.grey}`} onClick={onClick} ref={ref}>
            {value || 'From'} <FontAwesomeIcon icon={faCalendarAlt} />
        </button>
    ));

    useEffect(() => {
        console.log('Current franchiselocation:', franchiselocation);
        const fetchNursesAndDoctors = async () => {
            try {
                const [nurseResponse, doctorResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/nurse-suggestions', {
                        params: { franchiselocation }
                    }),
                    axios.get('http://localhost:5000/api/doctor-suggestions', {
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
    const handleNurseChange = (event) => {
        setSelectedNurse(event.target.value);
    };

    const handleDoctorChange = (event) => {
        setSelectedDoctor(event.target.value);
    }
    const handelclear = () => {
        console.log('clear')
    }
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
            const response = await axios.get(`http://localhost:5000/api/getpatients?${queryString}`);
            const sortedPatients = response.data.sort((a, b) => b.id - a.id);
            setBusinesses(response.data);
        } catch (error) {
            console.error('Error fetching business names:', error);
        }
    };

    const handleExportToExcel = () => {
        if (!data || data.length === 0) {
            Swal.fire("No Data", "Nothing to export", "warning");
            return;
        }

        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Patient Details");

        XLSX.writeFile(wb, `patient_details_${dateString}.xlsx`);
    };

    const formatDMY = (isoString) => {
        const [year, month, day] = isoString.split("T")[0].split("-");
        return `${day}-${month}-${year}`;
    };


    return (<>
        <div className={style.admin_header}>
            <img src={myImage} alt="My Image" className={style.admin_panel_image} />
        </div>
        <div className={style.centered}>
            <h2 className={style.bus}></h2>

            {/* 🔍 FILTERS */}
            <div className={`${style.inbody}`}>
                <div className={style.inbtn}>
                    <div>
                        <input
                            placeholder="Patient Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={style.input_AdminFollow}
                        />
                    </div>
                    <div>
                        <input
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={style.input_AdminFollow}
                        />
                    </div>
                    {/* <div>
                        <input
                            placeholder="Patient ID"
                            value={patientId}
                            className={style.input_AdminFollow}
                            onChange={(e) => setPatientId(e.target.value)}
                        />
                    </div> */}
                    {!config.showStatus && (<>
                        <div>
                            <input
                                className={style.input_AdminFollow}
                                type="text"
                                placeholder="Enter Services"
                                value={selectedServices}
                                onChange={(e) => setSelectedServices(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className={style.input_AdminFollow}
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
                                className={style.input_AdminFollow}
                                value={PatientType}
                                onChange={(e) => { setPatientType(e.target.value); console.log(e.target.value) }}>
                                <option value="">Select patient type</option>
                                <option value="Inpatient">In-Patient</option>
                                <option value="Outpatient">Out-Patient</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className={style.input_AdminFollow}
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
                    </>)}
                    <div className={style.filter_dates}>
                        <DatePicker
                            selected={fromDate}
                            onChange={setFromDate}
                            placeholderText="From Date"
                            popperPlacement="bottom"
                            customInput={<CustomInputF className="custom-input grey" placeholder="From Date" />}
                        />
                        <DatePicker
                            selected={toDate}
                            onChange={setToDate}
                            placeholderText="To Date"
                            popperPlacement="bottom"
                            customInput={<CustomInputT className="custom-input" placeholder="To Date" />}
                        />
                    </div>
                    {config.showStatus && (
                        <div className={style.filter_status}>
                            <label className={style.status_label}>
                                <input
                                    type="radio"
                                    value="notCompleted"
                                    checked={status === 'notCompleted'}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                                Not Completed
                            </label>
                            <label className={style.status_label}>
                                <input
                                    type="radio"
                                    value="completed"
                                    checked={status === 'completed'}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                                Completed
                            </label>
                        </div>
                    )}
                </div>
                <div className={style.button_row}>
                    <span onClick={fetchData}><button>apply</button></span>
                    <span
                        className={`${style.action_icon} ${style.add_appointment}`}
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
                        className={`${style.action_icon} ${style.clear_filters}`}
                        onClick={handelclear}
                        title="Clear Filters"
                    >
                        <FontAwesomeIcon icon={faBroom} />
                    </span>
                    <span
                        className={`${style.action_icon} ${style.clear_filters}`}
                        onClick={handleSearch}
                        title='Apply'
                    >
                        <TbFilterCheck />
                    </span>
                    <span className={`${style.action_icon} ${style.clear_filters}`}
                        onClick={handleExportToExcel}
                        title='Export to Excel'>
                        <RiFileExcel2Line />
                    </span>
                    <span
                        onClick={() => { handelclear(); navigate(`/nursefollow?loginlocation=${username}&franchiselocation=${franchiselocation}`) }}
                        title="Appoinments"
                        className={`${style.action_icon} ${style.clear_filters}`}
                    >
                        <HiMiniCalendarDateRange />
                    </span>
                </div>
            </div>
            <BusinessList onBusinessClick={handleRowClick} businesses={data}></BusinessList>
        </div>
    </>);
}

export default PatientsFollowUpCommon;
