import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelsProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
    isDarkMode?: boolean;
    defaultLeftWidth?: number;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
    leftPanel,
    rightPanel,
    isDarkMode = true,
    defaultLeftWidth = 50
}) => {
    const [leftWidth, setLeftWidth] = useState(() => {
        const saved = localStorage.getItem('panelLeftWidth');
        return saved ? parseFloat(saved) : defaultLeftWidth;
    });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // 限制宽度在 20% 到 80% 之间
            const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
            setLeftWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            localStorage.setItem('panelLeftWidth', leftWidth.toString());
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, leftWidth]);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                height: '100%',
                width: '100%',
                position: 'relative',
                userSelect: isDragging ? 'none' : 'auto'
            }}
        >
            {/* 左侧面板 */}
            <div
                style={{
                    width: `${leftWidth}%`,
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                {leftPanel}
            </div>

            {/* 可拖动的分隔条 */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    width: '5px',
                    height: '100%',
                    cursor: 'col-resize',
                    backgroundColor: isDragging 
                        ? (isDarkMode ? '#1677ff' : '#1677ff')
                        : (isDarkMode ? '#30363d' : '#d0d7de'),
                    position: 'relative',
                    transition: isDragging ? 'none' : 'background-color 0.2s',
                    zIndex: 10
                }}
            >
                {/* 拖动手柄 */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '20px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{
                        width: '3px',
                        height: '100%',
                        background: isDarkMode ? '#484f58' : '#8b949e',
                        borderRadius: '2px'
                    }} />
                </div>

                {/* 百分比显示 */}
                {isDragging && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, calc(-50% - 60px))',
                            padding: '8px 16px',
                            background: isDarkMode ? '#161b22' : '#ffffff',
                            border: `2px solid #1677ff`,
                            borderRadius: '6px',
                            color: isDarkMode ? '#e6edf3' : '#24292f',
                            fontSize: '14px',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            pointerEvents: 'none',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {Math.round(leftWidth)}% | {Math.round(100 - leftWidth)}%
                    </div>
                )}
            </div>

            {/* 右侧面板 */}
            <div
                style={{
                    width: `${100 - leftWidth}%`,
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                {rightPanel}
            </div>
        </div>
    );
};
