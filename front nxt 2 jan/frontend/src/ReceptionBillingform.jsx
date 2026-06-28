import React, { useState, useEffect, useRef } from 'react';
import style from './style/ReceptionBillingform.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import HistorySection from './HistorySection';
import SuggestionList from './suggestionList';
const ReceptionBillingform = () => {
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
    loginLocation: ''
  });

  const [imageUrl, setImageUrl] = useState(null);
  const [services, setServices] = useState([{ service: '', price: '', details: '', discount: '', isEditing: true }]);
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
  const [basic, setbasic] = useState({})
  const [particulatSuggestion, setParticularSuggestion] = useState([])
  const inputRefs = useRef([]);
  const [advance, setAdvance] = useState([])
  const [advanceInput, setAdvanceInput] = useState([])

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
      belongedlocation: searchParams.get('belongedlocation') || '',
      memberType: searchParams.get('MemberType') || ''
    };
  };

  const basicData = async () => {
    const searchParams = new URLSearchParams(location.search);
    // setUrlParams(getUrlParams());
    // console.log("sdfghsfjgn",urlParams)
    const res = await axios.get(`http://localhost:5000/get-basic-detail/${searchParams.get('id')}/${searchParams.get('name')}/${searchParams.get('businessname')}/${searchParams.get('visited')}`)
    console.log("res data", res)
    setbasic(res.data)
  }
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
      // console.log('Membership Types Response:', response.data);
      setMembershipTypes(response.data);
    } catch (error) {
      console.error('Error fetching membership types:', error);
      setMembershipTypes([]);
    }
  };
  const fetchPaymentMethod = async () => {
    try {
      const res = await axios.get('http://localhost:5000/get-paymentMethod')
      // console.log(res.data.map((i)=>i.method))
      setoptpaymentmethod(res.data)
      console.log(optpaymnetmethod)
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    const params = getUrlParams();
    setUrlParams(params);
    const newBillId = generateBillId(params);
    setBillId(newBillId);
    fetchPaymentMethod()
    basicData()
    if (params.memberType && params.memberType !== 'null' && params.memberType !== 'undefined') {
      setSelectedMembership(params.memberType);
    }
    if (params.businessName && params.visited) {
      fetchImage(params.businessName, params.visited);
    }
    fetchMembershipTypes();
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
      // console.log('Selected Membership:', selectedType, 'Price:', price);
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
      !lastService.details.trim() &&
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
    const newServices = [...services];
    newServices[index].isEditing = true;
    setServices(newServices);
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
        service.details.trim() ||
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
    addText(`Name: ${urlParams.name || 'N/A'}`, 10);
    addText(`Phone Number: ${urlParams.businessName || 'N/A'}`, 10);
    addText(`Visit Number: ${urlParams.visited || 'N/A'}`, 10);
    addText(`Doctor: ${urlParams.doctorname || 'N/A'}`, 10);
    addText(`Nurse: ${urlParams.nursename || 'N/A'}`, 10);
    addText(`Location: ${urlParams.belongedlocation || 'N/A'}`, 10);
    addText(`Member ID: ${urlParams.id || 'N/A'}`, 10);
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
    const filename = `${urlParams.businessName || 'unknown'}_${urlParams.visited || 'unknown'}.pdf`;

    doc.save(filename);

    return { pdfData, filename };
  };
  const fetchSuggestions = async (value, apiUrl, setSuggestionState) => {
    try {
      if (value.length > 0) {
        const response = await axios.get(apiUrl, {
          params: { term: value },
        });
        if (response.data && Array.isArray(response.data)) {
          setSuggestionState(response.data);
        } else {
          console.error('Invalid response format from', apiUrl);
          setSuggestionState([]);
        }
      } else {
        setSuggestionState([]);
      }
    } catch (error) {
      console.error(`Error fetching suggestions from ${apiUrl}:`, error);
      setSuggestionState([]);
    }
  };
  const handleParticular = async (e, index) => {
    const value = e.target.value;

    // update input value
    handleServiceChange(index, 'service', value);

    // fetch suggestions
    fetchSuggestions(
      value,
      'http://localhost:5000/api/particular-suggestion',
      setParticularSuggestion
    );
  };
  
  const handleSubmit = async (saving) => {
    console.log("action", saving)
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
          service.details.trim() ||
          service.discount
      )
      .map(({ service, price, details, discount }) => ({
        service: service.trim(),
        price: parseFloat(price).toFixed(2),
        details: details || '',
        discount: parseFloat(discount) || 0,
      }));
    const billingData = {
      userId: urlParams.id,
      userName: urlParams.name,
      phoneNumber: urlParams.businessName,
      visitNumber: urlParams.visited,
      nurseName: urlParams.nursename,
      doctorName: urlParams.doctorname,
      billId,
      paymentMode,
      reviewDate,
      reference,
      membershipType: selectedMembership,
      membershipPrice: membershipPrice.toFixed(2),
      membershipOffer: parseFloat(membershipOffer).toFixed(2),
      services: validServices,
      totalPrice,
      overallDiscount: parseFloat(overallDiscount) || 0,
      date: formatDateToMySQL(new Date()),
      saving,
      advanceInput
    };

    try {
      // console.log(billingData)
      const billingResponse = await axios.post('http://localhost:5000/api/final-save-billing', billingData);
      if (!billingResponse.data.success) {
        throw new Error('Failed to save billing');
      }
      if (selectedMembership && selectedMembership !== urlParams.memberType) {
        const membershipUpdateData = {
          id: urlParams.id,
          phoneNumber: urlParams.businessName,
          visited: urlParams.visited,
          membership: selectedMembership,
        };
        const membershipResponse = await axios.post('http://localhost:5000/api/Update-membership', membershipUpdateData)
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
        userId: urlParams.id,
        visitNumber: urlParams.visited,
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
  // const handlesave=async ()=>{
  //   console.log("just save")
  //   const validation = validateServices();
  //   if (!validation.isValid) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Invalid Input',
  //       text: validation.message,
  //       confirmButtonText: 'OK',
  //     });
  //     return;
  //   }
  //   const urlParams = getUrlParams();
  //   const validServices = services
  //     .filter(
  //       (service) =>
  //         service.service.trim() ||
  //         service.price ||
  //         service.details.trim() ||
  //         service.discount
  //     )
  //     .map(({ service, price, details, discount }) => ({
  //       service: service.trim(),
  //       price: parseFloat(price).toFixed(2),
  //       details: details || '',
  //       discount: parseFloat(discount) || 0,
  //     }));
  //   const billingData = {
  //     userId: urlParams.id,
  //     userName: urlParams.name,
  //     phoneNumber: urlParams.businessName,
  //     visitNumber: urlParams.visited,
  //     nurseName: urlParams.nursename,
  //     doctorName: urlParams.doctorname,
  //     billId,
  //     paymentMode,
  //     reviewDate,
  //     reference,
  //     membershipType: selectedMembership,
  //     membershipPrice: membershipPrice.toFixed(2),
  //     membershipOffer: parseFloat(membershipOffer).toFixed(2),
  //     services: validServices,
  //     totalPrice,
  //     overallDiscount: parseFloat(overallDiscount) || 0,
  //     date: formatDateToMySQL(new Date()),
  //   };
  //   try {
  //     const billingResponse = await axios.post('http://localhost:5000/api/save-billing', billingData);
  //     if (!billingResponse.data.success) {
  //       throw new Error('Failed to save billing');
  //     }
  //     if (selectedMembership && selectedMembership !== urlParams.memberType) {
  //       const membershipUpdateData = {
  //         id: urlParams.id,
  //         phoneNumber: urlParams.businessName,
  //         visited: urlParams.visited,
  //         membership: selectedMembership,
  //       };
  //       const membershipResponse = await axios.post('http://localhost:5000/api/Update-membership', membershipUpdateData)
  //       if (!membershipResponse.data.success) {
  //         console.error('Failed to update membership:', membershipResponse.data.message);
  //         await Swal.fire({
  //           icon: 'warning',
  //           title: 'Membership Update Failed',
  //           text: 'Billing saved, but failed to update membership. Please update the membership manually.',
  //           confirmButtonText: 'OK',
  //         });
  //       } else {
  //         console.log('Membership updated successfully:', selectedMembership);
  //       }
  //     }

  //     const { pdfData, filename } = generatePDF();
  //     const pdfResponse = await axios.post('http://localhost:5000/api/save-bill-pdf', {
  //       pdfData,
  //       filename,
  //       userId: urlParams.id,
  //       visitNumber: urlParams.visited,
  //     }, {
  //       headers: { 'Content-Type': 'application/json' },
  //     });

  //     if (!pdfResponse.data.success) {
  //       console.error('Failed to save PDF:', pdfResponse.data.message);
  //       await Swal.fire({
  //         icon: 'warning',
  //         title: 'PDF Save Failed',
  //         text: 'Billing saved, but failed to store the PDF. Please try again manually.',
  //         confirmButtonText: 'OK',
  //       });
  //     } else {
  //       console.log('PDF saved successfully:', filename);
  //     }

  //     await Swal.fire({
  //       icon: 'success',
  //       title: 'Billing Saved!',
  //       text: 'The billing information has been saved successfully, and the bill has been downloaded and stored.',
  //       confirmButtonText: 'OK',
  //     });
  //     // navigate(`/ReceptionBillingFollowup?loginlocation=${urlParams.loginLocation}&franchiselocation=${urlParams.belongedlocation}`, { replace: true });
  //   } catch (error) {
  //     console.error('Error:', error);
  //     await Swal.fire({
  //       icon: 'error',
  //       title: 'Billing Failed!',
  //       text: 'Something went wrong while saving the billing or PDF. Please try again.',
  //       confirmButtonText: 'OK',
  //     });
  //   }
  // }
  // const handleGenerate=()=>{
  //   console.log("Generate Bill")
  // }
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
  return (
    <>
      <div className={style.billing_form_container}>
        <h5 className={style.title}>Billing Form</h5>
        <p>{basic.patient_type}</p>
        {/* Billing Header */}
        <div className={style.billing_header}>
          <div className={style.header_left}>
            <div className={style.info_row}>
              <span className={style.info_label}>Bill ID:</span>
              <input
                type="text"
                value={billId}
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
          <div className={style.header_right}>
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
                <th>Amount</th>
                <th>Discount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {service.isEditing ? (
                      <div className={style.input_with_suggestions}>
                        <input
                          type="text"
                          placeholder="Particular"
                          value={service.service}
                          onChange={(e) => handleParticular(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'service')}
                          className={style.responsive_input}
                          ref={inputRefs.current[index]?.service}
                          onClick={(e) => e.target.focus()}
                        />
                        <SuggestionList
                          suggestions={particulatSuggestion}
                          onSuggestionClick={(suggestion) => {
                            // setTreatmentgivenname(suggestion);
                            handleServiceChange(index, 'service', suggestion)
                            setParticularSuggestion([]);
                          }}
                        />
                      </div>
                    ) : (
                      <span>{service.service}</span>
                    )}
                  </td>
                  <td>
                    {service.isEditing ? (
                      <input
                        type="number"
                        placeholder="Amount"
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'price')}
                        className={style.responsive_input}
                        step="0.01"
                        min="0"
                        ref={inputRefs.current[index]?.price}
                      />
                    ) : (
                      <span>₹{parseFloat(service.price).toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    {service.isEditing ? (
                      <input
                        type="number"
                        placeholder="Discount"
                        value={service.discount}
                        onChange={(e) => handleServiceChange(index, 'discount', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'discount')}
                        className={style.responsive_input}
                        step="0.01"
                        min="0"
                        ref={inputRefs.current[index]?.discount}
                      />
                    ) : (
                      <span>₹{parseFloat(service.discount || 0).toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    <div className={style.action_buttons}>
                      {!service.isEditing && (
                        <>
                          <button
                            className={style.custom_edit_button}
                            onClick={() => toggleEdit(index)}
                          >
                            Edit
                          </button>
                          {services.length > 1 && (
                            <button
                              className={style.custom_delete_button}
                              onClick={() => removeServiceRow(index)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
                    // console.log('Membership Offer Input:', e.target.value, 'Parsed Value:', value);
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

export default ReceptionBillingform;