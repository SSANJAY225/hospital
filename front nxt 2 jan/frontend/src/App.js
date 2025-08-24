
import './App.css';
import Login from './Login';
import Signup from './Signup';
import Home from './Home'
import NewOrderForm from './New.js'
import FollowUp from './FollowUp.js';
import Today from './Today.js';
import NurseForm from './NurseForm.js';
// import ManageRoA from './Managecatpo12.js';
import Spanco from './Spanco.js';
import Form from './Form.js'
import Demo from './demo.js'
import Admin from './Admin.js'
import Add from './Add.js'
import AdminFollow from './AdminFollow.js';
import AdminForm from './AdminForm.js';
import Manageusers from './Manageusers.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddManage from './AddManage.js';
import UserAdd from './UserAdd.js'
import ManageOp from './MnageOp.js';
import Bill from './Bill.js'
import Managecatpo from './Managecatpo.js';
import Managecatpo1 from './Managecatpo1.js';
import Managecatpo2 from './Managecatpo2.js';
import Managecatpo3 from './Managecatpo3.js';
import Managecatpo4 from './Managecatpo4.js';
import Managecatpo5 from './Managecatpo5.js';
import Managecatpo6 from './Managecatpo6.js';
import Managecatpo7 from './Managecatpo7.js';
import Managecatpo8 from './Managecatpo8.js';
import Managecatpo9 from './Managecatpo9.js';
import Managecatpo10 from './Managecatpo10.js';
import Managecatpo11 from './Managecatpo11.js';
import Managecatpo13 from './Managecatpo13.js';
import ManageProducts from './ManageProducts.js';
import Choosecatpo from './Choosecatpo.js';
import Usermanagemanet from './Usermanagement.js';
import ModalPage from './ModalPage.js';
import ManagePositions from './ManagePositions.js';
import AddPatient from './AddPatient.js';
import Com from './Com.js';
import ReceptionBillingFollowup from './ReceptionBillingFollowup.js'
import PatientsFollowUp from './PatientsFollowUp.js';
import PatientForm from './PatientsForm.js';
import Visited from './Visited.js'
import NurseDash from './NurseDash.js';
import NurseFollow from './NurseFollow.js';
import Createusers from './Createusers.js'; 
import ReceptionBillingform from './ReceptionBillingform';
import AddPatientsadmin from './AddPatientsadmin.js'
import PatientsFollowUpIn from './PatientsFollowUpIn.js'
import PatientsFollowUpOut from './PatientsFollowUpOut.js'
import NurseCompletedForm from './NurseCompletedForm.js'
import Managecatpo14 from './Managecatpo14.js'
import Managecatpo15 from './Managecatpo15.js'
import ManageNurseNames from './ManageNurseNames.js'
import ManageDoctors from './ManageDoctors.js'
import ManageMemberships from './ManageMemberships.js'
import AdminFormIn from './AdminFormIn.js'
import AdminFormOut from './AdminFormOut.js'
// import Appoiments from './Appoiments.js'
import BillingHistory from './BillingHistory.js'
import PatientFormCompleted from './PatientFormCompleted.js'
import AppoinmentPublic from './appoinments.js';
import ManageLocation from './ManageLocation.js';
import ManagePaymentMethod from './ManagePaymentMethod.js';
import AdminBillingForm from './AdminBillingForm.js';
function App() {
  return (
    <>
      <Router>
        <Routes>
        {/* <Switch> */}
          <Route path='/' element={<Login />}></Route>
          <Route path='/signup' element={<Signup />}></Route>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/new' element={<NewOrderForm />}></Route>
          <Route path='/followup' element={<FollowUp />}></Route>
          <Route path='/today' element={<Today />}></Route>
          <Route path='/spanco' element={<Spanco />}></Route>
          <Route path='/form' element={<Form />}></Route>
          <Route path='/demo' element={<Demo />}></Route>
          <Route path='/admin' element={<Admin />}></Route>
          <Route path='/usermanage' element={<Usermanagemanet />}></Route>
          <Route path='/createuser' element={<Createusers />}></Route>
          <Route path='/add' element={<Add />}></Route>
          <Route path='/adminfollow' element={<AdminFollow />}></Route>
          <Route path='/adminform' element={<AdminForm />}></Route>
          <Route path='/manageusers' element={<Manageusers />}></Route>
          <Route path='/addmanage' element={<AddManage></AddManage>}></Route>
          <Route path='/UserAdd' element={<UserAdd></UserAdd>}></Route>
          <Route path='/manageop' element={<ManageOp></ManageOp>}></Route>
          <Route path='/bill' element={<Bill></Bill>}></Route>
          <Route path='/managecatpo' element={<Managecatpo></Managecatpo>}></Route>
          <Route path='/managecatpo1' element={<Managecatpo1></Managecatpo1>}></Route>
          <Route path='/managecatpo2' element={<Managecatpo2></Managecatpo2>}></Route>
          <Route path='/managecatpo3' element={<Managecatpo3></Managecatpo3>}></Route>
          <Route path='/managecatpo4' element={<Managecatpo4></Managecatpo4>}></Route>
          <Route path='/managecatpo5' element={<Managecatpo5></Managecatpo5>}></Route>
          <Route path='/managecatpo6' element={<Managecatpo6></Managecatpo6>}></Route>
          <Route path='/managecatpo7' element={<Managecatpo7></Managecatpo7>}></Route>
          <Route path='/managecatpo8' element={<Managecatpo8></Managecatpo8>}></Route>
          <Route path='/managecatpo9' element={<Managecatpo9></Managecatpo9>}></Route>
          <Route path='/managecatpo10' element={<Managecatpo10></Managecatpo10>}></Route>
          <Route path='/managecatpo11' element={<Managecatpo11></Managecatpo11>}></Route>
          <Route path='/managecatpo13' element={<Managecatpo13></Managecatpo13>}></Route>
          {/*<Route path='/managecatpo12' element={<ManageRoA></ManageRoA>}></Route>*/}
          <Route path='/manageproduct' element={<ManageProducts></ManageProducts>}></Route>
          <Route path='/choosecatpo' element={<Choosecatpo></Choosecatpo>}></Route>
          <Route path="/modal" element={<ModalPage />} />
          <Route path="/managepositions" element={<ManagePositions />} />
          <Route path="/AddPatient" element={<AddPatient />} />
          {/* <Route path="/appointments" element={<AppoinmentPublic />} /> */}
          <Route path="/Com" element={<Com />} />
          <Route path="/PatientsFollowUp" element={<PatientsFollowUp />} />
          <Route path='/patientdetails' element={<PatientForm />} />
          <Route path='/nurseform' element={<NurseForm />} />
          <Route path='/nursedash' element={<NurseDash />} />
          <Route path='/nursefollow' element={<NurseFollow />} />
          <Route path='/visitedpage' element={<Visited />} />
          <Route path='/ReceptionBillingFollowup' element={<ReceptionBillingFollowup />} />
          <Route path='/ReceptionBillingform' element={<ReceptionBillingform />} />
          <Route path='/AddPatientsadmin' element={<AddPatientsadmin />} />
          <Route path='/PatientsFollowUpIn' element={<PatientsFollowUpIn />} />
          <Route path='/PatientsFollowUpOut' element={<PatientsFollowUpOut />} />
          <Route path='/NurseCompletedForm' element={<NurseCompletedForm />} />
          <Route path='/Managecatpo14' element={<Managecatpo14 />} />
          <Route path='/Managecatpo15' element={<Managecatpo15 />} />
          <Route path='/ManageNurseNames' element={<ManageNurseNames />} />
          <Route path='/ManageDoctors' element={<ManageDoctors />} />
          <Route path='/ManageMemberships' element={<ManageMemberships />} />
          <Route path='/AdminFormIn' element={<AdminFormIn />} />
          <Route path='/AdminFormOut' element={<AdminFormOut />} />
          {/* <Route path='/appointments' element={<Appoiments />} /> */}
          <Route path='/BillingHistory' element={<BillingHistory />} />
          <Route path='/PatientFormCompleted' element={<PatientFormCompleted />} />
          <Route path="/appointments" element={<AppoinmentPublic />} />
          <Route path="/ManageLocation" element={<ManageLocation/>} />
          <Route path='/ManagePaymentMethod' element={<ManagePaymentMethod/>}/>
          <Route path='/AdminBillingForm' element={<AdminBillingForm/>}/>
        </Routes>
        
        {/* </Routes> */}

      </Router>
    </>
  );
}

export default App;
