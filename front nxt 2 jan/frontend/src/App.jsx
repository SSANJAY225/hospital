import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './style/App.css'
import Login from './Login';
import Admin from './Admin.jsx'
import AdminFollow from './AdminFollow.jsx';
import Add from './Add.jsx';
import Choosecatpo from './Choosecatpo.jsx';
import ManageMaster from './ManageMaster.jsx';
import Createusers from './Createusers.jsx';
import ManageUsers from './Manageusers.jsx';
import BillingHistory from './BillingHistory.jsx';
import AdminBillingForm from './AdminBillingForm.jsx';
import AddPatient from './AddPatient.jsx';
import ReceptionBillingFollowup from "./ReceptionBillingFollowup.jsx"
import ReceptionBillingform from './ReceptionBillingform.jsx';
import NurseFollow from './NurseFollow.jsx';
import PatientsFollowUpCommon from './PatientFollow.jsx'
import PatientForm from './PatientDetails.jsx';
function App() {

  return (
    <>
      <Router>
        <Routes>
        <Route path='/admin' element={<Admin />}></Route>
        <Route path='/' element={<Login />}></Route>
        <Route path='/adminfollow' element={<AdminFollow />}></Route>
        <Route path='/add' element={<Add />}></Route>
        <Route path='/choosecatpo' element={<Choosecatpo></Choosecatpo>}></Route>
        <Route path="/manage-master/:type" element={<ManageMaster />} />
        <Route path='/createuser' element={<Createusers />}></Route>
        <Route path='/manageusers' element={<ManageUsers />}></Route>
        <Route path='/BillingHistory' element={<BillingHistory />} />
        <Route path='/AdminBillingForm' element={<AdminBillingForm/>}/>
        <Route path="/AddPatient" element={<AddPatient />} />
        <Route path='/ReceptionBillingFollowup' element={<ReceptionBillingFollowup />} />
        <Route path='/ReceptionBillingform' element={<ReceptionBillingform />} />
        <Route path='/nursefollow' element={<NurseFollow />} />
        <Route path="/patients-followup/:type" element={<PatientsFollowUpCommon />}></Route>
        <Route path="/patient-follow/:type" element={<PatientForm/>} />

        </Routes>
      </Router>
    </>
  )
}

export default App
