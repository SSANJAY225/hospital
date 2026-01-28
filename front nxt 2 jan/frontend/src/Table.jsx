import style from './style/AdminFollow.module.css';
import React from "react";

function BusinessList({ onBusinessClick, businesses, onDownloadBill }) {
  const sortedBusinesses = [...businesses].sort((a, b) => b.id - a.id);

  return (
    <div className={style.container_fluid}>
          <h2 className={style.bus}></h2>
          <div className={style.table_responsive}>
            <table className={style.table}>
              <thead className={style.thead}>
                <tr>
                  <th className={style.th}>Patient Name</th>
                  <th className={style.th}>Age / Gender</th>
                  <th className={style.th}>Phone Number</th>
                  <th className={style.th}>Occupation</th>
                  <th className={style.th}>Services</th>
                  <th className={style.th}>Appointment Date</th>
                  <th className={style.th}>Visit</th>
                </tr>
              </thead>
              <tbody className={style.tbody}>
                {sortedBusinesses.map((business, index) => (
                  <tr key={index} onClick={() => onBusinessClick(business)}>
                    <td className={style.td}>{business.full_name}</td>
                    <td className={style.td}>{business.age} / {business.gender}</td>
                    <td className={style.td}>{business.phone_number}</td>
                    <td className={style.td}>{business.occupation}</td>
                    <td className={style.td}>{business.services}</td>
                    <td className={style.td}>{formatDate(String(business.appointment_date))}</td>
                    <td className={style.td}>{business.visted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  );
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

export default BusinessList;