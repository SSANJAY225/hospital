import React, { useState } from 'react';
import { IoCheckmarkCircleOutline, IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import './TickToggle.css';

const TickToggle = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="tick-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <IoCheckmarkDoneCircleOutline className="icon bounce" size={60} />
      ) : (
        <IoCheckmarkCircleOutline className="icon" size={60} />
      )}
    </div>
  );
};

export default TickToggle;
