import React, { useState } from 'react';

interface DebugParams {
    cubeSpacing: number;
    cameraSpeed: number;
    rotationSpeed: number;
}

interface DebugPanelProps {
    isVisible: boolean;
    onToggle: () => void;
    debugParams: DebugParams;
    onParamChange: (key: keyof DebugParams, value: number) => void;
    scrollInfo: {
        normalizedScroll: number;
        activeIndex: number;
    };
    cubePositions: Array<{ z: number; isActive: boolean }>;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
    isVisible,
    onToggle,
    debugParams,
    onParamChange,
    scrollInfo,
    cubePositions
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const resetToDefaults = () => {
        onParamChange('cubeSpacing', 8);
        onParamChange('cameraSpeed', 0.1);
        onParamChange('rotationSpeed', 0.01);
    };

    if (!isVisible) {
        return (
            <button
                onClick={onToggle}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%) rotate(-90deg)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#666',
                    border: 'none',
                    padding: '8px 12px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    zIndex: 999,
                    transition: 'all 0.3s ease',
                    opacity: 0.3
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.3';
                    e.currentTarget.style.color = '#666';
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                }}
                title="🤫 Secret Debug Panel"
            >
                ⚙️ DEV
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '15px',
                fontFamily: '"Courier New", monospace',
                fontSize: '11px',
                borderRadius: '10px',
                zIndex: 1000,
                minWidth: '320px',
                maxHeight: '85vh',
                overflowY: 'auto',
                border: '2px solid #333',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                animation: 'slideIn 0.3s ease-out'
            }}
        >
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                borderBottom: '1px solid #444',
                paddingBottom: '10px'
            }}>
                <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    SECRET DEBUG PANEL OF SECRECY!
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            background: 'none',
                            border: '1px solid #555',
                            color: '#ccc',
                            padding: '2px 6px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            borderRadius: '3px'
                        }}
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        {isCollapsed ? '▼' : '▲'}
                    </button>
                    <button
                        onClick={onToggle}
                        style={{
                            background: 'none',
                            border: '1px solid #f44336',
                            color: '#f44336',
                            padding: '2px 6px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            borderRadius: '3px'
                        }}
                        title="Hide Panel"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ color: '#FFF', fontWeight: 'bold', marginBottom: '5px' }}>
                            SCROLL DATA:
                        </div>
                        <div style={{ color: '#AAA', marginLeft: '10px', fontSize: '10px' }}>
                            Scroll: {scrollInfo.normalizedScroll.toFixed(3)} |
                            Active Cube: {scrollInfo.activeIndex}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ color: '#FFF', fontWeight: 'bold', marginBottom: '5px' }}>
                            CUBE POSITIONS:
                        </div>
                        <div style={{ color: '#AAA', marginLeft: '10px', fontSize: '10px' }}>
                            {cubePositions.map((cube, i) => (
                                <div key={i} style={{ color: cube.isActive ? '#4CAF50' : '#AAA' }}>
                                    Cube {i}: z={cube.z.toFixed(2)}
                                    {cube.isActive && ' ← ACTIVE'}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ color: '#FF9800', fontWeight: 'bold', marginBottom: '10px' }}>
                        PARAMETERS:
                    </div>

                    {Object.entries(debugParams).map(([key, value]) => {
                        const configs = {
                            cubeSpacing: { min: 4, max: 15, step: 0.5, label: 'Cube Spacing' },
                            cameraSpeed: { min: 0.01, max: 0.5, step: 0.01, label: 'Camera Speed' },
                            rotationSpeed: { min: 0.001, max: 0.05, step: 0.001, label: 'Rotation Speed' }
                        };

                        const config = configs[key as keyof typeof configs];

                        return (
                            <div key={key} style={{ marginBottom: '8px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '3px'
                                }}>
                                    <span style={{ color: '#DDD', fontSize: '10px' }}>
                                        {config.label}:
                                    </span>
                                    <span style={{
                                        color: '#4CAF50',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        minWidth: '50px',
                                        textAlign: 'right'
                                    }}>
                                        {value.toFixed(3)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={config.min}
                                    max={config.max}
                                    step={config.step}
                                    value={value}
                                    onChange={(e) => onParamChange(key as keyof typeof debugParams, parseFloat(e.target.value))}
                                    style={{
                                        width: '100%',
                                        height: '15px',
                                        background: '#333',
                                        outline: 'none',
                                        borderRadius: '3px'
                                    }}
                                />
                            </div>
                        );
                    })}

                    <div style={{
                        marginTop: '15px',
                        paddingTop: '10px',
                        borderTop: '1px solid #444',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <button
                            onClick={resetToDefaults}
                            style={{
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontWeight: 'bold'
                            }}
                        >
                            🔄 RESET
                        </button>
                        <div style={{
                            fontSize: '9px',
                            color: '#666',
                            alignSelf: 'center',
                            fontStyle: 'italic'
                        }}>
                        </div>
                    </div>
                </>
            )
            }
        </div >
    );
};

export default DebugPanel;
