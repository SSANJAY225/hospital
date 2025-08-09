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
  // const []
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

    // console.log('Calculating Total:', { subtotal, totalWithOverallDiscount, membershipPrice, totalWithMembership, membershipOffer, finalTotal });
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
    // const newServices = [...services];
    // newServices[index].isEditing = true;
    const item = services[index];
    document.querySelector('input[placeholder="Particular"]').value = item.service
    document.querySelector('input[placeholder="Details"]').value = item.detail|| '-'
    document.querySelector('input[placeholder="Amount"]').value = item.price
    document.querySelector('input[placeholder="Discount"]').value=item.discount
    setServices(services.filter((entry)=>entry !== item))
    // setServices(newServices);
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

  const fetchapidata = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const user = searchParams.get('user')
      const visit = searchParams.get('visit')
      const phonenumber = searchParams.get('phonenumber')
      const req = await axios.get(`https://amrithaahospitals.visualplanetserver.in/get_billing/${phonenumber}/${visit}/${user}`)
      const api = req.data
      setApiData(req.data)
      setOverallDiscount(apiData.discount)
      setSelectedMembership(apiData.member_type)
      setReference(apiData.reference)
      // const withoutService = Object.fromEntries(
      //   Object.entries(api).filter(([key, _]) => key !== 'service')
      // );
      // setApiData(withoutService)
      console.log("api data",apiData)
      setPaymentMode(apiData.payment_method)
      const WithService = Object.fromEntries(
        Object.entries(api).filter(([key, _]) => key === 'service')
      )
      const updatedServiceArray = WithService.service?.map(({ service_name, ...rest }) => ({
        ...rest,
        // isEditing: false,
        service: service_name
      })) || [];
      // console.log("service", updatedServiceArray)
      setServices(updatedServiceArray)
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    fetchapidata()
    // console.log(apiData)
  }, [])
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
        price: parseFloat(price).toFixed(2),
        details: detail || '',
        discount: parseFloat(discount) || 0,
      }));

    const billingData = {
      userId: urlParams.id,
      userName: urlParams.name,
      phoneNumber: urlParams.phonenumber,
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
    };

    try {
      const billingResponse = await axios.post('https://amrithaahospitals.visualplanetserver.in/api/save-billing', billingData);

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
                value={apiData.id}
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
                {/* <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option> */}
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
              <span className="info-value">{apiData.doctorname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Nurse:</span>
              <span className="info-value">{apiData.nurse_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member:</span>
              <span className="info-value">{apiData.user_id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{urlParams.belongedlocation}</span>
            </div>
          </div>
          <div className="details-right">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{apiData.user_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Visited:</span>
              <span className="info-value">{apiData.visit_number}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Number:</span>
              <span className="info-value">{apiData.phone_number}</span>
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
                <>
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {service.service}
                    </td>
                    <td>
                      {service.detail || '-'}
                    </td>
                    <td>
                      ₹{parseFloat(service.price).toFixed(2)}
                    </td>
                    <td>
                      ₹{parseFloat(service.discount || 0).toFixed(2)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="custom-edit-button"
                          onClick={() => toggleEdit(index)}>
                          Edit
                        </button>
                        {!service.isEditing && (
                          <>
                            {services.length > 1 && (
                              <button
                                className="custom-delete-button"
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
                </>
              ))}
              <tr>
                <td>{services.length + 1}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Particular"
                    // value={service.service}
                    // onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    // onKeyDown={(e) => handleKeyDown(e, index, 'service')}
                    className="responsive-input"
                    // ref={inputRefs.current[index]?.service}
                    onClick={(e) => e.target.focus()}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Details"
                    // value={service.detail || ''}
                    // onChange={(e) => handleServiceChange(index, 'detail', e.target.value)}
                    // onKeyDown={(e) => handleKeyDown(e, index, 'detail')}
                    className="responsive-input"
                    // ref={inputRefs.current[index]?.detail}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Amount"
                    // value={service.price}
                    // onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                    // onKeyDown={(e) => handleKeyDown(e, index, 'price')}
                    className="responsive-input"
                    step="0.01"
                    min="0"
                    // ref={inputRefs.current[index]?.price}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Discount"
                    // value={service.discount}
                    // onChange={(e) => handleServiceChange(index, 'discount', e.target.value)}
                    // onKeyDown={(e) => handleKeyDown(e, , 'discount')}
                    className="responsive-input"
                    step="0.01"
                    min="0"
                    // ref={inputRefs.current[index]?.discount}
                  />
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