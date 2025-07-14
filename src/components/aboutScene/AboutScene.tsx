import React, { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cameraShots } from './cameraShots/cameraShots';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

interface AboutSceneProps {
    className?: string;
}

const AboutScene: React.FC<AboutSceneProps> = ({ className }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    const coolCameraShots = true; // Set to false to disable camera shots

    const sceneRef = useRef<{
        scene?: THREE.Scene;
        camera?: THREE.PerspectiveCamera;
        renderer?: THREE.WebGLRenderer;
        controls?: OrbitControls;
        animationId?: number;
        initialized?: boolean;
        animationStartTime?: number;
        currentPhase?: 'animating' | 'holding';
        light?: THREE.DirectionalLight;
    }>({});

    const currentShotIndexRef = useRef(0);

    const loadGLTFModels = useCallback(() => {
        if (!sceneRef.current.scene) return;

        const loader = new GLTFLoader();

        // Load Celica model
        loader.load(
            // resource URL
            '3dmodels/highpolyCelica/scene.gltf',
            // called when the resource is loaded
            function (gltf) {
                if (sceneRef.current.scene) {
                    gltf.scene.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = false;
                        }
                    });
                    sceneRef.current.scene.add(gltf.scene);
                }
            },
            // called while loading is progressing
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened loading GLTF model:', error);
            }
        );
    }, []);

    const loadInfinitePlane = () => {
        if (!sceneRef.current.scene) return;

        const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xa7a7a7,
            side: THREE.DoubleSide,
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI / 2; // Rotate to horizontal
        plane.position.y = 0;
        plane.receiveShadow = true; // Allow shadows to be cast on the plane
        sceneRef.current.scene.add(plane);
    }

    // Easing function for smooth animation
    const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // Interpolate between two values
    const lerp = (start: number, end: number, t: number): number => {
        return start + (end - start) * t;
    };

    // Initialize Three.js scene
    const initializeScene = useCallback(() => {
        if (sceneRef.current.initialized || !mountRef.current) return;

        sceneRef.current.initialized = true;

        // Create scene
        const scene = new THREE.Scene();

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Clear mount and add canvas
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        mountRef.current.appendChild(renderer.domElement);

        const light = new THREE.DirectionalLight(0xe7b3ff, 1);
        light.position.set(5, 5, 5);
        light.castShadow = true;
        scene.add(light);

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;

        // Set initial camera position from first shot
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.update();

        const firstShot = cameraShots[0];
        camera.position.set(firstShot.start.position.x, firstShot.start.position.y, firstShot.start.position.z);
        camera.rotation.set(firstShot.start.rotation.x, firstShot.start.rotation.y, firstShot.start.rotation.z);


        // Store references
        sceneRef.current = {
            scene,
            camera,
            controls,
            renderer,
            initialized: true,
            animationStartTime: Date.now(),
            currentPhase: 'animating',
            light
        };

        // Load infinite plane
        loadInfinitePlane();

        // Load GLTF models
        loadGLTFModels();

        // Start animation loop
        startAnimation();
    }, []);

    // Animation loop
    const startAnimation = () => {
        const animate = () => {
            if (!sceneRef.current.initialized || !sceneRef.current.scene || !sceneRef.current.camera) return;

            if (coolCameraShots) {
                const now = Date.now();

                if (!sceneRef.current.animationStartTime) {
                    sceneRef.current.animationStartTime = now;
                }

                const currentShot = cameraShots[currentShotIndexRef.current];

                const elapsed = (now - sceneRef.current.animationStartTime) / 1000; // Convert to seconds

                if (sceneRef.current.currentPhase === 'animating') {
                    // Animation phase
                    const progress = Math.min(elapsed / currentShot.duration, 1);
                    const easedProgress = easeInOutCubic(progress);

                    // Interpolate position
                    sceneRef.current.camera.position.x = lerp(
                        currentShot.start.position.x,
                        currentShot.end.position.x,
                        easedProgress
                    );
                    sceneRef.current.camera.position.y = lerp(
                        currentShot.start.position.y,
                        currentShot.end.position.y,
                        easedProgress
                    );
                    sceneRef.current.camera.position.z = lerp(
                        currentShot.start.position.z,
                        currentShot.end.position.z,
                        easedProgress
                    );

                    // Interpolate rotation
                    sceneRef.current.camera.rotation.x = lerp(
                        currentShot.start.rotation.x,
                        currentShot.end.rotation.x,
                        easedProgress
                    );
                    sceneRef.current.camera.rotation.y = lerp(
                        currentShot.start.rotation.y,
                        currentShot.end.rotation.y,
                        easedProgress
                    );
                    sceneRef.current.camera.rotation.z = lerp(
                        currentShot.start.rotation.z,
                        currentShot.end.rotation.z,
                        easedProgress
                    );

                    // Check if animation is complete
                    if (progress >= 1) {
                        sceneRef.current.currentPhase = 'holding';
                        sceneRef.current.animationStartTime = now;
                    }
                } else if (sceneRef.current.currentPhase === 'holding') {
                    // Hold phase
                    if (elapsed >= currentShot.holdTime) {
                        // Move to next shot
                        const nextIndex = (currentShotIndexRef.current + 1) % cameraShots.length;

                        currentShotIndexRef.current = nextIndex;
                        sceneRef.current.currentPhase = 'animating';
                        sceneRef.current.animationStartTime = now;
                    }
                }
            } else {
                sceneRef.current.controls?.update();
            }


            sceneRef.current.animationId = requestAnimationFrame(animate);


            // Render the scene
            sceneRef.current.renderer?.render(sceneRef.current.scene, sceneRef.current.camera);
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

    return (
        <>
            <div ref={mountRef} className={className} />
        </>
    )
        ;
};

export default AboutScene;