import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Createusers.css";
import { useNavigate, useLocation } from 'react-router-dom';
import debounce from 'lodash/debounce';

const Createusers = () => {
    const [formData, setFormData] = useState({
        UserName: "",
        password: "",
        roll: "",
        location: "",
        Phone_Number: ""
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const username = searchParams.get('loginlocation');
    const franchiselocation = searchParams.get('franchiselocation');
    const navigate = useNavigate();
    const [optlocation, setoptlocation] = useState([])
    const fetchLoginLocations = async () => {
        try {
            const response = await axios.get('http://amrithaahospitals.visualplanetserver.in/adminlocations');
            setoptlocation(response.data);
        } catch (error) {
            console.error('Error fetching login locations:', error);
        }
    };
    useEffect(() => {
        fetchLoginLocations()
        // console.log(optlocation)
    },[])
    // Debounced function to fetch location suggestions
    const fetchSuggestions = useCallback(
        debounce(async (query) => {
            if (query.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            try {
                const response = await axios.get(`http://amrithaahospitals.visualplanetserver.in/locationsuggestion?search=${query}`);
                setSuggestions(response.data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setShowSuggestions(false);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.status === 404
                        ? "Location suggestion service is unavailable. Please try again later."
                        : "Failed to fetch location suggestions.",
                });
            }
        }, 300),
        []
    );

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'location') {
            fetchSuggestions(value);
        }
    };

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion) => {
        console.log(suggestion.location_name)
        setFormData(prev => ({
            ...prev,
            location: suggestion.location_name
        }));
        // setSuggestions([]);
        setShowSuggestions(false);
    };

    // Handle input blur
    const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = { UserName: formData.UserName, password: formData.password, roll: formData.roll, location: formData.location };
        for (let key in requiredFields) {
            if (!requiredFields[key].trim()) {
                Swal.fire({
                    icon: "error",
                    title: "Validation Error",
                    text: `${key} is required!`,
                });
                return;
            }
        }

        // if (!/^[a-zA-Z0-9]{3,20}$/.test(formData.UserName)) {
        //     Swal.fire({
        //         icon: "error",
        //         title: "Invalid Username",
        //         text: "Username must be 3-20 alphanumeric characters!",
        //     });
        //     return;
        // }

        const dataToSend = {
            UserName: formData.UserName,
            password: formData.password,
            roll: formData.roll,
            Phone_Number: formData.Phone_Number,
            Location: formData.location // Use formData.location
        };

        try {
            const response = await axios.post("http://amrithaahospitals.visualplanetserver.in/Createuser", dataToSend);
            console.log(response)
            if (response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "User added successfully!",
                });

                setFormData({
                    UserName: "",
                    password: "",
                    roll: "",
                    location: "",
                    Phone_Number: ""
                });
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: error.response?.data?.error || "Failed to create user.",
            });
        }
    };
    return (
        <div className="user-form-container">
            <div className="user-form">
                <h2>Create User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="UserName"
                                placeholder="Username"
                                value={formData.UserName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select
                                name="roll"
                                value={formData.roll}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="doctor">Doctor</option>
                                <option value="nurse">Nurse</option>
                                <option value="reception">Reception</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Location</option>
                                {optlocation.map((loc, index) => (
                                    <option key={index} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>
                            {/* <input
                                type="text"
                                name="location"
                                placeholder="Enter Location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {suggestions.map((suggestion) => (
                                        <li
                                            key={suggestion.id}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="suggestion-item"
                                        >
                                            {suggestion.location_name}
                                        </li>
                                    ))}
                                </ul>
                            )} */}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="number"
                                name="Phone_Number"
                                placeholder="Enter Phone Number"
                                value={formData.Phone_Number}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-buttons">
                        <button type="submit">Submit</button>
                        <button
                            type="button"
                            onClick={() => navigate(`/manageusers?loginlocation=${username}&franchiselocation=${franchiselocation}`)}
                            style={{ backgroundColor: '#000000' }}
                        >
                            Manage Users
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Createusers;