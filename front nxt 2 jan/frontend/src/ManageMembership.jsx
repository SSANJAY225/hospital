import { useEffect,useState } from 'react'
import style from '../src/style/ManageMembership.module.css'
import axios from 'axios'
import tstyle from './style/AdminFollow.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { byPrefixAndName } from '@awesome.me/kit-KIT_CODE/icons'
import { FaWhatsapp } from "react-icons/fa";

const ManageMembership=()=>{
    const [basic,setBasic]=useState([])
    useEffect(()=>{
        handledata()
    },[])
    const handledata=async ()=>{
        const res=await axios.get(`http://localhost:5000/get-all-membership`)
        console.log(res.data)
        setBasic(res.data)
    }

    return(<>
        <p>manage membership</p>
        <div>
            {/* filter */}
            <div>

            </div>
            <div>
                <div className={style.table_responsive}>
                        <table className={style.table}>
                          <thead className={style.thead}>
                            <tr>
                              <th className={style.th}>Patient Name</th>
                              <th className={style.th}>Age / Gender</th>
                              <th className={style.th}>Phone Number</th>
                              <th className={style.th}>Membership</th>
                              <th className={style.th}>Valid From</th>
                              <th classNmae={style.th}>Valid Thru</th>
                              <th className={style.th}>Visit</th>
                            </tr>
                          </thead>
                          <tbody className={style.tbody}>
                            {basic.map((business, index) => (
                              <tr key={index} >
                                <td className={style.td}>{business.Name}</td>
                                <td className={style.td}>{business.age} / {business.gender}</td>
                                <td className={style.td}>{business.Phone_Number} <FaWhatsapp
                                  color="#25D366"
                                  size={16}
                                  style={{ marginLeft: "8px", cursor: "pointer" }}
                                  onClick={(e) =>
                                    openwhatsapp(e, business.phone_number, business.full_name)
                                  }
                                /></td>
                                <td className={style.td}>{business.membership_type}</td>
                                <td className={style.td}>{formatDate(String(business.valid_from))}</td>
                                <td className={style.td}>{formatDate(String(business.valid_thru))}</td>
                                <td className={style.td}>{business.visit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
export default ManageMembership