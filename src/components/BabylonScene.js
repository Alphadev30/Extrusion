import React, { useState, useEffect, useRef } from 'react';
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector2,
    HemisphericLight,
    MeshBuilder,
    Color4,
    PointerEventTypes,
    StandardMaterial
} from '@babylonjs/core';
import earcut from 'earcut'; // Import earcut


import './BabylonScene.css';

const BabylonScene = (props) => {
    const canvasRef = useRef(null);
    const [engine, setEngine] = useState(null);  // State to hold the Babylon engine
    const [scene, setScene] = useState(null);  // State to hold the Babylon scene
    const [ground, setGround] = useState(null);  // State to hold the ground mesh

    // This state will hold the vertices of the shape the user is drawing
    const [vertices, setVertices] = useState([]);

    // This state will indicate whether the user is in drawing mode
    const [isDrawing, setIsDrawing] = useState(true);

    useEffect(() => {
        if (canvasRef.current) {
            const eng = new Engine(canvasRef.current, true);
            setEngine(eng);
            const scn = new Scene(eng);
            setScene(scn);
            scn.clearColor = new Color4(0.6, 0.8, 0.8, 1);

            const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 1, 0), scn);
            camera.setPosition(new Vector3(0, 100, 0)); // Adjust the height as needed
            camera.setTarget(Vector3.Zero()); // Look at the origin (ground plane)
            camera.attachControl(canvasRef.current, true);

            const light = new HemisphericLight("light", new Vector3(11, 0.1, 0), scn);

            const grnd = MeshBuilder.CreateGround("ground", { width: 90, height: 90 }, scn);
            setGround(grnd);

            eng.runRenderLoop(() => {
                scn.render();
            });

            window.addEventListener('resize', () => {
                eng.resize();
            });

            // Dispose of the scene and engine when the component unmounts
            return () => {
                scn.dispose();
                eng.dispose();
            };
        }
    }, [canvasRef]);

    // This useEffect will handle the pointer down event
    useEffect(() => {
        if (scene && ground) {
            // Function to get the world coordinates from the pointer position
            const getGroundPosition = () => {
                const pickinfo = scene.pick(scene.pointerX, scene.pointerY, mesh => mesh === ground);
                if (pickinfo.hit) {
                    return pickinfo.pickedPoint;
                }
                return null;
            };

            // Event listener for pointer down events
            const onPointerDown = (evt) => {
                if (isDrawing) {
                    const groundPosition = getGroundPosition();

                    if (groundPosition) {
                        setVertices([...vertices, groundPosition]);
                    }
                }
            };

            scene.onPointerObservable.add(onPointerDown, PointerEventTypes.POINTERDOWN);

            return () => {
                scene.onPointerObservable.removeCallback(onPointerDown);
            };
        }
    }, [scene, ground, vertices, isDrawing]);  // Add the dependencies here

    // A separate useEffect for drawing lines between vertices
    useEffect(() => {
        if (scene && vertices.length > 1) {
            const lines = MeshBuilder.CreateLines("lines", { points: vertices, updatable: true }, scene);
            return () => {
                lines.dispose();  // Dispose the lines when the component unmounts or vertices change
            };
        }
    }, [scene, vertices]);  // Dependency on vertices so it updates when new points are added


    const calculateCenterPoint = (vertices) => {
        // Calculate the average of x and y coordinates to find the center point
        const centerX = vertices.reduce((sum, vertex) => sum + vertex.x, 0) / vertices.length;
        const centerY = vertices.reduce((sum, vertex) => sum + vertex.y, 0) / vertices.length;

        return new Vector3(centerX, centerY, 0);
    };

    const createExtrudedShape = (shape) => {

        if (scene) {

            //const centerPoint = calculateCenterPoint(shape);

            // Define the path to start from the center point and go up by the extrusion height
            //const path = [centerPoint, new Vector3(centerPoint.x, centerPoint.z, 1)];

            // const options = {
            //     shape: shape,
            //     path: path,
            //     updatable: true

            // };

            //curved front
            for (let i = 0; i < 20; i++) {
                shape.push(new Vector3(0.2 * Math.cos(i * Math.PI / 40), 0, 0.2 * Math.sin(i * Math.PI / 40) - 0.1));
            }

            //top
            shape.push(new Vector3(0, 0, 0.1));
            shape.push(new Vector3(-0.3, 0, 0.1));

            const mat = new StandardMaterial("mat1", scene);
            mat.alpha = 1.0;
            mat.diffuseColor = new Color4(0.5, 0.5, 1.0);
            mat.backFaceCulling = false;

            //let extrudedMesh = MeshBuilder.PolygonMeshBuilder("extrudedShape", options, scene);
            const extrudedMesh = MeshBuilder.ExtrudePolygon("polytri", {shape: shape, depth: 20});
            extrudedMesh.material = mat;
            extrudedMesh.position.y += 10.75;
            //extrudedMesh.rotate(Vector3.Up(), Math.PI / 2); // Rotate by 90 degrees (Math.PI / 2) around the Y-axis

            //extrudedMesh.scaling.y = 200.0; // Scale vertically

        }
    };

    useEffect(() => {
        // Handler to detect Enter key press
        const handleKeyDown = (event) => {
            // Inside the Enter key press handler
            if (event.key === 'Enter' && isDrawing) {
                setIsDrawing(false); // Stop drawing
                console.log(vertices.length)
                if (vertices.length > 2) {
                    // Calculate the average z value of the mouse-drawn shape vectors
                    const averageZ = vertices.reduce((sum, v) => sum + v.z, 0) / vertices.length;
                    const flattenedVertices = vertices.map(v => new Vector3(v.x, v.y, v.z));

                    createExtrudedShape(flattenedVertices);

                    // Reset vertices to start a new drawing if needed
                    setVertices([]);
                }
            }
        };
        // Add event listener for keydown
        window.addEventListener('keydown', handleKeyDown);

        // Clean up event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDrawing, vertices]); // Empty dependency array ensures this only runs on mount and unmount


    return (
        <canvas ref={canvasRef} className="babylonCanvas" {...props}></canvas>
    );
};



export default BabylonScene;
window.earcut = earcut;