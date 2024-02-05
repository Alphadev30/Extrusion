// Create a new Navbar component (Navbar.js)

import React from 'react';
import './Navbar.css'; // Add this line to import the CSS


const Navbar = ({isDrawing, setIsDrawing, drawMode, setDrawMode, isMoving, setIsMoving, editMode, setEditMode }) => {

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

  const toggle3DMode = () => {
    // Toggle the drawMode state when the button is clicked
    setIsDrawing(!isDrawing);
  };

  return (
    <div>
      <div className="navbar" >
      <h5>Left click for placing vertex</h5>
      <h5>Press Enter for extrusion</h5>
      <button onClick={toggle3DMode}>
        {isDrawing ? 'Switch to 3D Mode' : 'Switch to Draw Mode'}
      </button>

      <button onClick={toggleDrawMode}>
        {drawMode ? 'Switch to Edge Mode' : 'Switch to Pencil Mode'}
      </button>

      <button onClick={togglePickMode}>
        {isMoving ? 'Picked' : 'Switch to Pick'}
      </button>

      <button onClick={toggleEditMode}>
        {editMode ? 'Switch to Normal Mode' : 'Switch to Edit Mode'}
      </button>



      
      </div>
      
    </div>
  );
};

export default Navbar;
