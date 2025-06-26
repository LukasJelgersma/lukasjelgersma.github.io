import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
    className?: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ className }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<{
        scene?: THREE.Scene;
        camera?: THREE.PerspectiveCamera;
        renderer?: THREE.WebGLRenderer;
        animationId?: number;
        meshes?: THREE.Mesh[];
        initialized?: boolean;
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

        mountRef.current.appendChild(renderer.domElement);

        // Create multiple meshes with different shapes and positions
        const meshes: THREE.Mesh[] = [];

        // Create different geometries
        const geometries = [
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            new THREE.TorusGeometry(1, 0.4, 8, 16),
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.ConeGeometry(1, 2, 8),
            new THREE.OctahedronGeometry(1.2),
            new THREE.TetrahedronGeometry(1.3),
        ];

        // Create different materials with varying colors
        const colors = [0x667eea, 0x764ba2, 0x646cff, 0x535bf2, 0x4338ca, 0x6366f1];

        // Position meshes in a scattered pattern
        const positions = [
            { x: -3, y: 2, z: -2 },
            { x: 3, y: -1, z: -1 },
            { x: -2, y: -3, z: 0 },
            { x: 4, y: 1, z: -3 },
            { x: -4, y: -2, z: 1 },
            { x: 2, y: 3, z: -1 },
        ];

        // Create meshes
        geometries.forEach((geometry, index) => {
            const material = new THREE.MeshBasicMaterial({
                color: colors[index % colors.length],
                transparent: true,
                opacity: 0.7,
                wireframe: true
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Set initial position
            const pos = positions[index];
            mesh.position.set(pos.x, pos.y, pos.z);

            // Store original position for scroll calculations
            mesh.userData = {
                originalY: pos.y,
                scrollSpeed: 0.5 + (index * 0.1), // Different scroll speeds for each mesh
                rotationSpeed: {
                    x: 0.005 + (index * 0.002),
                    y: 0.005 + (index * 0.002),
                    z: 0.002 + (index * 0.001)
                }
            };

            scene.add(mesh);
            meshes.push(mesh);
        });

        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);

        // Store references for cleanup
        sceneRef.current = { scene, camera, renderer, meshes, initialized: true };

        // Function to update meshes based on scroll position
        const updateMeshesOnScroll = () => {
            // Get scroll position from the main page content
            const scrollElement = document.querySelector('.main-page-content');
            const scrollPosition = scrollElement ? scrollElement.scrollTop : 0;
            const maxScroll = scrollElement ? scrollElement.scrollHeight - scrollElement.clientHeight : 1000;

            // Normalize scroll position (0 to 1)
            const normalizedScroll = Math.min(scrollPosition / maxScroll, 1);

            meshes.forEach((mesh) => {
                // Move meshes up when scrolling down (inverse relationship)
                const scrollOffset = normalizedScroll * mesh.userData.scrollSpeed * 10;
                mesh.position.y = mesh.userData.originalY + scrollOffset;
            });
        };

        const animate = () => {
            if (!sceneRef.current.initialized) return;

            const animationId = requestAnimationFrame(animate);
            sceneRef.current.animationId = animationId;

            // Update scroll-based positions
            updateMeshesOnScroll();

            // Rotate all meshes
            meshes.forEach((mesh) => {
                mesh.rotation.x += mesh.userData.rotationSpeed.x;
                mesh.rotation.y += mesh.userData.rotationSpeed.y;
                mesh.rotation.z += mesh.userData.rotationSpeed.z;
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
                    // Clean up all meshes
                    if (sceneRef.current.meshes) {
                        sceneRef.current.meshes.forEach(mesh => {
                            mesh.geometry.dispose();
                            if (Array.isArray(mesh.material)) {
                                mesh.material.forEach(material => material.dispose());
                            } else {
                                mesh.material.dispose();
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