import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import TOML from '@iarna/toml';

const defaultToml = `userId = 1
id = 1
title = "delectus aut autem"
completed = false

[company]
id = 12
name = "Transform Inc"

[[company.sql]]
a="b"
b="c"`;

function App() {
    const [tomlCode, setTomlCode] = useState(defaultToml);
    const [jsonCode, setJsonCode] = useState('');
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!tomlCode.trim()) {
            setJsonCode('');
            return;
        }

        const timer = setTimeout(() => {
            try {
                const parsed = TOML.parse(tomlCode);
                setJsonCode(JSON.stringify(parsed, null, 2));
            } catch (err) {
                setJsonCode(`// 解析错误\n// ${err.message}`);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [tomlCode]);

    const handleCopy = () => {
        if (jsonCode && !jsonCode.startsWith('//')) {
            navigator.clipboard.writeText(jsonCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setTomlCode(event.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleClear = () => {
        setTomlCode('');
    };

    return (
        <div className="app">
            <div className="editor-panel">
                <div className="editor-header">
                    <span className="editor-title">TOML</span>
                    <div className="header-actions">
                        <button className="icon-btn" onClick={handleUpload} title="上传文件">
                            📁
                        </button>
                        <button className="icon-btn" onClick={handleClear} title="清空">
                            🗑️
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".toml,.txt"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <Editor
                    height="100%"
                    language="ini"
                    theme="vs"
                    value={tomlCode}
                    onChange={(value) => setTomlCode(value || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                />
            </div>

            <div className="editor-panel">
                <div className="editor-header">
                    <span className="editor-title">JSON</span>
                    <div className="header-actions">
                        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                            {copied ? '已复制 ✓' : 'Copy'}
                        </button>
                    </div>
                </div>
                <Editor
                    height="100%"
                    language="json"
                    theme="vs"
                    value={jsonCode}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        readOnly: true,
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                />
            </div>
        </div>
    );
}

export default App;
