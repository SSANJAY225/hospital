import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import style from "./style/ManageMaster.module.css"
Modal.setAppElement("#root");

const CONFIG = {
    complaints: {
        title: "Complaints",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/complaints",
        fieldName: "complaint_text",
    },
    vitals: {
        title: "Vitals",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/Vitals-for-manage",
        fieldName: "vitals",
    },
    dosage: {
        title: "Dosage",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/dosage",
        fieldName: "dosage_text",
    },
    timing: {
        title: "Timing",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/timing",
        fieldName: "timing_text",
    },
    duration: {
        title: "Duration",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/duration",
        fieldName: "duration_text",
    }, examinations: {
        title: "On Examination",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/examinations",
        fieldName: "onexam_text"
    }, sysexam: {
        title: "Systematic Examination",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/sysexaminations",
        fieldName: "sysexam_text"
    }, treatment: {
        title: "Treatment Given",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/treatmentgiven",
        fieldName: "treatment_name_text",
    }, drugs: {
        title: "Drugs",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/drugs",
        fieldName: "drugs_text"
    }, advice_given: {
        title: "Advice Given",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/advicegiven",
        fieldName: "advicegiven_text"
    }, vaccine: {
        title: "Vaccine",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/vaccine",
        fieldName: "vaccine_text"
    }, RoA: {
        title: "ROA",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/getRoA",
        fieldName: "name"
    }, dental: {
        title: "Dental",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/dental",
        fieldName: "treatment_name"
    }, service: {
        title: "Service",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/services",
        fieldName: "service_name"
    }, doctor: {
        title: "Doctor",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/doctors_names",
        fieldName: "name"
    }, location: {
        title: "Location",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/locations",
        fieldName: "location_name",
    }, memberShip: {
        title: "Membership",
        apiUrl: "https://amrithaahospitals.visualplanetserver.in/memberships",
        fieldName: "membership_type",
        fieldName2: "price",
        isMultiField: true
    },nurse:{
        title:"Nurse",
        apiUrl:"https://amrithaahospitals.visualplanetserver.in/nurses_name",
        fieldName:"name"
    },paymentmethod:{
        title:"Payment Method",
        apiUrl:"https://amrithaahospitals.visualplanetserver.in/get-paymentMethod",
        fieldName:"method",
    },test:{
        title:"Test",
        apiUrl:"https://amrithaahospitals.visualplanetserver.in/tests",
        fieldName:"tests_text",
    },reception:{
        title:"Reception",
        apiUrl:'https://amrithaahospitals.visualplanetserver.in/reception',
        fieldName:'name'
    },moa:{
        title:'MOA',
        apiUrl:'https://amrithaahospitals.visualplanetserver.in/moa',
        fieldName:'moa'
    },particular:{
        title:'Particular',
        apiUrl:'https://amrithaahospitals.visualplanetserver.in/particular',
        fieldName:'particular_text'
    }
};

function ManageMaster() {
    const { type } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const config = CONFIG[type];

    const [items, setItems] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [textValue, setTextValue] = useState("");
    const [textValue2, setTextValue2] = useState("");

    const auth = localStorage.getItem("authToken");

    // 🔐 Auth check
    useEffect(() => {
        if (!auth) return navigate("/");

        try {
            const decoded = jwtDecode(auth);
            if (decoded.roll !== "admin") {
                Swal.fire("Access Denied", "Admins only", "warning");
                navigate("/");
            }
        } catch {
            navigate("/");
        }
    }, [auth, navigate]);

    if (!config) {
        return <h2 style={{ textAlign: "center" }}>Invalid Page</h2>;
    }

    // 📥 Fetch data
    const fetchData = async () => {
        try {
            const res = await axios.get(config.apiUrl);
            setItems(res.data);
            console.log(res.data)
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [type]);

    // ✏️ Edit
    const handleEdit = (item) => {
        setEditItem(item);
        setTextValue(item[config.fieldName]);
        if (config.fieldName2) {
            setTextValue2(item[config.fieldName2]);
        }
        setModalOpen(true);
    };

    // 🔄 Update
    const handleUpdate = async () => {
        try {
            console.log(editItem)
            let link=axios.put(`${config.apiUrl}/${editItem.id}`, { [config.fieldName]: textValue });
            if (config.fieldName2) {
                 link=axios.put(`${config.apiUrl}/${editItem.id}`, { [config.fieldName]: textValue,[config.fieldName2]:textValue2})
            }
            await link
            Swal.fire("Updated!", "Updated successfully", "success");
            setModalOpen(false);
            fetchData();
        } catch {
            Swal.fire("Error", "Update failed", "error");
        }
    };

    // 🗑 Delete
    const handleDelete = (item) => {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
        }).then(async (res) => {
            if (res.isConfirmed) {
                await axios.delete(`${config.apiUrl}/${item.id}`);
                fetchData();
                Swal.fire("Deleted!", "Deleted successfully", "success");
            }
        });
    };

    return (
        <div className={style.admin_container}>
            <div className={style.container_fluid}>
                <h2 className={style.bus}>{config.title}</h2>
                <div className={style.table_responsive}>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th className={style.th}>{config.title}</th>
                                {config.fieldName2 && <th className={style.th}>Price</th>}
                                <th className={style.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length ? (
                                items.map((item, index) => (
                                    <tr key={item.id ?? index}>
                                        <td className={style.td}>
                                            {item[config.fieldName]}
                                        </td>

                                        {config.fieldName2 && (
                                            <td className={style.td}>
                                                ₹{item[config.fieldName2]}
                                            </td>
                                        )}

                                        <td className={style.td}>
                                            <div className={style.action_buttons}>
                                                <button
                                                    className={style.btngreen}
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={style.btndelete}
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={config.fieldName2 ? 3 : 2}>No data found</td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
                <Modal
                    isOpen={modalOpen}
                    onRequestClose={() => setModalOpen(false)}
                    className={style.custom_modal}
                    overlayClassName={style.custom_overlay}>
                    <div className={style.details}>
                        <h3 className={`${style.bus} ${style.center}`}>Edit {config.title}</h3>
                        <div className={style.input_field}>
                            <label className={style.lable}>Column Name:</label>
                            <input
                                className={style.input}
                                type="text"
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                placeholder="Enter column name"
                            />
                        </div>
                        {config.fieldName2 && (
                            <div className={style.input_field}>
                                <label className={style.label}>Price</label>
                                <input
                                    type="number"
                                    className={style.input}
                                    value={textValue2}
                                    onChange={(e) => setTextValue2(e.target.value)}
                                />
                            </div>
                        )}
                        <button className={style.update_button} onClick={handleUpdate}>
                            Update column
                        </button>
                        <button className={style.cancel_button} onClick={() => setModalOpen(false)}>cancel</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default ManageMaster;
