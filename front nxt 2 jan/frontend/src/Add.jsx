import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import style from './style/Add.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

function Add() {
  const [values, setValues] = useState({
    complaints: '',
    vitals: '',
    examination: '',
    systemicExamination: '',
    tests: '',
    treatmentGiven: '',
    drugs: '',
    dosage: '',
    timing: '',
    duration: '',
    adviceGiven: '',
    vaccine: '',
    RoA: '',
    service: '',
    dental: '',
    nurseName: '',
    doctorName: '',
    membership_type: '',
    price: '',
    location: '',// Add location to state
    method: '',
    reception: '',
    moa: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const franchiselocation = searchParams.get('franchiselocation');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
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

  const handleInputChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({});
  };

  const handleSubmit = async (field, endpoint) => {

    if (field === 'membership' && (!values.membership_type || !values.price)) {
      setErrors({
        membership_type: !values.membership_type ? 'Membership Type is required' : '',
        price: !values.price ? 'Price is required' : ''
      });
      return;
    } else if (field !== 'membership' && !values[field]) {
      setErrors({ [field]: `${field} is required` });
      console.log("apihit")
      return;

    }

    try {
      const fieldMapping = {
        complaints: 'complaint',
        vitals: 'vitals',
        examination: 'examination',
        systemicExamination: 'systemicExamination',
        tests: 'test',
        treatmentGiven: 'treatment',
        drugs: 'drug',
        dosage: 'dosage',
        timing: 'timing',
        duration: 'duration',
        adviceGiven: 'advice',
        vaccine: 'vaccine',
        RoA: 'RoA',
        service: 'service',
        dental: 'dental',
        nurseName: 'nurseName',
        doctorName: 'doctorName',
        membership: 'membership',
        location: 'location', // Add location mapping
        method: 'method',
        reception: 'reception',
        moa: 'moa',
      };
      const apiEndpoint = `http://localhost:5000/add${endpoint}`;
      console.log('API Endpoint:', apiEndpoint);
      const payload = field === 'membership'
        ? { membership_type: values.membership_type, price: values.price }
        : field === 'nurseName' || field === 'doctorName' || field === 'reception'
          ? { [fieldMapping[field]]: values[field], location: franchiselocation }
          : { [fieldMapping[field]]: values[field] };
      console.log("paylode", payload)
      const response = await axios.post(apiEndpoint, payload);

      console.log('Response:', response);

      if (response.data.message) {
        setSuccessMessage(`${field} added successfully`);
        if (field === 'membership') {
          setValues({ ...values, membership_type: '', price: '' });
        } else {
          setValues({ ...values, [field]: '' });
        }

        Swal.fire({
          icon: 'success',
          title: `${field} Added`,
          text: response.data.message || `${field} added successfully!`
        });
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error adding data:', error);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again later.'
      });
    }
  };

  return (
    <div className=''>
      <div className={style.container}>
        <div className={style.form_container}>
          <h1 className={`${style.form_heading} ${style.bus}`}>Add Medical Records</h1>
          <form className={style.form}>
            {/* Services */}
            <div className={style.form_group}>
              <label htmlFor="service">Services</label>
              <input
                type="text"
                placeholder='Enter Services'
                name='service'
                value={values.service}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.service && <span className={style.text_danger}>{errors.service}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('service', 'Services')}
            >
              Add Service
            </button>
            {/* moa */}
            <div className={style.form_group}>
              <label htmlFor="moa">MOA</label>
              <input
                type="text"
                placeholder='Enter MOA'
                name='moa'
                value={values.moa}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.complaints && <span className={style.text_danger}>{errors.complaints}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('moa', 'moa')}
            >
              Add MOA
            </button>
            {/* Complaints */}
            <div className={style.form_group}>
              <label htmlFor="complaints">Complaints</label>
              <input
                type="text"
                placeholder='Enter Complaints'
                name='complaints'
                value={values.complaints}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.complaints && <span className={style.text_danger}>{errors.complaints}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('complaints', 'Complaints')}
            >
              Add Complaints
            </button>

            <div className='spacer'></div>

            {/* RoA */}
            <div className={style.form_group}>
              <label htmlFor="RoA">RoA</label>
              <input
                type="text"
                placeholder='Enter RoA'
                name='RoA'
                value={values.RoA}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.RoA && <span className={style.text_danger}>{errors.RoA}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('RoA', 'RoA')}
            >
              Add Route of Administration
            </button>

            {/* Vitals */}
            <div className={style.form_group}>
              <label htmlFor="vitals">Vitals</label>
              <input
                type="text"
                placeholder='Enter Vitals'
                name='vitals'
                value={values.vitals}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.vitals && <span className={style.text_danger}>{errors.vitals}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('vitals', 'Vitals')}
            >
              Add Vitals
            </button>

            <div className='spacer'></div>

            {/* On Examination */}
            <div className={style.form_group}>
              <label htmlFor="examination">On Examination</label>
              <input
                type="text"
                placeholder='Enter OE'
                name='examination'
                value={values.examination}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.examination && <span className={style.text_danger}>{errors.examination}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('examination', 'Examination')}
            >
              Add On Examination
            </button>

            <div className='spacer'></div>

            {/* Systemic Examination */}
            <div className={style.form_group}>
              <label htmlFor="systemicExamination">Systemic Examination</label>
              <input
                type="text"
                placeholder='Enter SE'
                name='systemicExamination'
                value={values.systemicExamination}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.systemicExamination && (
                <span className={style.text_danger}>{errors.systemicExamination}</span>
              )}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('systemicExamination', 'SystemicExamination')}
            >
              Add SE
            </button>

            <div className='spacer'></div>

            {/* Tests */}
            <div className={style.form_group}>
              <label htmlFor="tests">Tests</label>
              <input
                type="text"
                placeholder='Enter Tests'
                name='tests'
                value={values.tests}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.tests && <span className={style.text_danger}>{errors.tests}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('tests', 'Tests')}
            >
              Add Tests
            </button>

            <div className='spacer'></div>

            {/* Treatment Given */}
            <div className={style.form_group}>
              <label htmlFor="treatmentGiven">Treatment Given</label>
              <input
                type="text"
                placeholder='Enter TG'
                name='treatmentGiven'
                value={values.treatmentGiven}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.treatmentGiven && (
                <span className={style.text_danger}>{errors.treatmentGiven}</span>
              )}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('treatmentGiven', 'TreatmentGiven')}
            >
              Add TG
            </button>

            <div className='spacer'></div>

            {/* Drugs */}
            <div className={style.form_group}>
              <label htmlFor="drugs">Drugs</label>
              <input
                type="text"
                placeholder='Enter Drugs'
                name='drugs'
                value={values.drugs}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.drugs && <span className={style.text_danger}>{errors.drugs}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('drugs', 'Drugs')}
            >
              Add Drugs
            </button>

            <div className='spacer'></div>

            {/* Dosage */}
            <div className={style.form_group}>
              <label htmlFor="dosage">Dosage</label>
              <input
                type="text"
                placeholder='Enter Dosage'
                name='dosage'
                value={values.dosage}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.dosage && <span className={style.text_danger}>{errors.dosage}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('dosage', 'Dosage')}
            >
              Add Dosage
            </button>

            <div className='spacer'></div>

            {/* Timing */}
            <div className={style.form_group}>
              <label htmlFor="timing">Timing</label>
              <input
                type="text"
                placeholder='Enter Timing'
                name='timing'
                value={values.timing}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.timing && <span className={style.text_danger}>{errors.timing}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('timing', 'Timing')}
            >
              Add Timing
            </button>

            <div className='spacer'></div>

            {/* Duration */}
            <div className={style.form_group}>
              <label htmlFor="duration">Duration</label>
              <input
                type="text"
                placeholder='Enter Duration'
                name='duration'
                value={values.duration}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.duration && <span className={style.text_danger}>{errors.duration}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('duration', 'Duration')}
            >
              Add Duration
            </button>

            <div className='spacer'></div>

            {/* Advice Given */}
            <div className={style.form_group}>
              <label htmlFor="adviceGiven">Advice Given</label>
              <input
                type="text"
                placeholder='Enter Advice'
                name='adviceGiven'
                value={values.adviceGiven}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.adviceGiven && <span className={style.text_danger}>{errors.adviceGiven}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('adviceGiven', 'AdviceGiven')}
            >
              Add Advice
            </button>

            <div className='spacer'></div>

            {/* Dental */}
            <div className={style.form_group}>
              <label htmlFor="dental">Dental</label>
              <input
                type="text"
                placeholder='Enter Dental Details'
                name='dental'
                value={values.dental}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.dental && <span className={style.text_danger}>{errors.dental}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('dental', 'Dental')}
            >
              Add Dental
            </button>

            <div className='spacer'></div>
            <div className={style.form_group}>
              <label htmlFor="receptionName">Reception</label>
              <input
                type="text"
                placeholder='Enter reception Name'
                name='reception'
                value={values.reception}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.reception && <span className={style.text_danger}>{errors.reception}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('reception', 'reception')}
            >
              Add Reception Name
            </button>
            <div className='spacer'></div>

            {/* Nurse Name */}
            <div className={style.form_group}>
              <label htmlFor="nurseName">Nurse Name</label>
              <input
                type="text"
                placeholder='Enter Nurse Name'
                name='nurseName'
                value={values.nurseName}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.nurseName && <span className={style.text_danger}>{errors.nurseName}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('nurseName', 'NurseName')}
            >
              Add Nurse Name
            </button>

            <div className='spacer'></div>

            {/* Doctor Name */}
            <div className={style.form_group}>
              <label htmlFor="doctorName">Doctor Name</label>
              <input
                type="text"
                placeholder='Enter Doctor Name'
                name='doctorName'
                value={values.doctorName}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.doctorName && <span className={style.text_danger}>{errors.doctorName}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('doctorName', 'DoctorName')}
            >
              Add Doctor Name
            </button>

            <div className='spacer'></div>


            {/*Location*/}
            <div className={style.form_group}>
              <label htmlFor="location">Location</label>
              <input
                type="text"
                placeholder='Enter Location'
                name='location'
                value={values.location}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.location && <span className={style.text_danger}>{errors.location}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('location', 'Location')}
            >
              Add Location
            </button>
            <div className='spacer'></div>
            <div className={style.form_group}>
              <label htmlFor='paymnetmethod'>Payment method</label>
              <input type="text"
                placeholder='Enter Paymnet Method'
                name="method"
                value={values.method}
                onChange={handleInputChange}
                className={style.form_control}
              />
            </div>
            <button type='button'
              className={style.buttonred}
              onClick={() => { handleSubmit('method', 'paymentMethod') }}>
              Add payment Method
            </button>
            {errors.location && <span className={style.text_danger}>{errors.location}</span>}

            {/* Membership */}
            <div className={style.form_group}>
              <label htmlFor="membership_type">Membership Type</label>
              <input
                type="text"
                placeholder='Enter Membership Type'
                name='membership_type'
                value={values.membership_type}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.membership_type && (
                <span className={style.text_danger}>{errors.membership_type}</span>
              )}
            </div>
            <div className={style.form_group}>
              <label htmlFor="price">Price</label>
              <input
                type="number"
                placeholder='Enter Price'
                name='price'
                value={values.price}
                onChange={handleInputChange}
                className={style.form_control}
              />
              {errors.price && <span className={style.text_danger}>{errors.price}</span>}
            </div>
            <button
              type='button'
              className={style.buttonred}
              onClick={() => handleSubmit('membership', 'Memberships')}
            >
              Add Membership
            </button>

            <div className='spacer'></div>


            {successMessage && (
              <div className='text-danger mt-1 notification'>{successMessage}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Add;