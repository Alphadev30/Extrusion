// Create a new Navbar component (Navbar.js)

import React from 'react';

const Navbar = ({ drawMode, setDrawMode, isMoving, setIsMoving}) => {
  const toggleDrawMode = () => {
    // Toggle the drawMode state when the button is clicked
    setDrawMode(!drawMode);
  };

  const togglePickMode = () => {
    // Toggle the drawMode state when the button is clicked
    setIsMoving(!isMoving);
  };

  return (
    <div className="navbar" >
      <button onClick={toggleDrawMode}>
        {drawMode ? 'Switch to Sketch Mode' : 'Switch to Drawing Mode'}
      </button>
      <button onClick={togglePickMode}>
        {isMoving ? 'Picked' : 'Switch to Pick'}
      </button>
      <h5>Press Enter for extrusion</h5>
      {/* Add more buttons if needed */}
    </div>
  );
};

export default Navbar;
