import React, { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import DebugPanel from './DebugPanel';

interface ThreeSceneProps {
    className?: string;
    onActiveObjectChange?: (index: number) => void;
}

// Cube data - moved outside component to avoid recreation
const cubeData = [
    { title: "About Me", subtitle: "Software Developer", color: 0x667eea },
    { title: "Skills", subtitle: "Yeah I have some", color: 0x764ba2 },
    { title: "Projects", subtitle: "Got some aswell", color: 0x646cff },
    { title: "Contact", subtitle: "Hit me up", color: 0x535bf2 }
];


const ThreeScene: React.FC<ThreeSceneProps> = ({ className, onActiveObjectChange }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<{
        scene?: THREE.Scene;
        camera?: THREE.PerspectiveCamera;
        renderer?: THREE.WebGLRenderer;
        animationId?: number;
        cubes?: THREE.Mesh[];
        initialized?: boolean;
        currentActiveIndex?: number;
    }>({});

    // Debug state
    const [isDebugVisible, setIsDebugVisible] = useState(false);
    const [debugParams, setDebugParams] = useState({
        cubeSpacing: 30,
        cameraSpeed: 0.1,
        rotationSpeed: 0.01
    });
    const [scrollInfo, setScrollInfo] = useState({
        normalizedScroll: 0,
        activeIndex: 0
    });
    const [cubePositions, setCubePositions] = useState<Array<{ z: number; isActive: boolean }>>([]);

    const handleDebugParamChange = (key: keyof typeof debugParams, value: number) => {
        setDebugParams(prev => ({ ...prev, [key]: value }));
    };

    const spaceTexture = new THREE.TextureLoader().load('/textures/8k_stars.jpg');
    spaceTexture.colorSpace = THREE.SRGBColorSpace;
    spaceTexture.wrapS = THREE.RepeatWrapping;
    spaceTexture.wrapT = THREE.RepeatWrapping;

    const createSpaceOrb = (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
        // Create a large sphere that surrounds the entire scene
        const sphereGeometry = new THREE.SphereGeometry(800, 64, 32);

        // Create material with the space texture on the inside
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: spaceTexture,
            side: THREE.BackSide, // This makes the texture visible from inside
            transparent: false,
            opacity: 1
        });

        const spaceOrb = new THREE.Mesh(sphereGeometry, sphereMaterial);
        spaceOrb.position.set(0, 0, 0);

        scene.add(spaceOrb);
        return spaceOrb;
    };

    const addTextToScene = (x: number, y: number, z: number, text: string, scene: THREE.Scene) => {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        // Set canvas size
        canvas.width = 512;
        canvas.height = 128;

        // Configure text style
        context.font = '32px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Draw text on canvas
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);

        // Create material with transparent background
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });

        // Create plane geometry for the text
        const geometry = new THREE.PlaneGeometry(4, 1);
        const textMesh = new THREE.Mesh(geometry, material);

        // Position the text
        textMesh.position.set(x, y, z);

        // Add to scene
        scene.add(textMesh);

        return textMesh;
    };

    // Initialize Three.js scene - called once when component mounts
    const initializeScene = useCallback(() => {
        if (sceneRef.current.initialized || !mountRef.current) return;

        sceneRef.current.initialized = true;

        // Create Three.js objects
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Clear mount and add canvas
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        mountRef.current.appendChild(renderer.domElement);

        // Create space background
        createSpaceOrb(scene, camera);

        // Add background objects
        for (let i = 0; i < 200; i++) {
            const geometry = new THREE.OctahedronGeometry(2, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x535bf2, transparent: true, opacity: 0.5, wireframe: true });
            const object = new THREE.Mesh(geometry, material);
            const [x, y, z] = Array(3).fill(0).map(() => THREE.MathUtils.randFloatSpread(1000));
            object.position.set(x, y, z);

            scene.add(object);
        }

        // Create cubes
        const cubes: THREE.Mesh[] = [];
        cubeData.forEach((data, index) => {
            const geometry = new THREE.OctahedronGeometry(2, 1);
            const material = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 1,
                wireframe: true
            });

            const cube = new THREE.Mesh(geometry, material);
            const randomX = THREE.MathUtils.randFloatSpread(100);
            const randomY = THREE.MathUtils.randFloatSpread(100);
            cube.position.set(randomX, randomY, -index * debugParams.cubeSpacing);
            cube.userData = { index, originalZ: -index * debugParams.cubeSpacing };

            scene.add(cube);
            cubes.push(cube);

            addTextToScene(randomX - 3, randomY + 1, -index * debugParams.cubeSpacing, data.title, scene);
            addTextToScene(randomX - 3, randomY, -index * debugParams.cubeSpacing, data.subtitle, scene);

        });

        // Set initial camera position
        camera.position.set(cubes[0].position.x, cubes[0].position.y, 5);

        // Store references
        sceneRef.current = { scene, camera, renderer, cubes, initialized: true, currentActiveIndex: -1 };

        startAnimation();
    }, [debugParams.cubeSpacing]);

    // Animation and scroll handling
    const startAnimation = () => {
        const animate = () => {
            if (!sceneRef.current.initialized || !sceneRef.current.scene) return;

            sceneRef.current.animationId = requestAnimationFrame(animate);

            // Handle scroll
            const scrollElement = document.querySelector('.main-page-content');
            if (scrollElement && sceneRef.current.camera && sceneRef.current.cubes) {
                const scrollPosition = scrollElement.scrollTop;
                const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
                const normalizedScroll = Math.min(Math.max(scrollPosition / maxScroll, 0), 1);

                // Calculate active cube index
                const progress = normalizedScroll * (cubeData.length - 1);
                const activeIndex = Math.round(progress);

                // Update states
                setScrollInfo({ normalizedScroll, activeIndex });

                if (sceneRef.current.currentActiveIndex !== activeIndex && onActiveObjectChange) {
                    sceneRef.current.currentActiveIndex = activeIndex;
                    onActiveObjectChange(activeIndex);
                }

                // Move camera to active cube
                const cameraOffset = 7;
                const targetZ = -activeIndex * debugParams.cubeSpacing + cameraOffset;
                const targetX = sceneRef.current.cubes[activeIndex].position.x;
                const targetY = sceneRef.current.cubes[activeIndex].position.y;

                sceneRef.current.camera.position.x += (targetX - sceneRef.current.camera.position.x) * debugParams.cameraSpeed;
                sceneRef.current.camera.position.y += (targetY - sceneRef.current.camera.position.y) * debugParams.cameraSpeed;
                sceneRef.current.camera.position.z += (targetZ - sceneRef.current.camera.position.z) * debugParams.cameraSpeed;

                // Update cube positions for debug
                const positions = sceneRef.current.cubes.map((cube, index) => ({
                    z: cube.position.z,
                    isActive: index === activeIndex
                }));
                setCubePositions(positions);
            }

            // Rotate cubes
            sceneRef.current.cubes?.forEach(cube => {
                cube.rotation.x += debugParams.rotationSpeed;
                cube.rotation.y += debugParams.rotationSpeed;
            });

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
                // Clean up cubes
                sceneRef.current.cubes?.forEach(cube => {
                    cube.geometry.dispose();
                    (cube.material as THREE.Material).dispose();
                });

                // Remove canvas
                if (mountRef.current.contains(sceneRef.current.renderer.domElement)) {
                    mountRef.current.removeChild(sceneRef.current.renderer.domElement);
                }

                sceneRef.current.renderer.dispose();
                sceneRef.current = {};
            } catch (error) {
                console.error('ThreeScene: Error during cleanup:', error);
            }
        }
    }, [handleResize]);

    // Initialize when mount ref is available
    React.useEffect(() => {
        if (mountRef.current) {
            initializeScene();
            window.addEventListener('resize', handleResize);
            return cleanup;
        }
    }, [initializeScene, handleResize, cleanup]);

    return (
        <>
            <div ref={mountRef} className={className} />
            <DebugPanel
                isVisible={isDebugVisible}
                onToggle={() => setIsDebugVisible(!isDebugVisible)}
                debugParams={debugParams}
                onParamChange={handleDebugParamChange}
                scrollInfo={scrollInfo}
                cubePositions={cubePositions}
            />
        </>
    );
};

export default ThreeScene;