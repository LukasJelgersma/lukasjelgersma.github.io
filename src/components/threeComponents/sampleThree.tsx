import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
    className?: string;
    onActiveObjectChange?: (index: number) => void;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ className, onActiveObjectChange }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<{
        scene?: THREE.Scene;
        camera?: THREE.PerspectiveCamera;
        renderer?: THREE.WebGLRenderer;
        animationId?: number;
        cubes?: THREE.Mesh[];
        textMeshes?: THREE.Mesh[];
        initialized?: boolean;
        currentActiveIndex?: number;
    }>({});

    useEffect(() => {
        if (sceneRef.current.initialized || !mountRef.current) return;

        sceneRef.current.initialized = true;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        // Make background transparent
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Clear any existing canvases first
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        mountRef.current.appendChild(renderer.domElement);        // Create 4 cubes for the carousel
        const cubes: THREE.Mesh[] = [];
        const textMeshes: THREE.Mesh[] = [];
        const cubeColors = [0x667eea, 0x764ba2, 0x646cff, 0x535bf2];

        // Information for each cube
        const cubeInfo = [
            { title: "About Me", subtitle: "Software Developer" },
            { title: "Skills", subtitle: "Technical Expertise" },
            { title: "Projects", subtitle: "Recent Work" },
            { title: "Contact", subtitle: "Get In Touch" }
        ];

        // Position cubes in a line going back into the scene
        const spacing = 8; // Distance between cubes

        // Load font and create text (we'll use basic geometry for now)
        for (let i = 0; i < 4; i++) {
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshBasicMaterial({
                color: cubeColors[i],
                transparent: true,
                opacity: 0.8,
                wireframe: true
            });

            const cube = new THREE.Mesh(geometry, material);

            // Position cubes in a line going back
            cube.position.set(0, 0, -spacing * i);

            // Store original position and index
            cube.userData = {
                originalZ: -spacing * i,
                index: i,
                rotationSpeed: {
                    x: 0.005 + (i * 0.002),
                    y: 0.005 + (i * 0.002),
                    z: 0.002 + (i * 0.001)
                }
            };

            scene.add(cube);
            cubes.push(cube);

            // Create floating text next to each cube
            // We'll create simple plane geometry with canvas texture for text
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 256;

            if (context) {
                // Clear canvas
                context.fillStyle = 'rgba(0, 0, 0, 0)';
                context.fillRect(0, 0, canvas.width, canvas.height);

                // Set text properties
                context.fillStyle = 'white';
                context.font = 'bold 48px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                // Add title
                context.fillText(cubeInfo[i].title, canvas.width / 2, canvas.height / 2 - 30);

                // Add subtitle
                context.font = '32px Arial';
                context.fillStyle = 'rgba(255, 255, 255, 0.8)';
                context.fillText(cubeInfo[i].subtitle, canvas.width / 2, canvas.height / 2 + 30);
            }

            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            // Create text plane
            const textGeometry = new THREE.PlaneGeometry(4, 2);
            const textMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0
            });

            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(3.5, 0, -spacing * i); // Position to the right of each cube
            textMesh.userData = {
                originalZ: -spacing * i,
                originalOpacity: 0,
                index: i
            };

            scene.add(textMesh);
            textMeshes.push(textMesh);
        }

        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        // Store references for cleanup
        sceneRef.current = {
            scene,
            camera,
            renderer,
            cubes,
            textMeshes,
            initialized: true,
            currentActiveIndex: -1
        };

        // Function to update cubes based on scroll position
        const updateCubesOnScroll = () => {
            const scrollElement = document.querySelector('.main-page-content');
            const scrollPosition = scrollElement ? scrollElement.scrollTop : 0;
            const maxScroll = scrollElement ? scrollElement.scrollHeight - scrollElement.clientHeight : 1000;

            // Normalize scroll position (0 to 1)
            const normalizedScroll = Math.min(scrollPosition / maxScroll, 1);

            // Calculate which cube should be active based on scroll
            const scrollProgress = normalizedScroll * 4; // 4 cubes
            const activeIndex = Math.floor(scrollProgress);
            const progressWithinCube = scrollProgress - activeIndex;

            // Notify parent component about active cube change
            if (sceneRef.current.currentActiveIndex !== activeIndex && onActiveObjectChange) {
                sceneRef.current.currentActiveIndex = activeIndex;
                onActiveObjectChange(activeIndex);
            }

            cubes.forEach((cube, index) => {
                // Calculate target Z position for each cube
                let targetZ = cube.userData.originalZ + (normalizedScroll * spacing * 4);

                // When a cube is "active" (closest to camera), bring it even closer
                if (index === activeIndex) {
                    targetZ += progressWithinCube * 3; // Extra forward movement
                }

                // Smooth interpolation to target position
                cube.position.z += (targetZ - cube.position.z) * 0.1;

                // Scale effect - make active cube slightly larger
                const scale = index === activeIndex ? 1 + progressWithinCube * 0.3 : 1;
                cube.scale.setScalar(scale);

                // Opacity effect - make active cube more opaque
                const opacity = index === activeIndex ? 0.9 : 0.6;
                if (cube.material instanceof THREE.MeshBasicMaterial) {
                    cube.material.opacity = opacity;
                }
            });

            // Update text meshes
            textMeshes.forEach((textMesh, index) => {
                // Move text with corresponding cube
                let targetZ = textMesh.userData.originalZ + (normalizedScroll * spacing * 4);

                if (index === activeIndex) {
                    targetZ += progressWithinCube * 3;
                }

                textMesh.position.z += (targetZ - textMesh.position.z) * 0.1;

                // Show text only for active cube
                const textOpacity = index === activeIndex ? 0.9 : 0;
                if (textMesh.material instanceof THREE.MeshBasicMaterial) {
                    textMesh.material.opacity = textOpacity;
                }

                // Make text always face the camera
                textMesh.lookAt(camera.position);
            });
        };

        const animate = () => {
            if (!sceneRef.current.initialized) return;

            const animationId = requestAnimationFrame(animate);
            sceneRef.current.animationId = animationId;

            // Update scroll-based positions
            updateCubesOnScroll();

            // Rotate all cubes
            cubes.forEach((cube) => {
                cube.rotation.x += cube.userData.rotationSpeed.x;
                cube.rotation.y += cube.userData.rotationSpeed.y;
                cube.rotation.z += cube.userData.rotationSpeed.z;
            });

            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            if (sceneRef.current.camera && sceneRef.current.renderer && sceneRef.current.initialized) {
                const width = window.innerWidth;
                const height = window.innerHeight;

                sceneRef.current.camera.aspect = width / height;
                sceneRef.current.camera.updateProjectionMatrix();
                sceneRef.current.renderer.setSize(width, height);
                sceneRef.current.renderer.setPixelRatio(window.devicePixelRatio);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            sceneRef.current.initialized = false;

            window.removeEventListener('resize', handleResize);

            if (sceneRef.current.animationId) {
                cancelAnimationFrame(sceneRef.current.animationId);
            }

            if (sceneRef.current.renderer && mountRef.current) {
                try {
                    // Clean up all cubes
                    if (sceneRef.current.cubes) {
                        sceneRef.current.cubes.forEach(cube => {
                            cube.geometry.dispose();
                            if (Array.isArray(cube.material)) {
                                cube.material.forEach(material => material.dispose());
                            } else {
                                cube.material.dispose();
                            }
                        });
                    }

                    // Clean up all text meshes
                    if (sceneRef.current.textMeshes) {
                        sceneRef.current.textMeshes.forEach(textMesh => {
                            textMesh.geometry.dispose();
                            if (Array.isArray(textMesh.material)) {
                                textMesh.material.forEach(material => {
                                    if (material instanceof THREE.MeshBasicMaterial && material.map) {
                                        material.map.dispose();
                                    }
                                    material.dispose();
                                });
                            } else {
                                if (textMesh.material instanceof THREE.MeshBasicMaterial && textMesh.material.map) {
                                    textMesh.material.map.dispose();
                                }
                                textMesh.material.dispose();
                            }
                        });
                    }

                    // Remove canvas from DOM
                    if (mountRef.current.contains(sceneRef.current.renderer.domElement)) {
                        mountRef.current.removeChild(sceneRef.current.renderer.domElement);
                    }

                    // Dispose renderer
                    sceneRef.current.renderer.dispose();

                    // Clear references
                    sceneRef.current = {};
                } catch (error) {
                    console.error('ThreeScene: Error during cleanup:', error);
                }
            }
        };
    }, []);

    return <div ref={mountRef} className={className} />;
};

export default ThreeScene;