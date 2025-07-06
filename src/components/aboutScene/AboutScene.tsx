import React, { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

interface AboutSceneProps {
    className?: string;
}

const AboutScene: React.FC<AboutSceneProps> = ({ className }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<{
        scene?: THREE.Scene;
        camera?: THREE.PerspectiveCamera;
        renderer?: THREE.WebGLRenderer;
        controls?: OrbitControls;
        animationId?: number;
        initialized?: boolean;
    }>({});

    // const loadGLTFModels = useCallback(() => {
    //     if (!sceneRef.current.scene) return;

    //     const loader = new GLTFLoader();

    //     // Load Celica model
    //     loader.load(
    //         // resource URL
    //         '3dmodels/highpolyCelica/scene.gltf',
    //         // called when the resource is loaded
    //         function (gltf) {
    //             if (sceneRef.current.scene) {
    //                 sceneRef.current.scene.add(gltf.scene);
    //                 console.log(gltf.animations);
    //             }
    //         },
    //         // called while loading is progressing
    //         function (xhr) {
    //             console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    //         },
    //         // called when loading has errors
    //         function (error) {
    //             console.log('An error happened loading GLTF model:', error);
    //         }
    //     );
    // }, []);

    const loadInfinitePlane = () => {
        if (!sceneRef.current.scene) return;

        const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: '#b000ff',
            side: THREE.DoubleSide,
            roughness: 0.5,
            metalness: 0.5,
            wireframe: true,
            transparent: true,
            opacity: 0.5,
        });
        // const texture = new THREE.TextureLoader().load("textures/defaultTextures/PNG/Dark/texture_01.png");
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(200, 200); // Adjust repeat to cover the plane
        // planeMaterial.map = texture;

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true; // Enable shadows on the plane
        plane.rotation.x = Math.PI / 2; // Rotate to horizontal
        plane.position.y = 0;
        sceneRef.current.scene.add(plane);
    }

    // const loadObjectsOnPlane = () => {
    //     if (!sceneRef.current.scene) return;

    //     // Load a simple box as an example object
    //     for (let i = 0; i < 10; i++) {
    //         const randomRadius = THREE.MathUtils.randFloat(1, 4); // Random radius for the cone
    //         const randomHeight = THREE.MathUtils.randFloat(3, 10); // Random height for the cone
    //         const randomRadialSegs = Math.floor(THREE.MathUtils.randFloat(3, 8)); // Random radial segments for the cone
    //         const [x, z] = Array(2).fill(0).map(() => THREE.MathUtils.randFloatSpread(100)); // Random position within the plane

    //         const coneGeometry = new THREE.ConeGeometry(randomRadius, randomHeight, randomRadialSegs);
    //         const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
    //         const texture = new THREE.TextureLoader().load("textures/defaultTextures/PNG/Dark/texture_01.png");

    //         texture.wrapS = THREE.ClampToEdgeWrapping;
    //         texture.wrapT = THREE.ClampToEdgeWrapping;
    //         texture.repeat.set(1, 1); // Set the texture to cover the cone
    //         texture.anisotropy = 16; // Improve texture quality at oblique angles
    //         material.map = texture;
    //         const cone = new THREE.Mesh(coneGeometry, material);
    //         cone.position.set(x, randomHeight / 2, z);
    //         sceneRef.current.scene.add(cone);
    //     }
    // }


    // Initialize Three.js scene
    const initializeScene = useCallback(() => {
        if (sceneRef.current.initialized || !mountRef.current) return;

        sceneRef.current.initialized = true;

        // Create scene
        const scene = new THREE.Scene();

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Clear mount and add canvas
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        mountRef.current.appendChild(renderer.domElement);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Set camera position
        camera.position.z = 5;
        camera.position.y = 2;

        // Add orbit controls (optional, if you want to control the camera)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.update();

        // Store references
        sceneRef.current = { scene, camera, renderer, controls, initialized: true };

        // Load infinite plane
        loadInfinitePlane();
        // Load objects on the plane
        // loadObjectsOnPlane();

        // Load GLTF models
        // loadGLTFModels();

        // Start animation loop
        startAnimation();
    }, []);

    // Animation loop
    const startAnimation = () => {
        const animate = () => {
            if (!sceneRef.current.initialized || !sceneRef.current.scene) return;

            sceneRef.current.animationId = requestAnimationFrame(animate);
            sceneRef.current.controls?.update();


            // Render the scene
            if (sceneRef.current.renderer && sceneRef.current.scene && sceneRef.current.camera) {
                sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
            }
        };

        animate();
    };

    // Window resize handler
    const handleResize = useCallback(() => {
        if (!sceneRef.current.camera || !sceneRef.current.renderer) return;

        sceneRef.current.camera.aspect = window.innerWidth / window.innerHeight;
        sceneRef.current.camera.updateProjectionMatrix();
        sceneRef.current.renderer.setSize(window.innerWidth, window.innerHeight);
    }, []);

    // Cleanup function
    const cleanup = useCallback(() => {
        sceneRef.current.initialized = false;
        window.removeEventListener('resize', handleResize);

        if (sceneRef.current.animationId) {
            cancelAnimationFrame(sceneRef.current.animationId);
        }

        if (sceneRef.current.renderer && mountRef.current) {
            try {
                if (mountRef.current.contains(sceneRef.current.renderer.domElement)) {
                    mountRef.current.removeChild(sceneRef.current.renderer.domElement);
                }
                sceneRef.current.renderer.dispose();
                sceneRef.current = {};
            } catch (error) {
                console.error('AboutScene: Error during cleanup:', error);
            }
        }
    }, [handleResize]);

    // Initialize scene when component mounts
    useEffect(() => {
        if (mountRef.current) {
            initializeScene();
            window.addEventListener('resize', handleResize);
            return cleanup;
        }
    }, [initializeScene, handleResize, cleanup]);

    return <div ref={mountRef} className={className} />;
};

export default AboutScene;