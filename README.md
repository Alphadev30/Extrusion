<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Scene Builder Application</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { width: 80%; margin: 0 auto; }
        img { width: 100%; max-width: 300px; margin: 10px 0; }
        .image-container { display: flex; justify-content: space-around; }
        h1, h2 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>3D Scene Builder Application</h1>
        <p>An interactive web application for creating, modifying, and interacting with 3D objects using Babylon.js within a React framework.</p>

        <h2>Key Features</h2>
        <ul>
            <li>Drawing Shapes</li>
            <li>Extruding Shapes</li>
            <li>Moving Polygons</li>
            <li>Editing Vertices</li>
            <li>Interactive UI</li>
        </ul>

        <h2>Controls and Interactions</h2>
        <ul>
            <li>Draw Mode: Activate draw mode to start creating shapes.</li>
            <li>Move Mode: Switch to move mode to reposition polygons.</li>
            <li>Edit Mode: In edit mode, adjust the shape of polygons.</li>
            <li>3D Mode: Toggle between draw mode and 3D mode for different interactions.</li>
        </ul>

        <h2>Setup and Architecture</h2>
        <p>The application is built using React for the UI and Babylon.js for 3D rendering. It is structured around main scene components, with additional components for UI controls like the navbar and footer.</p>

        <h2>Application Images</h2>
        <div class="image-container">
            <img src="path-to-your-image-1.jpg" alt="Application Screenshot 1">
            <img src="path-to-your-image-2.jpg" alt="Application Screenshot 2">
            <img src="path-to-your-image-3.jpg" alt="Application Screenshot 3">
        </div>
    </div>
</body>
</html>
