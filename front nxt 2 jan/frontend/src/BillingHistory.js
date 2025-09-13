import { useEffect, useState } from "react";
import { useNavigate ,useLocation} from 'react-router-dom';
import axios from "axios";
import './BillingHistory.css';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from "jwt-decode";
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import myImage from './AmirthaLogo.png';

const BillingHistory = () => {
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
    const getData = async () => {
        try {
            if (token) {
                const decoded = jwtDecode(token)
                const role = decoded.roll;
                console.log(role);
                let link = ''
                if (role === 'admin') { link = "http://amrithaahospitals.visualplanetserver.in/get-adminfiles" }
                else { link = "http://amrithaahospitals.visualplanetserver.in/get-files" }
                const res = await axios.get(link,{headers:{Authorization:`Bearer ${token}`}})
                const reversed = res.data.reverse();
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
    useEffect(() => {
        getData();
    }, []);
    const applyFilters = () => {
        let filtered = [...data];

        if (nameFilter.trim()) {
            filtered = filtered.filter(item =>
                item.full_name.toLowerCase().includes(nameFilter.trim().toLowerCase())
            );
        }

        if (phoneFilter.trim()) {
            filtered = filtered.filter(item =>
                item.Phone_number.includes(phoneFilter.trim())
            );
        }
// A00U11516
        if (visitFilter.trim()) {
            filtered = filtered.filter(item =>
                item.Visted.includes(visitFilter.trim())
            );
        }

        if (fromDate) {
            const fromDateStr = fromDate.toISOString().split('T')[0];
            filtered = filtered.filter(item =>
                new Date(item.Visted) >= new Date(fromDateStr)
            );
        }

        if (toDate) {
            const toDateStr = toDate.toISOString().split('T')[0];
            filtered = filtered.filter(item =>
                new Date(item.Visted) <= new Date(toDateStr)
            );
        }

        setFilteredData(filtered);
        // Calculate total price from filtered data - FIXED SYNTAX
        const total = filtered.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0); setTotalPrice(total);
        setCurrentPage(1); // Reset to first page when filters change
    };
    useEffect(() => {
        const delay = setTimeout(() => {
            applyFilters();
        }, 400);
        return () => clearTimeout(delay);
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
                    <h2>Billing History</h2>
                    <h3>Total Price: ₹{totalPrice.toFixed(2)}</h3>
                    <div className='inbtn'>
                        <div className="filter-item">
                            <input
                                className="input_AdminFollow"
                                type="text"
                                placeholder="Search by Name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                            />
                        </div>
                        <div className="filter-item">
                            <input
                                className="input_AdminFollow"
                                type="text"
                                placeholder="Search by Phone Number"
                                value={phoneFilter}
                                onChange={(e) => setPhoneFilter(e.target.value)}
                            />
                        </div>
                        <div className="filter-item">
                            <input
                                className="input_AdminFollow"
                                type="text"
                                placeholder="Search by Visited"
                                value={visitFilter}
                                onChange={(e) => setVisitFilter(e.target.value)}
                            />
                        </div>
                        <div className="filter-item">
                            <DatePicker
                                selected={fromDate}
                                onChange={(date) => setFromDate(date)}
                                placeholderText="From Date"
                                className="input_AdminFollow"
                                dateFormat="yyyy-MM-dd"
                                wrapperClassName="datePickerWrapper"
                                popperClassName="datePickerPopper"
                                popperPlacement="bottom-start"
                            />
                        </div>
                        <div className="filter-item">
                            <DatePicker
                                selected={toDate}
                                onChange={(date) => setToDate(date)}
                                placeholderText="To Date"
                                className="input_AdminFollow"
                                dateFormat="yyyy-MM-dd"
                                wrapperClassName="datePickerWrapper"
                                popperClassName="datePickerPopper"
                                popperPlacement="bottom-start"
                            />
                        </div>
                    </div>
                    <div className="button-row">
                        <button className='inlabel Afollowbuttonsearchblack' onClick={handleClear}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>
            <div className="container-fluid">
                <div className="table-responsive">
                    <table className="table">
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
                                        <a href={`http://amrithaahospitals.visualplanetserver.in/downloadbill/${item.Phone_number}_${item.Visted}.pdf`}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <button
                        className="pagination-arrow"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ←
                    </button>
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}
                    <button
                        className="pagination-arrow"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        →
                    </button>
                </div>
            )}
        </>
    );
};

export default BillingHistory;