export interface CameraShot {
    start: {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
    };
    end: {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
    };
    duration: number; // Animation duration in seconds
    holdTime: number; // Time to hold at end position before next animation
}

export const cameraShots: CameraShot[] = [
    {
        start: { position: { x: 0, y: 0.5, z: 3.3 }, rotation: { x: -.3, y: 0, z: 0 } },
        end: { position: { x: 0, y: 2, z: 3.8 }, rotation: { x: -.5, y: 0, z: 0 } },
        duration: 5,
        holdTime: 1
    },
    {
        start: { position: { x: -1.7, y: 0.7, z: 3 }, rotation: { x: 0, y: -0.5, z: 0 } },
        end: { position: { x: -1.7, y: 0.7, z: 1 }, rotation: { x: 0, y: -1, z: 0 } },
        duration: 5,
        holdTime: 1
    },
    {
        start: { position: { x: 1.7, y: 0.7, z: 3 }, rotation: { x: 0, y: 0.5, z: 0 } },
        end: { position: { x: 1.7, y: 0.7, z: 1 }, rotation: { x: 0, y: 1, z: 0 } },
        duration: 5,
        holdTime: 1
    },
    {
        start: { position: { x: 1.6, y: 0.7, z: -2.5 }, rotation: { x: 0.3, y: 0.5, z: 0 } },
        end: { position: { x: 1.6, y: 0.7, z: -1 }, rotation: { x: 0, y: 0.75, z: 0 } },
        duration: 5,
        holdTime: 1
    },
];

