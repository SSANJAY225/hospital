import axios from "axios"
import style from './style/AdminFollow.module.css';
import React, { useState } from "react";
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { byPrefixAndName } from '@awesome.me/kit-KIT_CODE/icons'
import { FaWhatsapp } from "react-icons/fa";

const SixFollowUp = (data) => {
    const [reason,setReason]=useState('')
    const [followupdate,setFollowupdate]=useState()
    console.log("data=>", data.data)
    const handlesubmit=async (name,phonenumber,visit,r)=>{
        let formattedDate=null
        if(followupdate){
            const year = followupdate.getFullYear();
        const month = String(followupdate.getMonth() + 1).padStart(2, '0');
        const day = String(followupdate.getDate()).padStart(2, '0');

        formattedDate = `${year}-${month}-${day}`
        }
        const req=await axios.put(`https://amrithaahospitals.visualplanetserver.in/reason_update`,{params:{name,phonenumber,visit,reason:reason||r,followupdate:formattedDate}})
        console.log(req)
        if(req.data.success){
            Swal.fire({
                  icon: 'success',
                  title: 'reason updated!',
                  text: `The follow up reason for ${name} has been updated`,
                  confirmButtonText: 'OK',
                })
        }
    }
    const openwhatsapp = (e, phone, name,  date) => {
        e.stopPropagation();

        if (!phone) {
            alert("Phone number not available");
            return;
        }
        let cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length === 10) {
            cleanPhone = "91" + cleanPhone;
        }

        const msg = `Hello ${name}, your appinment has been schedules at ${date}`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

        window.open(url, "_blank");
    };
    return (<>
        <div className={style.container_fluid}>
            <h2 className={style.bus}></h2>
            <div className={style.table_responsive}>
                <table className={style.table}>
                    <thead className={style.thead}>
                        <tr>
                            <th className={style.th}>Name</th>
                            <th className={style.th}>Service</th>
                            <th className={style.th}>Change Followup Date</th>
                            <th className={style.th}>Followup Date</th>
                            <th className={style.th}>Close Follow up</th>
                            <th className={style.th}>Phone Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.data.map((d, index) => (
                            <tr key={index}>
                                <td className={style.td}>{d.Name}</td>
                                <td className={style.td}>{d.services}</td>
                                <td className={style.td}>
                                    <DatePicker
                                        type='date'
                                        selected={followupdate}
                                        onChange={setFollowupdate}
                                        placeholderText="Follow Up Date"
                                        popperPlacement="bottom"
                                    />
                                </td>
                                <td className={style.td}>{formatDate(String(d.FollowUpDate))}</td>
                                <td className={style.td}>
                                    <input 
                                    onChange={(e)=>setReason(e.target.value)}
                                    value={d.reason||reason}/>
                                    <button onClick={()=>handlesubmit(d.Name,d.Phone_Number,d.Visted,d.reason)}>submit</button>
                                </td>
                                <td className={style.td}>{d.Phone_Number} <FaWhatsapp
                                    color="#25D366"
                                    size={16}
                                    style={{ marginLeft: "8px", cursor: "pointer" }}
                                    onClick={(e) =>
                                        openwhatsapp(e, d.Phone_Number, d.Name, formatDate(String(d.FollowUpDate)))
                                    } />
                                </td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>)
}

function formatDate(dateString) {
    if (!dateString) {
        return '-';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}
export default SixFollowUp;