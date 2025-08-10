import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "./ManagerUsers.css";
import myImage from './AmirthaLogo.png';
import { FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from "react-icons/fa";

Modal.setAppElement("#root");

function UserList({ users, onDelete, onEdit }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Location</th>
            <th>Role</th>
            <th>Phone number</th>
            <th>Delete</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.UserName}</td>
              <td>{user.Name}</td>
              <td>{user.Location}</td>
              <td>{user.roll}</td>
              <td>{user.Phone_Number}</td>
              <td>
                <button className="buttondelete" onClick={() => onDelete(user)}>
                  Delete
                </button>
              </td>
              <td>
                <button className="buttonedit" onClick={() => onEdit(user)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LocationToggle({ location, isOpen, onClick, userCount }) {
  return (
    <div className="location-toggle" onClick={onClick}>
      <div className="location-header">
        <span>+ {location}</span>
        <span className="user-count">({userCount})</span>
        <span className="toggle-icon">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>
    </div>
  );
}

function ManageUsers() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get("loginlocation");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All"); // State for selected location filter

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [expandedLocations, setExpandedLocations] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    UserName: "",
    UserId: "",
    Name: "",
    Location: "",
    roll: "",
    Phone_Number: "",
    Password: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `https://amrithaahospitals.visualplanetserver.in/users?loginlocation=${username}`
        );
        console.log("RAW res =>",response.data)
        const filteredUsers = response.data.filter((user) => user.UserName !== "admin");
        setUsers(filteredUsers);
        // Extract unique locations
        const uniqueLocations = [...new Set(filteredUsers.map(user => user.Location))];
        setLocations(uniqueLocations);
        // Initialize all locations as collapsed
        const initialExpandedState = {};
        uniqueLocations.forEach(loc => {
          initialExpandedState[loc] = false;
        });
        setExpandedLocations(initialExpandedState);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [username]);

  const toggleLocation = (location) => {
    setExpandedLocations(prev => ({
      ...prev,
      [location]: !prev[location]
    }));
  };

  const onDelete = async (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://amrithaahospitals.visualplanetserver.in/delete-user/${user.Phone_Number}`);
          Swal.fire("Deleted!", "User has been deleted.", "success");
          setUsers(users.filter((u) => u.Phone_Number !== user.Phone_Number));
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      }
    });
  };

  const onEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      UserName: user.UserName,
      UserId: user.UserId,
      Name: user.Name,
      Location: user.Location,
      roll: user.roll,
      Phone_Number: user.Phone_Number,
      Password: user.Password,
    });
    setModalIsOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const updatedData = { ...formData };
    if (!updatedData.Password) {
      delete updatedData.Password;
    }
    try {
      await axios.put(`https://amrithaahospitals.visualplanetserver.in/update-user/${formData.Phone_Number}`, updatedData);
      Swal.fire("Success", "User details updated successfully!", "success");
      setModalIsOpen(false);
      setUsers(users.map((user) => (user.Phone_Number === formData.Phone_Number ? { ...user, ...updatedData } : user)));
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire("Error", "Failed to update user.", "error");
    }
  };

  // Filter users based on selected location
  const filteredUsers = selectedLocation === "All" 
    ? users 
    : users.filter(user => user.Location === selectedLocation);

  return (
    <div className="main">
      <div className="maincontent">
        {/* <div className="admin-headerM">
          <img src={myImage} alt="My Image" className="admin-panel-image" />
        </div> */}
        <div className="scrollable-container">
          <h2 className="bus">Users</h2>
          <div className="location-filter">
            <label htmlFor="locationFilter">Filter by Location: </label>
            <select 
              id="locationFilter"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="location-dropdown"
            >
              <option value="All">All Locations</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="locations-container">
            {selectedLocation === "All" ? (
              locations.map(location => {
                const locationUsers = filteredUsers.filter(user => user.Location === location);
                const userCount = locationUsers.length;
                return (
                  <div key={location} className="location-section">
                    <LocationToggle 
                      location={location} 
                      isOpen={expandedLocations[location]} 
                      onClick={() => toggleLocation(location)}
                      userCount={userCount}
                    />
                    {expandedLocations[location] && (
                      <UserList 
                        users={locationUsers}
                        onEdit={onEdit} 
                        onDelete={onDelete} 
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="location-section">
                <LocationToggle 
                  location={selectedLocation} 
                  isOpen={true}
                  onClick={() => {}}
                  userCount={filteredUsers.length}
                />
                <UserList 
                  users={filteredUsers}
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              </div>
            )}
          </div>
        </div>

        <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="Modal_ManageUsers">
          <h2>Edit User</h2>
          <form>
            <div className="input-field">
              <label className="label">Username:</label>
              <input type="text" name="UserName" value={formData.UserName} onChange={handleChange} className="Bradius" />
            </div>
            <div className="input-field">
              <label className="label">Name:</label>
              <input type="text" name="Name" value={formData.Name} onChange={handleChange} className="Bradius" />
            </div>
            <div className="input-field">
              <label className="label">Location:</label>
              <input type="text" name="Location" value={formData.Location} onChange={handleChange} className="Bradius" />
            </div>
            <div className="input-field">
              <label className="label">Role:</label>
              <input type="text" name="roll" value={formData.roll} onChange={handleChange} className="Bradius" />
            </div>
            <div className="input-field">
              <label className="label">Phone Number:</label>
              <input type="number" name="Phone_Number" value={formData.Phone_Number} readOnly className="Bradius" />
            </div>
            <div className="input-field password-field">
              <label className="label">Password:</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  className="Bradius"
                  style={{ flex: 1, paddingRight: "35px" }}
                />
                <span
                  onClick={togglePasswordVisibility}
                  className="toggle-password"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </span>
              </div>
            </div>
            <div className="modal-buttons">
              <button type="button" className="update-button" onClick={handleSave}>
                Save
              </button>
              <button type="button" className="cancel-button" onClick={() => setModalIsOpen(false)}>
                Close
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default ManageUsers;