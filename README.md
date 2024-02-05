Application README
Overview
This application is a 3D scene builder developed using Babylon.js within a React framework. It allows users to interactively create, modify, and interact with 3D objects on a ground plane, leveraging the powerful 3D rendering capabilities of Babylon.js. The application supports drawing shapes on the ground plane, extruding these shapes into 3D polygons, moving these polygons, and editing their vertices.

Key Features
Drawing Shapes: Users can draw arbitrary 2D shapes on the ground plane by clicking and dragging the mouse.
Extruding Shapes: The drawn 2D shapes can be extruded into 3D objects, creating a visual representation of polygons in a 3D space.
Moving Polygons: Users can select and move the extruded polygons across the ground plane to reposition them as needed.
Editing Vertices: The application supports editing the vertices of the extruded polygons, allowing for detailed adjustments of the shapes.
Interactive UI: A navbar provides options to switch between different modes (Drawing, Moving, Editing), enhancing the interactivity and usability of the application.
Controls and Interactions
Draw Mode: Activate draw mode to start creating shapes. Left-click to place vertices and press 'Enter' to complete the shape and extrude it.
Move Mode: Switch to move mode to reposition polygons. Click on a polygon to select it, then click and drag to move.
Edit Mode: In edit mode, click on a polygon to select it, then click on individual vertices to move them, adjusting the shape of the polygon.
3D Mode: Toggle between draw mode and 3D mode using the navbar button. 3D mode allows for viewing and interacting with the scene without drawing or editing.
Setup and Architecture
The application is structured around React components, with the main scene component (BabylonScene) integrating Babylon.js functionalities. The scene setup, including camera, lighting, and ground plane creation, is done within this component. The navbar (Navbar) and footer (Footer) components provide UI controls and information to the user.

Key Technologies
Babylon.js: Utilized for rendering 3D graphics and managing scene interactions.
React: Framework for building the user interface and managing application state.
CSS: Styling for the navbar, footer, and overall layout adjustments.
Running the Application
Clone the repository to your local machine.
Navigate to the project directory and run npm install to install dependencies.
Start the development server with npm start. The application should open in your default web browser.