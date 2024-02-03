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
    StandardMaterial,
    Mesh,
    ActionManager,
    ExecuteCodeAction,
} from '@babylonjs/core';
import earcut from 'earcut'; // Import earcut

import Navbar from './Navbar';


import './BabylonScene.css';
import { shadowsVertex } from '@babylonjs/core/Shaders/ShadersInclude/shadowsVertex';

const BabylonScene = (props) => {
    const canvasRef = useRef(null);
    const [engine, setEngine] = useState(null);  // State to hold the Babylon engine
    const [scene, setScene] = useState(null);  // State to hold the Babylon scene
    const [ground, setGround] = useState(null);  // State to hold the ground mesh

    // This state will hold the vertices of the shape the user is drawing
    const [vertices, setVertices] = useState([]);

    // This state will indicate whether the user is in drawing mode
    const [isDrawing, setIsDrawing] = useState(true);

    const [isMoving, setIsMoving] = useState(false);


    // State to control drawing mode
    const [drawMode, setDrawMode] = useState(false);

    const [extrudedMeshes, setExtrudedMeshes] = useState([]);
    const [mousePosition, setMousePosition] = useState(new Vector3(0, 0, 0));
    const [selectedMesh, setSelectedMesh] = useState(null);



    useEffect(() => {
        if (canvasRef.current) {
            const eng = new Engine(canvasRef.current, true);
            setEngine(eng);
            const scn = new Scene(eng);
            setScene(scn);
            scn.clearColor = new Color4(0.6, 0.8, 0.8, 1);

            const light = new HemisphericLight("light", new Vector3(11, 0.1, 0), scn);

            eng.runRenderLoop(() => {
                scn.render();
                // Update the position of extruded meshes based on mouse cursor
                extrudedMeshes.forEach((extrudedMesh) => {
                    const offset = mousePosition.clone().subtract(extrudedMesh.position);
                    extrudedMesh.position.addInPlace(offset.scale(0.05)); // Adjust the speed of following
                });
            });

            const grnd = MeshBuilder.CreateGround("ground", { width: 90, height: 90 }, scn);
            setGround(grnd);

            const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 1, 0), scene);
            camera.setPosition(new Vector3(0, 100, 0)); // Adjust the height as needed
            camera.setTarget(Vector3.Zero()); // Look at the origin (ground plane)

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

    useEffect(() => {
        if (engine) {
            engine.runRenderLoop(() => {
                scene.render();
                // Update the position of extruded meshes based on mouse cursor
                extrudedMeshes.forEach((extrudedMesh) => {
                    const offset = mousePosition.clone().subtract(extrudedMesh.position);
                    extrudedMesh.position.addInPlace(offset.scale(0.05)); // Adjust the speed of following
                });
            });
        }

    }, [extrudedMeshes, mousePosition]);

    useEffect(() => {
        if (scene) {
            // Handle camera control based on isDrawing
            if (isDrawing) {
                scene.activeCamera.detachControl();
            } else {
                scene.activeCamera.attachControl(canvasRef.current, true);
            }
        }
    }, [isDrawing, scene]);

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
                } else {
                    setIsDrawing(true)
                }
            };

            //Event listener for pointer move events
            const onPointerMove = (evt) => {
                if (isDrawing && drawMode) {
                    const groundPosition = getGroundPosition();

                    if (groundPosition) {
                        setVertices([...vertices, groundPosition]);
                    }
                }
            };

            scene.onPointerObservable.add(onPointerDown, PointerEventTypes.POINTERDOWN);
            scene.onPointerObservable.add(onPointerMove, PointerEventTypes.POINTERMOVE);


            return () => {
                scene.onPointerObservable.removeCallback(onPointerDown);
                scene.onPointerObservable.removeCallback(onPointerMove);

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

    const createExtrudedShape = (shape) => {

        if (scene) {
            const mat = new StandardMaterial("mat1", scene);
            mat.alpha = 1.0;
            mat.diffuseColor = new Color4(0.5, 0.5, 1.0);
            mat.backFaceCulling = false;

            console.log("Shape : ", shape)
            const extrudedMesh = MeshBuilder.ExtrudePolygon("polytri", { shape: shape, depth: 20 });
            extrudedMesh.material = mat;
            extrudedMesh.position.y += 13.75;
            // Add the extruded mesh to the state variable
            setExtrudedMeshes([...extrudedMeshes, extrudedMesh]);

            // Add a click event handler to the mesh
            extrudedMesh.actionManager = new ActionManager(scene);
            extrudedMesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    ActionManager.OnPickTrigger,
                    function (evt) {
                        // Set the selected mesh when clicked
                        setSelectedMesh(evt.source);
                        extrudedMesh.position.copyFrom(new Vector3(0,13.75 , 0)); // Change the position as needed

                    }
                )
            );
        }
    };


    const getGroundPosition = () => {
        const pickinfo = scene.pick(scene.pointerX, scene.pointerY, mesh => mesh === ground);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    };

    // Event listener for pointer move events
    const onPointerMove = (evt) => {
        

        if(!isDrawing && isMoving){
            const groundPosition = getGroundPosition();

            setMousePosition(groundPosition);
        }
      
    };


    useEffect(() => {
        // Handler to detect Enter key press
        const handleKeyDown = (event) => {
            // Inside the Enter key press handler
            if (event.key === 'Enter') {
                setIsDrawing(false); // Stop drawing
                if (vertices.length > 0) {
                    vertices.pop(); // Remove the last element
                }
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
        <>
            <Navbar drawMode={drawMode} setDrawMode={setDrawMode} isMoving={isMoving} setIsMoving={setIsMoving} />
            <canvas ref={canvasRef} className="babylonCanvas" onPointerMove={onPointerMove} {...props}></canvas>
        </>
    );
};



export default BabylonScene;
window.earcut = earcut;