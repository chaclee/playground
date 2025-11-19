import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    isDarkMode?: boolean;
}

export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange, isDarkMode = true }, ref) => {
    const textAreaRef = useRef<any>(null);

    useImperativeHandle(ref, () => {
        // 返回 Ant Design TextArea 的实际 textarea DOM 元素
        return textAreaRef.current?.resizableTextArea?.textArea || textAreaRef.current;
    });

    // 计算行号
    const lineNumbers = useMemo(() => {
        const lines = value.split('\n');
        return lines.map((_, index) => index + 1).join('\n');
    }, [value]);

    return (
        <div 
            style={{ 
                height: '100%',
                width: '100%',
                position: 'relative',
                background: isDarkMode ? '#0f111a' : '#ffffff',
                overflow: 'hidden',
                display: 'flex'
            }}
        >
            {/* 行号区域 */}
            <div
                style={{
                    width: '50px',
                    padding: '24px 12px',
                    textAlign: 'right',
                    color: isDarkMode ? '#484f58' : '#8b949e',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    fontFamily: '\'JetBrains Mono\', \'Consolas\', \'Monaco\', \'Andale Mono\', monospace',
                    userSelect: 'none',
                    overflow: 'hidden',
                    borderRight: `1px solid ${isDarkMode ? '#30363d' : '#d0d7de'}`,
                    background: isDarkMode ? '#0d1117' : '#f6f8fa',
                    whiteSpace: 'pre'
                }}
            >
                {lineNumbers}
            </div>
            
            {/* 编辑器区域 */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <TextArea
                    ref={textAreaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="markdown-editor"
                    placeholder="在此输入 Markdown 内容..."
                    spellCheck={false}
                    autoFocus
                    styles={{
                        textarea: {
                            background: 'transparent',
                            color: isDarkMode ? '#e6edf3' : '#24292f',
                            height: '100%',
                            minHeight: '100%',
                            resize: 'none',
                        }
                    }}
                />
            </div>
        </div>
    );
});

Editor.displayName = 'Editor';
