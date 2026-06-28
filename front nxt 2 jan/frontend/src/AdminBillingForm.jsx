import React, { useState, useEffect, useRef } from 'react';
import style from './style/ReceptionBillingform.module.css';
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
  const [basic, setbasic] = useState({})
  const inputRefs = useRef([]);
  const [advance, setAdvance] = useState([])
  const [advanceInput, setAdvanceInput] = useState([])
  const basicData = async () => {
    const searchParams = new URLSearchParams(location.search);
    const res = await axios.get(`http://localhost:5000/get-basic-detail/${searchParams.get('id')}/${searchParams.get('user')}/${searchParams.get('phonenumber')}/${searchParams.get('visit')}`)
    console.log(res)
    setbasic(res.data)
  }
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
      const response = await axios.get('http://localhost:5000/api/membership-types');
      console.log('Membership Types Response:', response.data);
      setMembershipTypes(response.data);
    } catch (error) {
      console.error('Error fetching membership types:', error);
      setMembershipTypes([]);
    }
  };

  const fetchPaymentMethod = async () => {
    try {
      const res = await axios.get('http://localhost:5000/get-paymentMethod')
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

      const req = await axios.get(`http://localhost:5000/get_billing/${phonenumber}/${visit}/${user}`)
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
    basicData()
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
      const response = await axios.get(`http://localhost:5000/api/user-photo`, {
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
      userId: apiData.user_id,
      userName: apiData.user_name,
      phoneNumber:apiData.phone_number,
      visitNumber: apiData.visit_number,
      nurseName:apiData.nurse_name,
      doctorName:apiData.doctorname,
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
      const billingResponse = await axios.put('http://localhost:5000/api/update_billing', billingData);
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

        const membershipResponse = await axios.post('http://localhost:5000/api/Update-membership', membershipUpdateData);

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
      const pdfResponse = await axios.post('http://localhost:5000/api/save-bill-pdf', {
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

      navigate(`/ReceptionBillingFollowup?loginlocation=${urlParams.loginLocation}&franchiselocation=${urlParams.belongedlocation}`, { replace: true });

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
  const handleAddHistoryItem = (newHistoryItem, historyList, setHistoryList) => {
    const value = String(newHistoryItem).trim();

    if (value !== '' && !isNaN(value)) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const newEntry = {
        amount: value,
        date: today,
        method: paymentMode
      };

      setHistoryList([...historyList, newEntry]);
    }
  };

  const handleDeleteHistory = (history, setHistory, item) => {
    setHistory(history.filter((entry) => entry !== item));
  };
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
      <div className={style.billing_form_container}>
        <h5 className={style.title}>Billing Form</h5>

        {/* Billing Header */}
        <div className={style.billing_header}>
          <div className={style.header_left}>
            <div className={style.info_row}>
              <span className={style.info_label}>Bill ID:</span>
              <input
                type="text"
                value={billId || apiData.id || ''}
                readOnly
                className={style.responsive_input}
              />
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Mode of Payment:</span>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className={style.responsive_input}
              >
                <option value="">Select Payment Mode</option>
                {optpaymnetmethod.map((itm) =>
                  <option key={itm.payment_id} value={itm.method}>{itm.method}</option>
                )}
              </select>
            </div>
          </div>
          <div className="header-right">
            <div className={style.info_row}>
              <span className={style.info_label}>Date:</span>
              <input
                type="date"
                value={currentDate}
                readOnly
                className={style.responsive_input}
              />
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Time:</span>
              <input
                type="text"
                value={currentTime}
                readOnly
                className={style.responsive_input}
              />
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className={style.billing_details}>
          <div className={style.details_left}>
            <div className={style.info_row}>
              <span className={style.info_label}>Doctor:</span>
              <span className={style.info_value}>{basic.doctorname}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Nurse:</span>
              <span className={style.info_value}>{basic.nursename}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Receptionist:</span>
              <span className={style.info_value}>{basic.receptionistname}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Member:</span>
              <span className={style.info_value}>{basic.id}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Location:</span>
              <span className={style.info_value}>{basic.belongedlocation}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Service:</span>
              <span className={style.info_value}>{basic.services}</span>
            </div>
          </div>

          <div className={style.details_right}>
            <div className={style.info_row}>
              <span className={style.info_label}>Name:</span>
              <span className={style.info_value}>{basic.full_name}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Patient Occupation:</span>
              <span className={style.info_value}>{basic.occupation}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Visited:</span>
              <span className={style.info_value}>{basic.visted}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Phone Number:</span>
              <span className={style.info_value}>{basic.phone_number}</span>
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Membership:</span>
              <span className={style.info_value}>{basic.membertype ? basic.membertype : "No membership"}</span>
            </div>
            {basic.room_number != null && (
              <div className={style.info_row}>
                <span className={style.info_label}>Room number:</span>
                <span className={style.info_value}>
                  {basic.room_number ? basic.room_number : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Services Table */}
        <div className={style.services_container}>
          <table className={style.services_table}>
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
                    <div className={style.action_buttons}>
                      <button
                        className={style.custom_edit_button}
                        onClick={() => toggleEdit(index)}>
                        Edit
                      </button>
                      {!service.isEditing && services.length > 1 && (
                        <button
                          className={style.custom_delete_button}
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
                    className={style.responsive_input}
                    onClick={(e) => e.target.focus()}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Details"
                    className={style.responsive_input}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Amount"
                    className={style.responsive_input}
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Discount"
                    className={style.responsive_input}
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  <button
                    className={style.custom_edit_button}
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
        <div className={style.billing_financial_adjustments}>
          <div className={style.financial_left}>
            <div className={style.info_row}>
              <span className={style.info_label}>Overall Discount:</span>
              <input
                type="number"
                value={overallDiscount}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                  setOverallDiscount(value);
                }}
                placeholder="Enter overall discount"
                className={style.responsive_input}
                step="0.01"
                min="0"
              />
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Membership:</span>
              <select
                value={selectedMembership}
                onChange={handleMembershipChange}
                className={style.responsive_input}
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
              <div className={style.info_row}>
                <span className={style.info_label}>Membership Offer:</span>
                <input
                  type="number"
                  value={membershipOffer || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    console.log('Membership Offer Input:', e.target.value, 'Parsed Value:', value);
                    setMembershipOffer(value);
                  }}
                  placeholder="Enter membership offer"
                  className={style.responsive_input}
                  step="0.01"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>
        {/*advance section */}

        <div className={style.billing_financial_adjustments}>
          <div className={style.info_row}>
            <div className={style.history_section}>
              <h5>Advance</h5>
              <table className={style.responsive_table}>
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {advance.map((item, index) => (
                    <tr key={index}>
                      <td>₹{item.amount}</td>
                      <td>{item.date}</td>
                      <td>{item.method}</td>
                      <td>
                        <button
                          className={`${style.buttondelete} ${style.responsive_button}`}
                          onClick={() =>
                            handleDeleteHistory(advance, setAdvance, item)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <input
                type="text"
                placeholder='Add advance'
                className={style.responsive_input}
                value={advanceInput}
                onChange={(e) => setAdvanceInput(e.target.value)}
                // disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddHistoryItem(advanceInput, advance, setAdvance);
                    setAdvanceInput("");
                  }
                }}
              />
            </div>
          </div>
        </div>
        {/* Billing Footer */}
        <div className={style.billing_footer}>
          <div className={style.footer_left}>
            <div className={style.info_row}>
              <span className={style.info_label}>Reference:</span>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter reference"
                className={style.responsive_input}
              />
            </div>
            <div className={style.info_row}>
              <span className={style.info_label}>Review Date:</span>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className={style.responsive_input}
              />
            </div>
          </div>
          <div className={style.footer_right}>
            <div className={style.total_price}>
              <strong>Total: ₹{totalPrice}</strong>
            </div>
          </div>
        </div>

        <div className={style.button_container} style={{ marginTop: '2rem' }}>
          <button className={style.save_billing_button} onClick={() => handleSubmit('save')}>save</button>
          <button className={style.save_billing_button} onClick={() => handleSubmit('Generate_Invoice')}>generate Invoice</button>
          <button className={style.save_billing_button} onClick={() => handleSubmit('Final_Bill')}>
            Final Bill
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminBillingForm;