import React from "react";
import { Link, useLocation } from "react-router-dom";
import style from "./style/choosecatpo.module.css";

function Choosecatpo() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const franchiselocation = searchParams.get("franchiselocation");
  const username = searchParams.get("loginlocation");

  const link = (type) =>
    `/manage-master/${type}?loginlocation=${username}&franchiselocation=${franchiselocation}`;

  return (
    <div className={style.page_container}>
      <div className={style.card_container}>
        <div className={style.button_grid}>
          <Link to={link("complaints")} className={style.nav_button}>Complaints</Link>
          <Link to={link("vitals")} className={style.nav_button}>Vitals</Link>
          <Link to={link("dosage")} className={style.nav_button}>Dosage</Link>
          <Link to={link("timing")} className={style.nav_button}>Timing</Link>
          <Link to={link("duration")} className={style.nav_button}>Duration</Link>
          <Link to={link("examinations")} className={style.nav_button}>On Examinations</Link>
          <Link to={link("sysexam")} className={style.nav_button}>Systmatic Examination</Link>
          <Link to={link("treatment")} className={style.nav_button}>Treatment Given</Link>
          <Link to={link("drugs")} className={style.nav_button}>Drugs</Link>
          <Link to={link("advice_given")} className={style.nav_button}>Advice Given</Link>
          {/* <Link to={link("vaccine")} className={style.nav_button}>Vaccine</Link> */}
          <Link to={link("RoA")} className={style.nav_button}> RoA</Link>
          <Link to={link("dental")} className={style.nav_button}>Dental</Link>
          <Link to={link("service")} className={style.nav_button}>Service</Link>
          <Link to={link("doctor")} className={style.nav_button}>Doctor</Link>
          <Link to={link("location")} className={style.nav_button}> Location</Link>
          <Link to={link("memberShip")} className={style.nav_button}>Membership</Link>
          <Link to={link("nurse")} className={style.nav_button}>Nurse</Link>
          <Link to={link("paymentmethod")} className={style.nav_button}>Payment Method</Link>
          <Link to={link("test")} className={style.nav_button}>Tests</Link>
          <Link to={link("reception")} className={style.nav_button}>Reception</Link>
          <Link to={link("moa")} className={style.nav_button}>MOA</Link>
        </div>
      </div>
    </div>
  );
}

export default Choosecatpo;

// export default Choosecatpo;