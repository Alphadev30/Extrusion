// Create a new Navbar component (Navbar.js)

import React from 'react';

const Navbar = ({ drawMode, setDrawMode, isMoving, setIsMoving, editMode, setEditMode}) => {

  const toggleDrawMode = () => {
    // Toggle the drawMode state when the button is clicked
    setDrawMode(!drawMode);
  };

  const togglePickMode = () => {
    // Toggle the drawMode state when the button is clicked
    setIsMoving(!isMoving);
  };

  const toggleEditMode = () => {
    // Toggle the drawMode state when the button is clicked
    setEditMode(!editMode);
  };

  return (
    <div className="navbar" >

      <button onClick={toggleDrawMode}>
        {drawMode ? 'Switch to Sketch Mode' : 'Switch to Drawing Mode'}
      </button>

      <button onClick={togglePickMode}>
        {isMoving ? 'Picked' : 'Switch to Pick'}
      </button>

      <button onClick={toggleEditMode}>
        {editMode ? 'Normal Mode' : 'Edit Mode'}
      </button>

      <h5>Press Enter for extrusion</h5>
      {/* Add more buttons if needed */}
    </div>
  );
};

export default Navbar;
