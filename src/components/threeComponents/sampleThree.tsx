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

        mountRef.current.appendChild(renderer.domElement);

        // Create debug panel with controls
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            border-radius: 8px;
            z-index: 1000;
            min-width: 300px;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid #333;
        `;

        // Debug parameters (made global to the component)
        const debugParams = {
            spacing: 7,
            baseMovementMultiplier: 4,
            forwardBoost: 3,
            transitionSpeed: 0.1,
            scaleBoost: 0.3,
            targetPosition: 2,
            maxForwardPosition: 8
        };

        // Create debug panel HTML
        debugPanel.innerHTML = `
            <div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px;">🔧 DEBUG CONTROLS</div>
            
            <div style="margin-bottom: 15px;">
                <div style="color: #FFF; font-weight: bold;">📊 SCROLL INFO:</div>
                <div id="scroll-info" style="color: #AAA; margin-left: 10px;">
                    Scroll: 0.000 | Section: 0 | Progress: 0.000
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="color: #FFF; font-weight: bold;">📦 CUBE POSITIONS:</div>
                <div id="cube-positions" style="color: #AAA; margin-left: 10px; font-size: 10px;">
                    Loading...
                </div>
            </div>

            <div style="color: #FF9800; font-weight: bold; margin-bottom: 10px;">⚙️ LIVE CONTROLS:</div>
            
            <div style="margin-bottom: 8px;">
                <label style="display: block; margin-bottom: 3px;">Spacing: <span id="spacing-value">${debugParams.spacing}</span></label>
                <input type="range" id="spacing-slider" min="3" max="12" step="0.5" value="${debugParams.spacing}" 
                       style="width: 100%; height: 15px;">
            </div>

            <div style="margin-bottom: 8px;">
                <label style="display: block; margin-bottom: 3px;">Base Movement: <span id="movement-value">${debugParams.baseMovementMultiplier}</span></label>
                <input type="range" id="movement-slider" min="1" max="8" step="0.2" value="${debugParams.baseMovementMultiplier}" 
                       style="width: 100%; height: 15px;">
            </div>

            <div style="margin-bottom: 8px;">
                <label style="display: block; margin-bottom: 3px;">Forward Boost: <span id="boost-value">${debugParams.forwardBoost}</span></label>
                <input type="range" id="boost-slider" min="0" max="6" step="0.1" value="${debugParams.forwardBoost}" 
                       style="width: 100%; height: 15px;">
            </div>

            <div style="margin-bottom: 8px;">
                <label style="display: block; margin-bottom: 3px;">Transition Speed: <span id="speed-value">${debugParams.transitionSpeed}</span></label>
                <input type="range" id="speed-slider" min="0.01" max="0.5" step="0.01" value="${debugParams.transitionSpeed}" 
                       style="width: 100%; height: 15px;">
            </div>

            <div style="margin-bottom: 8px;">
                <label style="display: block; margin-bottom: 3px;">Scale Boost: <span id="scale-value">${debugParams.scaleBoost}</span></label>
                <input type="range" id="scale-slider" min="0" max="1" step="0.05" value="${debugParams.scaleBoost}" 
                       style="width: 100%; height: 15px;">
            </div>

            <div style="margin-bottom: 8px;">
                <label style="display: block; margin-bottom: 3px;">Target Position: <span id="target-value">${debugParams.targetPosition}</span></label>
                <input type="range" id="target-slider" min="-2" max="5" step="0.1" value="${debugParams.targetPosition}" 
                       style="width: 100%; height: 15px;">
            </div>

            <div style="margin-bottom: 8px;">
                <label style="display: block; margin-bottom: 3px;">Max Forward: <span id="max-value">${debugParams.maxForwardPosition}</span></label>
                <input type="range" id="max-slider" min="4" max="15" step="0.5" value="${debugParams.maxForwardPosition}" 
                       style="width: 100%; height: 15px;">
            </div>

            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #333;">
                <button id="reset-btn" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    🔄 RESET TO DEFAULTS
                </button>
            </div>
        `;

        document.body.appendChild(debugPanel);

        // Add event listeners for sliders
        const addSliderListener = (sliderId: string, valueId: string, paramKey: keyof typeof debugParams) => {
            const slider = document.getElementById(sliderId) as HTMLInputElement;
            const valueSpan = document.getElementById(valueId);
            
            if (slider && valueSpan) {
                slider.addEventListener('input', (e) => {
                    const value = parseFloat((e.target as HTMLInputElement).value);
                    debugParams[paramKey] = value as any;
                    valueSpan.textContent = value.toString();
                });
            }
        };

        addSliderListener('spacing-slider', 'spacing-value', 'spacing');
        addSliderListener('movement-slider', 'movement-value', 'baseMovementMultiplier');
        addSliderListener('boost-slider', 'boost-value', 'forwardBoost');
        addSliderListener('speed-slider', 'speed-value', 'transitionSpeed');
        addSliderListener('scale-slider', 'scale-value', 'scaleBoost');
        addSliderListener('target-slider', 'target-value', 'targetPosition');
        addSliderListener('max-slider', 'max-value', 'maxForwardPosition');

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                debugParams.spacing = 7;
                debugParams.baseMovementMultiplier = 4;
                debugParams.forwardBoost = 3;
                debugParams.transitionSpeed = 0.1;
                debugParams.scaleBoost = 0.3;
                debugParams.targetPosition = 2;
                debugParams.maxForwardPosition = 8;

                // Update sliders and values
                (document.getElementById('spacing-slider') as HTMLInputElement).value = '7';
                (document.getElementById('movement-slider') as HTMLInputElement).value = '4';
                (document.getElementById('boost-slider') as HTMLInputElement).value = '3';
                (document.getElementById('speed-slider') as HTMLInputElement).value = '0.1';
                (document.getElementById('scale-slider') as HTMLInputElement).value = '0.3';
                (document.getElementById('target-slider') as HTMLInputElement).value = '2';
                (document.getElementById('max-slider') as HTMLInputElement).value = '8';

                document.getElementById('spacing-value')!.textContent = '7';
                document.getElementById('movement-value')!.textContent = '4';
                document.getElementById('boost-value')!.textContent = '3';
                document.getElementById('speed-value')!.textContent = '0.1';
                document.getElementById('scale-value')!.textContent = '0.3';
                document.getElementById('target-value')!.textContent = '2';
                document.getElementById('max-value')!.textContent = '8';
            });
        }

        // Create 4 cubes for the carousel
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
        let spacing = debugParams.spacing; // Use debugParams spacing

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

            // Update debug information
            const scrollInfo = document.getElementById('scroll-info');
            if (scrollInfo) {
                scrollInfo.textContent = `Scroll: ${normalizedScroll.toFixed(3)} | Section: ${activeIndex} | Progress: ${progressWithinCube.toFixed(3)}`;
            }

            // Update cube positions display
            const cubePositions = document.getElementById('cube-positions');
            if (cubePositions) {
                cubePositions.innerHTML = cubes.map((cube, i) => 
                    `Cube ${i}: z=${cube.position.z.toFixed(2)} scale=${cube.scale.x.toFixed(2)} ${i === activeIndex ? '← ACTIVE' : ''}`
                ).join('<br>');
            }

            // Notify parent component about active cube change
            if (sceneRef.current.currentActiveIndex !== activeIndex && onActiveObjectChange) {
                sceneRef.current.currentActiveIndex = activeIndex;
                onActiveObjectChange(activeIndex);
            }

            cubes.forEach((cube, index) => {
                // Use dynamic spacing from debugParams
                spacing = debugParams.spacing;
                
                // Calculate target Z position for each cube using debug parameters
                let targetZ = cube.userData.originalZ + (normalizedScroll * spacing * debugParams.baseMovementMultiplier);

                // When a cube is "active" (closest to camera), bring it even closer
                if (index === activeIndex) {
                    targetZ += progressWithinCube * debugParams.forwardBoost;
                    // Optionally clamp to target position
                    if (targetZ > debugParams.targetPosition) {
                        targetZ = debugParams.targetPosition;
                    }
                }

                // Prevent cubes from going too far forward
                targetZ = Math.min(targetZ, debugParams.maxForwardPosition);

                // Smooth interpolation to target position using debug parameter
                cube.position.z += (targetZ - cube.position.z) * debugParams.transitionSpeed;

                // Scale effect - make active cube slightly larger using debug parameter
                const scale = index === activeIndex ? 1 + progressWithinCube * debugParams.scaleBoost : 1;
                cube.scale.setScalar(scale);

                // Opacity effect - make active cube more opaque
                const opacity = index === activeIndex ? 0.9 : 0.6;
                if (cube.material instanceof THREE.MeshBasicMaterial) {
                    cube.material.opacity = opacity;
                }
            });

            // Update text meshes
            textMeshes.forEach((textMesh, index) => {
                // Move text with corresponding cube using debug parameters
                let targetZ = textMesh.userData.originalZ + (normalizedScroll * spacing * debugParams.baseMovementMultiplier);

                if (index === activeIndex) {
                    targetZ += progressWithinCube * debugParams.forwardBoost;
                    if (targetZ > debugParams.targetPosition) {
                        targetZ = debugParams.targetPosition;
                    }
                }

                targetZ = Math.min(targetZ, debugParams.maxForwardPosition);

                textMesh.position.z += (targetZ - textMesh.position.z) * debugParams.transitionSpeed;

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

            // Remove debug panel
            const debugPanel = document.getElementById('debug-panel');
            if (debugPanel && debugPanel.parentNode) {
                debugPanel.parentNode.removeChild(debugPanel);
            }

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