import axios from "axios"
import style from './style/AdminFollow.module.css';
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { byPrefixAndName } from '@awesome.me/kit-KIT_CODE/icons'
import { FaWhatsapp } from "react-icons/fa";

const TableMembership = (data) => {
    console.log("data=>", data.data)
    const openwhatsapp = (e, phone, name, type, date) => {
        e.stopPropagation();

        if (!phone) {
            alert("Phone number not available");
            return;
        }
        let cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length === 10) {
            cleanPhone = "91" + cleanPhone;
        }

        const msg = `Hello ${name}, your ${type}membership getting expired in ${date}`;
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
                            <th className={style.th}>Membership</th>
                            <th className={style.th}>Change Followup Date</th>
                            <th className={style.th}>Renew Membership</th>
                            <th className={style.th}>Phone Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.data.map((d, index) => (

                            <tr key={index}>
                                <td className={style.td}>{d.Name}</td>
                                <td className={style.td}>{d.membership_type}</td>
                                <td className={style.td}>{formatDate(String(d.valid_thru))}</td>
                                <td className={style.td}><button>renew</button></td>
                                <td className={style.td}>{d.Phone_Number} <FaWhatsapp
                                    color="#25D366"
                                    size={16}
                                    style={{ marginLeft: "8px", cursor: "pointer" }}
                                    onClick={(e) =>
                                        openwhatsapp(e, d.Phone_Number, d.Name, d.membership_type, formatDate(String(d.valid_thru)))
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
export default TableMembership;