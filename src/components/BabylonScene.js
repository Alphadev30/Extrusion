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
    Matrix,
    VertexBuffer
} from '@babylonjs/core';
import earcut from 'earcut'; // Import earcut

import Navbar from './Navbar';
import Footer from './Footer'


import './BabylonScene.css';
import { shadowsVertex } from '@babylonjs/core/Shaders/ShadersInclude/shadowsVertex';
import { isEditable } from '@testing-library/user-event/dist/utils';

const BabylonScene = (props) => {
    const canvasRef = useRef(null);
    const [engine, setEngine] = useState(null);  // State to hold the Babylon engine
    const [scene, setScene] = useState(null);  // State to hold the Babylon scene
    const [ground, setGround] = useState(null);  // State to hold the ground mesh
    const [camera, setCamera] = useState(null);  // State to hold the ground mesh


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


    // Vertex editing 
    const [editMode, setEditMode] = useState(false);
    const [selectedVertexIndex, setSelectedVertexIndex] = useState(null);



    useEffect(() => {
        const canvas = canvasRef.current;

        const preventScroll = (e) => {
            e.preventDefault();
        };

        // Add event listener to canvas
        canvas.addEventListener('wheel', preventScroll, { passive: false });

        // Remove event listener on cleanup
        return () => {
            canvas.removeEventListener('wheel', preventScroll);
        };
    }, []);

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

            const grnd = MeshBuilder.CreateGround("ground", { width: 180, height: 200 }, scn);
            setGround(grnd);

            const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 1, 0), scene);
            camera.setPosition(new Vector3(0, 100, 0)); // Adjust the height as needed
            camera.setTarget(Vector3.Zero()); // Look at the origin (ground plane)

            setCamera(camera);

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
        console.log(isDrawing)
    }, [isDrawing, scene]);


    // A separate useEffect for drawing lines between vertices
    useEffect(() => {
        if (scene && vertices.length > 1) {
            const lines = MeshBuilder.CreateLines("lines", { points: vertices, updatable: true }, scene);
            return () => {
                lines.dispose();  // Dispose the lines when the component unmounts or vertices change
            };
        }
    }, [scene, vertices]);  // Dependency on vertices so it updates when new points are added


    useEffect(() => {
        if (!editMode) {
            setSelectedVertexIndex(null);
        }
    }, [editMode]);

    useEffect(() => {
        // Handler to detect Enter key press
        const handleKeyDown = (event) => {
            // Inside the Enter key press handler
            if (event.key === 'Enter') {
                setIsDrawing(false); // Stop drawing
                setDrawMode(false)
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


    const createExtrudedShape = (shape) => {

        if (scene) {
            const mat = new StandardMaterial("mat1", scene);
            mat.alpha = 1.0;
            mat.diffuseColor = new Color4(0.5, 0.5, 1.0);
            mat.backFaceCulling = false;

            // console.log("Shape : ", shape)
            const extrudedMesh = MeshBuilder.ExtrudePolygon("polytri", { shape: shape, depth: 15, updatable: true });
            extrudedMesh.material = mat;
            extrudedMesh.position.y += 13.75;

            extrudedMesh.metadata = "polygon"
            extrudedMesh.isPickable = true;

            // Add the extruded mesh to the state variable
            setExtrudedMeshes([...extrudedMeshes, extrudedMesh]);
        }
    };

    const selectVertex = (mesh, point) => {
        if (editMode) {

            console.log("Mesh, point", mesh, " ", point)
            const closestVertexIndex = findClosestVertexIndex(mesh, point);
            setSelectedVertexIndex(closestVertexIndex);
        }
    };

    const findClosestVertexIndex = (mesh, point) => {
        // Get the positions of the vertices
        const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        let closestIndex = -1;
        let minDistance = Infinity;

        // Loop through each set of coordinates (x, y, z)
        for (let i = 0; i < positions.length; i += 3) {
            // Create a Vector3 for each vertex position
            const vertex = new Vector3(positions[i], positions[i + 1], positions[i + 2]);

            // Transform the local vertex position to world position
            const worldVertex = Vector3.TransformCoordinates(vertex, mesh.getWorldMatrix());

            // Calculate the distance from the world vertex position to the clicked point
            const distance = Vector3.Distance(worldVertex, point);

            // If this distance is less than the current minimum, store it and the index
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i / 3; // Divide by 3 because each vertex consists of 3 values (x, y, z)
            }
        }

        return closestIndex;
    };

    const findAllInstancesOfVertex = (vertexIndex, positions, mesh) => {
        // This function should return an array of all indices for the vertex
        let indices = [];
        const originalVertex = new Vector3(
            positions[vertexIndex * 3],
            positions[vertexIndex * 3 + 1],
            positions[vertexIndex * 3 + 2]
        );

        // Transform the local vertex position to world position
        const worldVertex = Vector3.TransformCoordinates(originalVertex, mesh.getWorldMatrix());

        for (let i = 0; i < positions.length / 3; i++) {
            const pos = new Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            // Transform each position to world position before comparing
            const posWorld = Vector3.TransformCoordinates(pos, mesh.getWorldMatrix());

            if (posWorld.equalsWithEpsilon(worldVertex)) {
                indices.push(i);
            }
        }
        return indices;
    };

    const updateVertexPosition = (vertexIndex, newPosition) => {
        const mesh = selectedMesh; // Your selected mesh
        let positions = mesh.getVerticesData(VertexBuffer.PositionKind);

        // Transform the newPosition from world space to the mesh's local space
        const inverseWorldMatrix = mesh.getWorldMatrix().invert();
        const localPosition = Vector3.TransformCoordinates(newPosition, inverseWorldMatrix);

        // Constrain the y-coordinate to the original y-coordinate of the vertex to maintain the height
        const originalY = positions[vertexIndex * 3 + 1];
        localPosition.y = originalY;

        // Assuming you have a way to get all indices of the vertex in the positions array
        const allVertexInstances = findAllInstancesOfVertex(vertexIndex, positions, mesh);
        allVertexInstances.forEach(index => {
            positions[index * 3] = localPosition.x;
            positions[index * 3 + 1] = localPosition.y;
            positions[index * 3 + 2] = localPosition.z;
        });

        mesh.updateVerticesData(VertexBuffer.PositionKind, positions, true);
    };


    const getGroundPosition = () => {
        const pickinfo = scene.pick(scene.pointerX, scene.pointerY,  mesh => mesh === ground);
        console.log(pickinfo.pickedPoint.y)
        if (pickinfo.pickedPoint.y < 0) {
            pickinfo.pickedPoint.y = 0;
        }
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    };

    // Event listener for pointer move events
    const onPointerMove = (evt) => {

        if (scene && ground) {

            // Polygon moving and visual vues
            if (!isDrawing && isMoving && selectedMesh !== null) {

                const groundPosition = getGroundPosition();
                setMousePosition(groundPosition);
                
                if (groundPosition) {
                    
                    var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera)
                    var hit = scene.pickWithRay(ray);
                    if (hit.pickedMesh && hit.pickedMesh.metadata == "polygon") {
                        hit.pickedMesh.material.diffuseColor = new Color4(1, 0, 0);
                        setSelectedMesh(selectedMesh)
                        groundPosition.y += 8.0;

                        // Calculate the center of the polygon based on its bounding box
                        const boundingBox = hit.pickedMesh.getBoundingInfo().boundingBox;
                        const center = boundingBox.center;

                        hit.pickedMesh.position.copyFrom(groundPosition.subtract(center));
                    }
                    if (hit.pickedMesh && hit.pickedMesh.metadata != "polygon") {
                        if (selectedMesh) {
                            selectedMesh.material.diffuseColor = new Color4(0.5, 0.5, 1.0); // Reset color to original
                        }
                    }
                }


            }

            // Edit the vertices
            if (editMode && selectedVertexIndex !== null) {
                const groundPosition = getGroundPosition(evt);
                if (groundPosition) {
                    updateVertexPosition(selectedVertexIndex, groundPosition);
                }
            }

            // Pencil Mode vertices placing
            if (isDrawing && drawMode && !isMoving) {
                const groundPosition = getGroundPosition();

                if (groundPosition) {
                    setVertices([...vertices, groundPosition]);
                }
            }

        }

    }

    const onPointerDown = (evt) => {
        var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera)
        var hit = scene.pickWithRay(ray);

        if (hit.pickedMesh && hit.pickedMesh.metadata == "polygon") {
            setSelectedMesh(hit.pickedMesh);
        }

        if (hit.pickedMesh && hit.pickedMesh.metadata !== "polygon") {
            if (selectedMesh) {
                selectedMesh.material.diffuseColor = new Color4(0.5, 0.5, 1.0); // Reset color to original
            }
        }

        // Add vertcies when clicked
        if (isDrawing && !isMoving) {
            const groundPosition = getGroundPosition();
            if (groundPosition) {
                setVertices([...vertices, groundPosition]);
            }
        }

        // Go back from edit mode
        if (editMode && selectedVertexIndex !== null) {
            setEditMode(false);
        }
        else if (editMode && selectedVertexIndex === null) {
            if (hit.pickedMesh && hit.pickedMesh.metadata == "polygon") {
                selectVertex(hit.pickedMesh, hit.pickedPoint);
            }
        }

        // Go back from moving mode
        if (isMoving) {
            setIsMoving(false);
        }
    };

    return (
        <>
            <Navbar drawMode={drawMode} setDrawMode={setDrawMode} isDrawing={isDrawing} setIsDrawing={setIsDrawing} isMoving={isMoving} setIsMoving={setIsMoving} editMode={editMode} setEditMode={setEditMode} />
            <canvas ref={canvasRef} className="babylonCanvas" onPointerMove={onPointerMove} onPointerDown={onPointerDown} {...props}></canvas>
            <Footer />
        </>
    );
};



export default BabylonScene;
window.earcut = earcut;