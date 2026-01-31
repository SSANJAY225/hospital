import { useNavigate, useLocation, useParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import style from './style/BillingHistory.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from "jwt-decode";
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import myImage from './AmirthaLogo.png';
import BusinessList from "./Table";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faBroom } from '@fortawesome/free-solid-svg-icons';
import { TbFilterCheck } from "react-icons/tb";
const CONFIG = {
    common: {
        title: "common billing",
        apiUrl: "http://localhost:5000/api/fetch-patients-receptionbilling",
        showStatus: true,

    },
    history: {
        title: "history",
        apiUrl: "http://localhost:5000/get-files",
        showStatus: false,

    },
    admin: {
        title: "admin billing",
        apiUrl: "http://localhost:5000/get-adminfiles",
        showStatus: false,

    },
};
const Billing = () => {
    const { type } = useParams()
    const config = CONFIG[type];
    const location = useLocation();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [phoneFilter, setPhoneFilter] = useState("");
    const [visitFilter, setVisitFilter] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const navigate = useNavigate();
    const itemsPerPage = 25;
    const maxPageButtons = 5;
    const token = localStorage.getItem("authToken");
    const [BusinessID, setBusinessID] = useState('')
    const getData = async () => {
        try {
            if (token) {
                const decoded = jwtDecode(token)
                const role = decoded.roll;
                console.log(role);
                // let link = ''
                // if (role === 'admin') { link = "http://localhost:5000/get-adminfiles" }
                // else { link = "http://localhost:5000/get-files" }
                const res = await axios.get(config.apiUrl, { headers: { Authorization: `Bearer ${token}` } })
                const reversed = res.data.reverse();
                console.log(reversed)
                setData(reversed);
                setFilteredData(reversed); // Initially set filteredData to all data
                console.log(data)

                // Calculate initial total price from all data
                const total = reversed.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
                setTotalPrice(total);
            }
        } catch (err) {
            console.error(err);
            setTotalPrice(0);
        }
    };
    const handleBusinessIDChange = (event) => {
        setBusinessID(event.target.value);
    };
    const sortedBusinesses = [...data].sort((a, b) => b.id - a.id);
    function formatDate(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    }
    useEffect(() => {
        getData();
    }, []);
    const applyFilters = () => {
        let filtered = [...data];

        if (nameFilter.trim()) {
            filtered = filtered.filter(item =>
                (item.full_name || "")
                    .toLowerCase()
                    .includes(nameFilter.trim().toLowerCase())
            );
        }

        if (phoneFilter.trim()) {
            filtered = filtered.filter(item =>
                String(item.phone_number || item.Phone_number || "")
                    .includes(phoneFilter.trim())
            );
        }

        if (visitFilter.trim()) {
            filtered = filtered.filter(item =>
                String(item.visted || item.Visted || "")
                    .includes(visitFilter.trim())
            );
        }

        if (fromDate) {
            filtered = filtered.filter(item => {
                const d = item.appointment_date || item.Visted;
                return d && new Date(d) >= fromDate;
            });
        }

        if (toDate) {
            filtered = filtered.filter(item => {
                const d = item.appointment_date || item.Visted;
                return d && new Date(d) <= toDate;
            });
        }

        setFilteredData(filtered);

        const total = filtered.reduce(
            (sum, item) => sum + (parseFloat(item.total_price) || 0),
            0
        );
        setTotalPrice(total);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (type != 'common') {
            const delay = setTimeout(() => {
                applyFilters();
            }, 400);
            return () => clearTimeout(delay);
        }
    }, [nameFilter, phoneFilter, visitFilter, fromDate, toDate, data]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPages) {
            setCurrentPage(pageNum);
        }
    };

    const handleClear = () => {
        setNameFilter("");
        setPhoneFilter("");
        setVisitFilter("");
        setFromDate(null);
        setToDate(null);
        applyFilters();
        setFilteredData(data); // Reset to all data

        // Calculate total price from all data when cleared
    };

    const getPageNumbers = () => {
        const halfMax = Math.floor(maxPageButtons / 2);
        let start = Math.max(1, currentPage - halfMax);
        let end = Math.min(totalPages, start + maxPageButtons - 1);

        if (end - start + 1 < maxPageButtons) {
            start = Math.max(1, end - maxPageButtons + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };
    const handleEdit = (item) => {
        console.log(item)
        const searchParams = new URLSearchParams(location.search);
        const loginLocation = searchParams.get('loginlocation')
        const franchiselocation = searchParams.get('franchiselocation')
        console.log("data from front end params", loginLocation, franchiselocation)
        // loginLocation=${}&franchiselocation=${}
        navigate(`/AdminBillingForm?loginlocation=${loginLocation}&franchiselocation=${franchiselocation}&user=${item.full_name}&phonenumber=${item.Phone_number}&visit=${item.Visted}`);
    }
    const handleBusinessClick = async (business) => {
        const businessname = encodeURIComponent(business.phone_number);
        const doctorName = encodeURIComponent(business.doctorname);
        const nurseName = encodeURIComponent(business.nursename);
        const MemberType = encodeURIComponent(business.membertype);
        const belongedlocation = encodeURIComponent(business.belongedlocation);
        const name = encodeURIComponent(business.full_name)
        const visited = encodeURIComponent(business.visted)
        const id = encodeURIComponent(business.id);
        // const req=await axios.get(`http://localhost:5000/billingdoc/${businessname}/${name}/${visited}`)
        // // console.log(req.data)
        // loginlocation=${username}&
        navigate(`/BillingForm/${type}?user=${name}&businessname=${businessname}&name=${name}&id=${id}&visited=${visited}&MemberType=${MemberType}&belongedlocation=${belongedlocation}`);
        // setSelectedBusiness(business);
    };

    const handleFromDateChange = (date) => {
        setFromDate(date);
    };
    const handleToDateChange = (date) => {
        setToDate(date);
    };
    const CustomInputF = React.forwardRef(({ value, onClick, placeholder }, ref) => (
        <button className={`${style.custom_input} ${style.mrg} ${style.Date} ${style.grey}`} onClick={onClick} ref={ref}>
            {value || 'From'} <FontAwesomeIcon icon={faCalendarAlt} />
        </button>
    ));
    const CustomInputT = React.forwardRef(({ value, onClick, placeholder }, ref) => (
        <button className={`${style.custom_input} ${style.mrg} ${style.Date}`} onClick={onClick} ref={ref}>
            {value || 'To'} <FontAwesomeIcon icon={faCalendarAlt} />
        </button>
    ));

    return (<>
        <p>{config.title}</p>
        <div className={style.admin_header}>
            <img src={myImage} alt="My Image" className={style.admin_panel_image} />
        </div>
        <div className={style.centered}>
            <h1 className={style.vp}>
                <span></span>
            </h1>
            {type != 'common' ? (<>
                <div className={style.inbody}>
                    <h2>Billing History</h2>
                    <h3>Total Price: ₹{totalPrice.toFixed(2)}</h3>
                    <div className={style.inbtn}>
                        <div className={style.filter_item}>
                            <input
                                className={style.input_AdminFollow}
                                type="text"
                                placeholder="Search by Name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                            />
                        </div>
                        <div className={style.filter_item}>
                            <input
                                className={style.input_AdminFollow}
                                type="text"
                                placeholder="Search by Phone Number"
                                value={phoneFilter}
                                onChange={(e) => setPhoneFilter(e.target.value)}
                            />
                        </div>
                        <div className={style.filter_item}>
                            <input
                                className={style.input_AdminFollow}
                                type="text"
                                placeholder="Search by Visited"
                                value={visitFilter}
                                onChange={(e) => setVisitFilter(e.target.value)}
                            />
                        </div>
                        <div className={style.filter_item}>
                            <DatePicker
                                selected={fromDate}
                                onChange={(date) => setFromDate(date)}
                                placeholderText="From Date"
                                className={style.input_AdminFollow}
                                dateFormat="yyyy-MM-dd"
                                wrapperClassName="datePickerWrapper"
                                popperClassName="datePickerPopper"
                                popperPlacement="bottom-start"
                            />
                        </div>
                        <div className={style.filter_item}>
                            <DatePicker
                                selected={toDate}
                                onChange={(date) => setToDate(date)}
                                placeholderText="To Date"
                                className={style.input_AdminFollow}
                                dateFormat="yyyy-MM-dd"
                                wrapperClassName="datePickerWrapper"
                                popperClassName="datePickerPopper"
                                popperPlacement="bottom-start"
                            />
                        </div>
                    </div>
                    <div className={style.button_row}>
                        <button className={`${style.inlabel} ${style.Afollowbuttonsearchblack}`} onClick={handleClear}>
                            Clear
                        </button>
                    </div>
                </div>
            </>) : (<>
                <div className={style.inbody}>
                    <div className={style.inbtn}>
                        <div>
                            <input
                                className={style.input_AdminFollow}
                                type="text"
                                placeholder='Enter Patient Name'
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                className={style.input_AdminFollow}
                                type="text"
                                placeholder='Enter Phone Number'
                                value={phoneFilter}
                                onChange={(e) => setPhoneFilter(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                className={style.input_AdminFollow}
                                type="text"
                                placeholder='Enter Patient ID'
                                value={BusinessID}
                                onChange={handleBusinessIDChange}
                            />
                        </div>
                        <div className={style.date_picker_container}>
                            <DatePicker
                                selected={fromDate}
                                onChange={handleFromDateChange}
                                customInput={<CustomInputF className={`${style.CustomInputF} ${style.grey}`} placeholder="FD" />}
                                popperPlacement="bottom-start"
                            />
                            <DatePicker
                                selected={toDate}
                                onChange={handleToDateChange}
                                customInput={<CustomInputT className={style.CustomInputT} placeholder="Select Date" />}
                                popperPlacement="bottom"
                            />
                        </div>
                    </div>
                    <div className={style.button_row}>
                        {/* <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleClear(); }}>
              Clear
            </button> */}
                        <span
                            className={`${style.action_icon} ${style.clear_filters}`}
                            onClick={() => { handleClear();  }}
                            title="Clear Filters"
                        >
                            <FontAwesomeIcon icon={faBroom} />
                        </span>
                        {/* <button className='inlabel Afollowbuttonsearchblack' onClick={() => { handleSearch(); }}> */}
                        <span
                            className={`${style.action_icon} ${style.clear_filters}`}
                            onClick={applyFilters}
                            title="Search"
                        >
                            <TbFilterCheck />

                        </span>
                        {/* </button> */}
                    </div>
                </div>
            </>)}

        </div>
        {type === 'common' ? (<>
            <div className={style.container_fluid}>
                <h2 className={style.bus}></h2>
                <div className={style.table_responsive}>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th className={style.th}>Patient Name</th>
                                <th className={style.th}>Age / Gender</th>
                                <th className={style.th}>Phone Number</th>
                                <th className={style.th}>Services</th>
                                <th className={style.th}>Appoinment Date</th>
                                <th className={style.th}>Visit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((business, index) => (
                                <tr key={index} onClick={() => handleBusinessClick(business)}>
                                    <td className={style.td}>{business.full_name}</td>
                                    <td className={style.td}>{business.age} / {business.gender}</td>
                                    <td className={style.td}>{business.phone_number}</td>
                                    <td className={style.td}>{business.services}</td>
                                    <td className={style.td}>{formatDate(String(business.appointment_date))}</td>
                                    <td className={style.td}>{business.visted}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>) : (<>
            <div className={style.container_fluid}>
                <div className={style.table_responsive}>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Visited</th>
                                <th>Total Price</th>
                                <th>Download</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item, index) => (
                                <tr key={index}>

                                    <td>{item.full_name}</td>
                                    <td>{item.Phone_number}</td>
                                    <td>{item.Visted}</td>
                                    <td>₹{parseFloat(item.total_price || 0).toFixed(2)}</td>
                                    <td>
                                        <a href={`http://localhost:5000/downloadbill/${item.Phone_number}_${item.Visted}.pdf`}
                                        // download
                                        >
                                            <button>Download</button>
                                        </a>
                                    </td>
                                    <td><button onClick={() => handleEdit(item)}>Edit</button></td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>)
        }
        {/* Pagination Controls */}
        {
            totalPages > 1 && (
                <div className={style.pagination_container}>
                    <button
                        className={style.pagination_arrow}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ←
                    </button>
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            className={`pagination_button ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}
                    <button
                        className={style.pagination_arrow}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        →
                    </button>
                </div>
            )
        }
    </>)
}

export default Billing