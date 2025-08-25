import React, { useState, useEffect, useRef } from 'react';
import './ReceptionBillingform.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const AdminBillingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [urlParams, setUrlParams] = useState({
    businessName: '',
    name: '',
    id: '',
    visited: '',
    nursename: '',
    doctorname: '',
    belongedlocation: '',
    memberType: '',
    loginLocation: '',
    phonenumber: '',
  });

  const [imageUrl, setImageUrl] = useState(null);
  const [services, setServices] = useState([{ service_name: '', price: '', detail: '', discount: '', isEditing: true }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [billId, setBillId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [reference, setReference] = useState('');
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [membershipPrice, setMembershipPrice] = useState(0);
  const [membershipOffer, setMembershipOffer] = useState(0);
  const [optpaymnetmethod, setoptpaymentmethod] = useState([])
  const [apiData, setApiData] = useState({})
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const inputRefs = useRef([]);

  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      businessName: searchParams.get('businessname') || '',
      name: searchParams.get('name') || '',
      id: searchParams.get('id') || '',
      visited: searchParams.get('visited') || '',
      loginLocation: searchParams.get('loginlocation') || '',
      nursename: searchParams.get('nursename') || '',
      doctorname: searchParams.get('doctorname') || '',
      belongedlocation: searchParams.get('franchiselocation') || '',
      memberType: searchParams.get('MemberType') || '',
      phonenumber: searchParams.get('phonenumber') || ''
    };
  };

  const generateBillId = (params) => {
    const locationCode = params.belongedlocation
      ? params.belongedlocation.slice(0, 3).toUpperCase()
      : 'UNK';
    const nameInitials = params.name
      ? params.name.slice(0, 2).toUpperCase()
      : 'XX';
    const visitNumber = params.visited
      ? String(parseInt(params.visited, 10)).padStart(3, '0')
      : '001';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
    return `${locationCode}-${nameInitials}-${visitNumber}-${date}-${randomSuffix}`;
  };

  const fetchMembershipTypes = async () => {
    try {
      const response = await axios.get('https://amrithaahospitals.visualplanetserver.in/api/membership-types');
      console.log('Membership Types Response:', response.data);
      setMembershipTypes(response.data);
    } catch (error) {
      console.error('Error fetching membership types:', error);
      setMembershipTypes([]);
    }
  };

  const fetchPaymentMethod = async () => {
    try {
      const res = await axios.get('https://amrithaahospitals.visualplanetserver.in/get-paymentMethod')
      setoptpaymentmethod(res.data);
      console.log('Payment methods loaded:', res.data);
    } catch (e) {
      console.log(e)
    }
  }

  const fetchapidata = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const user = searchParams.get('user')
      const visit = searchParams.get('visit')
      const phonenumber = searchParams.get('phonenumber')
      
      if (!user || !visit || !phonenumber) {
        console.log('Missing required parameters for API call');
        setIsDataLoaded(true);
        return;
      }

      console.log('Fetching API data with params:', { user, visit, phonenumber });
      
      const req = await axios.get(`https://amrithaahospitals.visualplanetserver.in/get_billing/${phonenumber}/${visit}/${user}`)
      const api = req.data;
      
      console.log("API response:", api);
      
      // Set all the data at once to avoid timing issues
      setApiData(api);
      
      // Set individual state values from API data with proper type conversion
      if (api.discount !== undefined) setOverallDiscount(parseFloat(api.discount) || 0);
      if (api.membership_type) setSelectedMembership(api.membership_type);
      if (api.membership_offer !== undefined) setMembershipOffer(parseFloat(api.membership_offer) || 0);
      if (api.membership_price !== undefined) setMembershipPrice(parseFloat(api.membership_price) || 0);
      if (api.reference) setReference(api.reference);
      if (api.payment_method) setPaymentMode(api.payment_method);
      if (api.review_date) setReviewDate(api.review_date);
      if (api.id) setBillId(api.id);

      // Handle services data
      if (api.service && Array.isArray(api.service)) {
        const updatedServiceArray = api.service.map(({ service_name, price, discount, detail, ...rest }) => ({
          ...rest,
          service: service_name || '',
          price: parseFloat(price) || 0,
          discount: parseFloat(discount) || 0,
          detail: detail || '',
          isEditing: false
        }));
        console.log("Processed services:", updatedServiceArray);
        setServices(updatedServiceArray);
      }
      
      setIsDataLoaded(true);
      
    } catch (err) {
      console.log('Error fetching API data:', err);
      setIsDataLoaded(true);
    }
  };

  // Initial data loading
  useEffect(() => {
    const params = getUrlParams();
    setUrlParams(params);
    
    // Only generate new bill ID if not loading existing data
    const searchParams = new URLSearchParams(location.search);
    const hasExistingData = searchParams.get('user') && searchParams.get('visit') && searchParams.get('phonenumber');
    
    if (!hasExistingData) {
      const newBillId = generateBillId(params);
      setBillId(newBillId);
    }
    
    // Load static data
    fetchPaymentMethod();
    fetchMembershipTypes();
    
    if (params.memberType && params.memberType !== 'null' && params.memberType !== 'undefined') {
      setSelectedMembership(params.memberType);
    }
    
    if (params.businessName && params.visited) {
      fetchImage(params.businessName, params.visited);
    }
    
    // Load API data
    fetchapidata();
  }, [location]);

  useEffect(() => {
    inputRefs.current = services.map((_, i) => ({
      service: inputRefs.current[i]?.service || React.createRef(),
      details: inputRefs.current[i]?.details || React.createRef(),
      price: inputRefs.current[i]?.price || React.createRef(),
      discount: inputRefs.current[i]?.discount || React.createRef(),
    }));
  }, [services.length]);

  useEffect(() => {
    const subtotal = services.reduce((sum, service) => {
      const price = parseFloat(service.price) || 0;
      const discount = parseFloat(service.discount) || 0;
      return sum + (price - Math.min(price, discount));
    }, 0);

    const totalWithOverallDiscount = subtotal - Math.min(subtotal, parseFloat(overallDiscount) || 0);
    const totalWithMembership = totalWithOverallDiscount + (parseFloat(membershipPrice) || 0);
    const finalTotal = totalWithMembership - Math.min(totalWithMembership, parseFloat(membershipOffer) || 0);

    setTotalPrice(Math.max(finalTotal, 0).toFixed(2));
  }, [services, overallDiscount, membershipPrice, membershipOffer]);

  const fetchImage = async (phoneNumber, visited) => {
    try {
      const response = await axios.get(`https://amrithaahospitals.visualplanetserver.in/api/user-photo`, {
        params: { phoneNumber, visited },
      });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Error fetching image:', error);
      setImageUrl(null);
    }
  };

  const handleMembershipChange = (e) => {
    const selectedType = e.target.value;
    setSelectedMembership(selectedType);

    if (selectedType && selectedType !== urlParams.memberType) {
      const selectedMembershipData = membershipTypes.find(
        (membership) => membership.membership_type === selectedType
      );
      const price = selectedMembershipData ? parseFloat(selectedMembershipData.price) || 0 : 0;
      console.log('Selected Membership:', selectedType, 'Price:', price);
      setMembershipPrice(price);
    } else {
      setMembershipPrice(0);
    }
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const addServiceRow = () => {
    const lastService = services[services.length - 1];
    if (
      lastService &&
      !lastService.service.trim() &&
      !lastService.price &&
      !lastService.detail.trim() &&
      !lastService.discount
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Complete Current Row',
        text: 'Please fill out the current service row before adding a new one.',
        confirmButtonText: 'OK',
      });
      return;
    }
    setServices([...services, { service: '', price: '', details: '', discount: '', isEditing: true }]);
  };

  const removeServiceRow = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this service?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const newServices = services.filter((_, i) => i !== index);
        setServices(newServices);
      }
    });
  };

  const toggleEdit = (index) => {
    const item = services[index];
    document.querySelector('input[placeholder="Particular"]').value = item.service
    document.querySelector('input[placeholder="Details"]').value = item.detail || '-'
    document.querySelector('input[placeholder="Amount"]').value = item.price
    document.querySelector('input[placeholder="Discount"]').value = item.discount
    setServices(services.filter((entry) => entry !== item))
  };

  const saveServiceRow = (index) => {
    const newServices = [...services];
    if (!newServices[index].service.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Service',
        text: 'Service name cannot be empty.',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!newServices[index].price || parseFloat(newServices[index].price) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Price',
        text: 'Price must be a positive number.',
        confirmButtonText: 'OK',
      });
      return;
    }
    newServices[index].isEditing = false;
    setServices(newServices);

    const newRowIndex = services.length;
    addServiceRow();
    setTimeout(() => {
      if (inputRefs.current[newRowIndex]?.service?.current) {
        inputRefs.current[newRowIndex].service.current.focus();
        inputRefs.current[newRowIndex].service.current.select();
      }
    }, 0);
  };

  const handleKeyDown = (e, index, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'service') {
        if (inputRefs.current[index]?.details?.current) {
          inputRefs.current[index].details.current.focus();
        }
      } else if (field === 'details') {
        if (inputRefs.current[index]?.price?.current) {
          inputRefs.current[index].price.current.focus();
        }
      } else if (field === 'price') {
        if (inputRefs.current[index]?.discount?.current) {
          inputRefs.current[index].discount.current.focus();
        }
      } else if (field === 'discount') {
        saveServiceRow(index);
      }
    }
  };

  const validateServices = () => {
    const validServices = services.filter(
      (service) =>
        service.service.trim() ||
        service.price ||
        service.detail.trim() ||
        service.discount
    );

    if (validServices.length === 0) {
      return { isValid: false, message: 'At least one service must be added.' };
    }

    for (const service of validServices) {
      if (!service.service.trim()) {
        return { isValid: false, message: 'All services must have a non-empty name.' };
      }
      if (!service.price || parseFloat(service.price) <= 0) {
        return { isValid: false, message: 'All services must have a valid positive price.' };
      }
    }
    return { isValid: true };
  };

  const formatDateToMySQL = (date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const addText = (text, x, fontSize = 12, isBold = false, maxWidth = pageWidth - 20) => {
      doc.setFontSize(fontSize);
      doc.setFont(isBold ? 'helvetica' : 'helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      y += lines.length * (fontSize * 0.4);
    };

    const addLine = () => {
      doc.setLineWidth(0.5);
      doc.line(10, y, pageWidth - 10, y);
      y += 5;
    };

    addText('Billing Receipt', 10, 16, true);
    y += 5;
    addText(`Bill ID: ${billId || 'N/A'}`, 10);
    addText(`Date: ${new Date().toISOString().split('T')[0]}`, 10);
    addText(`Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 10);
    addText(`Payment Mode: ${paymentMode || 'N/A'}`, 10);
    addLine();

    addText('Patient Details', 10, 14, true);
    addText(`Name: ${urlParams.name || apiData.user_name || 'N/A'}`, 10);
    addText(`Phone Number: ${urlParams.businessName || apiData.phone_number || 'N/A'}`, 10);
    addText(`Visit Number: ${urlParams.visited || apiData.visit_number || 'N/A'}`, 10);
    addText(`Doctor: ${urlParams.doctorname || apiData.doctorname || 'N/A'}`, 10);
    addText(`Nurse: ${urlParams.nursename || apiData.nurse_name || 'N/A'}`, 10);
    addText(`Location: ${urlParams.belongedlocation || 'N/A'}`, 10);
    addText(`Member ID: ${urlParams.id || apiData.user_id || 'N/A'}`, 10);
    addLine();

    addText('Services', 10, 14, true);
    const validServices = services.filter(
      (service) => service.service.trim() || service.price || service.details.trim() || service.discount
    );
    const headers = ['SNo', 'Particular', 'Details', 'Amount', 'Discount', 'Net'];
    const colWidths = [20, 50, 50, 30, 30, 30];
    let xPos = 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, i) => {
      doc.text(header, xPos, y);
      xPos += colWidths[i];
    });
    y += 5;
    addLine();

    doc.setFont('helvetica', 'normal');
    validServices.forEach((service, index) => {
      xPos = 10;
      const netAmount = (parseFloat(service.price) || 0) - (parseFloat(service.discount) || 0);
      const row = [
        `${index + 1}`,
        service.service || 'N/A',
        service.details || '-',
        `₹${parseFloat(service.price || 0).toFixed(2)}`,
        `₹${parseFloat(service.discount || 0).toFixed(2)}`,
        `₹${netAmount.toFixed(2)}`
      ];
      row.forEach((cell, i) => {
        const lines = doc.splitTextToSize(cell, colWidths[i] - 5);
        doc.text(lines, xPos, y);
        xPos += colWidths[i];
      });
      y += 10;
    });
    addLine();

    addText('Financial Breakdown', 10, 14, true);
    const subtotal = validServices.reduce((sum, service) => {
      const price = parseFloat(service.price) || 0;
      const discount = parseFloat(service.discount) || 0;
      return sum + (price - Math.min(price, discount));
    }, 0);
    addText(`Subtotal (Services after individual discounts): ₹${subtotal.toFixed(2)}`, 10);

    if (overallDiscount > 0) {
      addText(`Overall Discount (Applied to subtotal): ₹${parseFloat(overallDiscount).toFixed(2)}`, 10);
    } else {
      addText('Overall Discount: None', 10);
    }

    const totalWithOverallDiscount = subtotal - Math.min(subtotal, parseFloat(overallDiscount) || 0);
    addText(`Total after Overall Discount: ₹${totalWithOverallDiscount.toFixed(2)}`, 10);

    if (membershipPrice > 0) {
      addText(`Membership Fee (${selectedMembership}): ₹${parseFloat(membershipPrice).toFixed(2)}`, 10);
    } else {
      addText('Membership Fee: None', 10);
    }

    const totalWithMembership = totalWithOverallDiscount + (parseFloat(membershipPrice) || 0);
    addText(`Total with Membership Fee: ₹${totalWithMembership.toFixed(2)}`, 10);

    if (membershipOffer > 0) {
      addText(`Membership Offer (Discount for ${selectedMembership}): ₹${parseFloat(membershipOffer).toFixed(2)}`, 10);
    } else {
      addText('Membership Offer: None', 10);
    }

    addText(`Final Total: ₹${totalPrice}`, 10, 12, true);
    addLine();

    addText('Additional Information', 10, 14, true);
    addText(`Reference: ${reference || 'N/A'}`, 10);
    addText(`Review Date: ${reviewDate || 'N/A'}`, 10);

    const pdfData = doc.output('datauristring').split(',')[1];
    const filename = `${urlParams.businessName || apiData.phone_number || 'unknown'}_${urlParams.visited || apiData.visit_number || 'unknown'}.pdf`;

    doc.save(filename);

    return { pdfData, filename };
  };

  const handleSubmit = async () => {
    const validation = validateServices();
    if (!validation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: validation.message,
        confirmButtonText: 'OK',
      });
      return;
    }

    const urlParams = getUrlParams();

    const validServices = services
      .filter(
        (service) =>
          service.service.trim() ||
          service.price ||
          service.detail.trim() ||
          service.discount
      )
      .map(({ service, price, detail, discount }) => ({
        service: service.trim(),
        price: (parseFloat(price) || 0).toFixed(2),
        details: detail || '',
        discount: parseFloat(discount) || 0,
      }));

    // Ensure all numeric values are properly converted
    const safeMembershipPrice = parseFloat(membershipPrice) || 0;
    const safeMembershipOffer = parseFloat(membershipOffer) || 0;
    const safeOverallDiscount = parseFloat(overallDiscount) || 0;

    const billingData = {
      userId: urlParams.id || apiData.user_id,
      userName: urlParams.name || apiData.user_name,
      phoneNumber: urlParams.phonenumber || apiData.phone_number,
      visitNumber: urlParams.visited || apiData.visit_number,
      nurseName: urlParams.nursename || apiData.nurse_name,
      doctorName: urlParams.doctorname || apiData.doctorname,
      billId,
      paymentMode,
      reviewDate,
      reference,
      membershipType: selectedMembership,
      membershipPrice: safeMembershipPrice.toFixed(2),
      membershipOffer: safeMembershipOffer.toFixed(2),
      services: validServices,
      totalPrice,
      overallDiscount: safeOverallDiscount,
      date: formatDateToMySQL(new Date()),
    };

    try {
      const billingResponse = await axios.put('https://amrithaahospitals.visualplanetserver.in/api/update_billing', billingData);
      if (!billingResponse.data.success) {
        throw new Error('Failed to save billing');
      }

      if (selectedMembership && selectedMembership !== urlParams.memberType) {
        const membershipUpdateData = {
          id: urlParams.id || apiData.user_id,
          phoneNumber: urlParams.businessName || apiData.phone_number,
          visited: urlParams.visited || apiData.visit_number,
          membership: selectedMembership,
        };

        const membershipResponse = await axios.post('https://amrithaahospitals.visualplanetserver.in/api/Update-membership', membershipUpdateData);

        if (!membershipResponse.data.success) {
          console.error('Failed to update membership:', membershipResponse.data.message);
          await Swal.fire({
            icon: 'warning',
            title: 'Membership Update Failed',
            text: 'Billing saved, but failed to update membership. Please update the membership manually.',
            confirmButtonText: 'OK',
          });
        } else {
          console.log('Membership updated successfully:', selectedMembership);
        }
      }
      
      const { pdfData, filename } = generatePDF();
      const pdfResponse = await axios.post('https://amrithaahospitals.visualplanetserver.in/api/save-bill-pdf', {
        pdfData,
        filename,
        userId: urlParams.id || apiData.user_id,
        visitNumber: urlParams.visited || apiData.visit_number,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!pdfResponse.data.success) {
        console.error('Failed to save PDF:', pdfResponse.data.message);
        await Swal.fire({
          icon: 'warning',
          title: 'PDF Save Failed',
          text: 'Billing saved, but failed to store the PDF. Please try again manually.',
          confirmButtonText: 'OK',
        });
      } else {
        console.log('PDF saved successfully:', filename);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Billing Saved!',
        text: 'The billing information has been saved successfully, and the bill has been downloaded and stored.',
        confirmButtonText: 'OK',
      });
      
      // navigate(`/ReceptionBillingFollowup?loginlocation=${urlParams.loginLocation}&franchiselocation=${urlParams.belongedlocation}`, { replace: true });
      
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Billing Failed!',
        text: 'Something went wrong while saving the billing or PDF. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Show loading state while data is being fetched
  if (!isDataLoaded) {
    return (
      <div className="billing-form-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="billing-form-container">
        <h5 className="title">Billing Form</h5>

        {/* Billing Header */}
        <div className="billing-header">
          <div className="header-left">
            <div className="info-row">
              <span className="info-label">Bill ID:</span>
              <input
                type="text"
                value={billId || apiData.id || ''}
                readOnly
                className="responsive-input"
              />
            </div>
            <div className="info-row">
              <span className="info-label">Mode of Payment:</span>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="responsive-input"
              >
                <option value="">Select Payment Mode</option>
                {optpaymnetmethod.map((itm) =>
                  <option key={itm.payment_id} value={itm.method}>{itm.method}</option>
                )}
              </select>
            </div>
          </div>
          <div className="header-right">
            <div className="info-row">
              <span className="info-label">Date:</span>
              <input
                type="date"
                value={currentDate}
                readOnly
                className="responsive-input"
              />
            </div>
            <div className="info-row">
              <span className="info-label">Time:</span>
              <input
                type="text"
                value={currentTime}
                readOnly
                className="responsive-input"
              />
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="billing-details">
          <div className="details-left">
            <div className="info-row">
              <span className="info-label">Doctor:</span>
              <span className="info-value">{apiData.doctor_name || urlParams.doctorname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Nurse:</span>
              <span className="info-value">{apiData.nurse_name || urlParams.nursename}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member:</span>
              <span className="info-value">{apiData.user_id || urlParams.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{apiData.location||urlParams.belongedlocation}</span>
            </div>
          </div>
          <div className="details-right">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{apiData.user_name || urlParams.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Visited:</span>
              <span className="info-value">{apiData.visit_number || urlParams.visited}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Number:</span>
              <span className="info-value">{apiData.phone_number || urlParams.businessName}</span>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="services-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>SNo</th>
                <th>Particular</th>
                <th>Details</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{service.service}</td>
                  <td>{service.detail || '-'}</td>
                  <td>₹{parseFloat(service.price).toFixed(2)}</td>
                  <td>₹{parseFloat(service.discount || 0).toFixed(2)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="custom-edit-button"
                        onClick={() => toggleEdit(index)}>
                        Edit
                      </button>
                      {!service.isEditing && services.length > 1 && (
                        <button
                          className="custom-delete-button"
                          onClick={() => removeServiceRow(index)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td>{services.length + 1}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Particular"
                    className="responsive-input"
                    onClick={(e) => e.target.focus()}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Details"
                    className="responsive-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Amount"
                    className="responsive-input"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Discount"
                    className="responsive-input"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  <button
                    className="custom-edit-button"
                    onClick={() => {
                      const particular = document.querySelector('input[placeholder="Particular"]').value;
                      const details = document.querySelector('input[placeholder="Details"]').value;
                      const amount = document.querySelector('input[placeholder="Amount"]').value;
                      const discount = document.querySelector('input[placeholder="Discount"]').value;
                      
                      if (!particular.trim() || !amount || parseFloat(amount) <= 0) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid Input',
                          text: 'Please enter valid service name and amount.',
                          confirmButtonText: 'OK',
                        });
                        return;
                      }
                      
                      const newService = {
                        service: particular.trim(),
                        detail: details || '',
                        price: parseFloat(amount),
                        discount: parseFloat(discount) || 0,
                        isEditing: false
                      };
                      
                      setServices([...services, newService]);
                      
                      // Clear the input fields
                      document.querySelector('input[placeholder="Particular"]').value = '';
                      document.querySelector('input[placeholder="Details"]').value = '';
                      document.querySelector('input[placeholder="Amount"]').value = '';
                      document.querySelector('input[placeholder="Discount"]').value = '';
                    }}
                  >
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Adjustments */}
        <div className="billing-financial-adjustments">
          <div className="financial-left">
            <div className="info-row">
              <span className="info-label">Overall Discount:</span>
              <input
                type="number"
                value={overallDiscount}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                  setOverallDiscount(value);
                }}
                placeholder="Enter overall discount"
                className="responsive-input"
                step="0.01"
                min="0"
              />
            </div>
            <div className="info-row">
              <span className="info-label">Membership:</span>
              <select
                value={selectedMembership}
                onChange={handleMembershipChange}
                className="responsive-input"
              >
                <option value="">Select Membership Type</option>
                {membershipTypes.map((membership) => (
                  <option key={membership.membership_type} value={membership.membership_type}>
                    {membership.membership_type}
                  </option>
                ))}
              </select>
            </div>
            {urlParams.memberType && selectedMembership === urlParams.memberType && (
              <div className="info-row">
                <span className="info-label">Membership Offer:</span>
                <input
                  type="number"
                  value={membershipOffer || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    console.log('Membership Offer Input:', e.target.value, 'Parsed Value:', value);
                    setMembershipOffer(value);
                  }}
                  placeholder="Enter membership offer"
                  className="responsive-input"
                  step="0.01"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Billing Footer */}
        <div className="billing-footer">
          <div className="footer-left">
            <div className="info-row">
              <span className="info-label">Reference:</span>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter reference"
                className="responsive-input"
              />
            </div>
            <div className="info-row">
              <span className="info-label">Review Date:</span>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="responsive-input"
              />
            </div>
          </div>
          <div className="footer-right">
            <div className="total-price">
              <strong>Total: ₹{totalPrice}</strong>
            </div>
          </div>
        </div>

        <div className="title" style={{ marginTop: '2rem' }}>
          <button className="save-billing-button" onClick={handleSubmit}>
            Save Billing
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminBillingForm;