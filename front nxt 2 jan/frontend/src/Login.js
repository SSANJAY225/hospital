import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";
import './Login.css';
import myImage from './AmirthaLogo.png';
import Validation from './LoginValidation';

function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    loginLocation: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [fullSuggestions, setFullSuggestions] = useState([]);
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const token = localStorage.getItem('authToken');
  useEffect(() => {
    if (token) {
      console.log("token=>", jwtDecode(token))
      const tok = jwtDecode(token)
      if (tok.roll === 'doctor') {
        console.log("doc")
        navigate(`/admin?loginlocation=${tok.loginLocation}&franchiselocation=${tok.franchiselocation}`)
      } else if (tok.roll === 'admin') {
        console.log("admin")
        navigate(`/admin?loginlocation=${tok.loginLocation}&franchiselocation=${tok.franchiselocation}`)
      } else if (tok.roll === 'reception') {
        navigate(`/admin?loginlocation=${tok.loginLocation}&franchiselocation=${tok.franchiselocation}`)
        console.log("reception")
      } else if (tok.roll === 'nurse') {
        navigate(`/nursefollow?loginlocation=${tok.loginLocation}&franchiselocation=${tok.franchiselocation}`)
        console.log('nurse')
      }
    }
    axios.get('http://localhost:8081/adminloginlocations')
      .then(res => {
        setFullSuggestions(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));

    if (name === 'loginLocation') {
      setShowSuggestions(true);
      if (value.trim() === '') {
        setCountrySuggestions([]);
      } else {
        setCountrySuggestions(
          fullSuggestions.filter(location =>
            location.toLowerCase().includes(value.toLowerCase())
          )
        );
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setValues(prev => ({ ...prev, loginLocation: suggestion }));
    setShowSuggestions(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors(Validation(values));

    axios
      .post('http://localhost:5000/login', values)
      .then((res) => {
        if (res.data.success) {
          const franchiselocation = res.data.franchiselocation;
          const role = res.data.roll;
          localStorage.setItem('authToken', res.data.token);

          if (role === 'nurse') {
            navigate(`/nursefollow?loginlocation=${values.loginLocation}&franchiselocation=${franchiselocation}`);
          } else {
            navigate(`/admin?loginlocation=${values.loginLocation}&franchiselocation=${franchiselocation}`);
          }

          Swal.fire({
            icon: 'success',
            title: 'Logged In Successfully!',
            text: 'Welcome to Virtual Planet!',
          });
        } else {
          handleErrorResponse(res);
        }
      })
      .catch((err) => {
        if (err.response) {
          handleErrorResponse(err.response);
        } else {
          console.log('Error:', err.message);
        }
      });
  };

  function handleErrorResponse(response) {
    const { status, data } = response;
    if (status === 401) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Please check your password!',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred, please try again.',
      });
    }
  }

  return (
    <div className='login-page-container'>
      <div className='login-main-card'>
        <div className='login-brand-section'>
          {/* <img src={myImage} alt="Visual Planet Logo" className="login-brand-logo" /> */}
          <h1 className='login-brand-title'>Amirthaa <span style={{ color: 'black' }}>Dental</span></h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='login-form-group'>
            <label htmlFor="loginLocation" className='login-form-label'>User Name</label>
            <input
              type='text'
              name='loginLocation'
              value={values.loginLocation}
              onChange={handleInput}
              className='login-form-input'
              placeholder='Enter Login Location'
            />
            {showSuggestions && countrySuggestions.length > 0 && (
              <ul className="login-suggestions-list">
                {countrySuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="login-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            {errors.loginLocation && <span className='login-error-message'>{errors.loginLocation}</span>}
          </div>
          <div className='login-form-group'>
            <label htmlFor="password" className='login-form-label'>Password</label>
            <input
              type="password"
              placeholder='Enter Password'
              name='password'
              onChange={handleInput}
              className='login-form-input'
            />
            {errors.password && <span className='login-error-message'>{errors.password}</span>}
          </div>
          <button type='submit' className='login-submit-button'>Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;