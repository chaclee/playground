import { useState, useRef } from 'react';
import { Layout, Button, Tooltip, ConfigProvider, theme as antTheme } from 'antd';
import { BulbOutlined, BulbFilled, GithubOutlined, SwapOutlined, LayoutOutlined, ColumnWidthOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { ResizablePanels } from './components/ResizablePanels';
import { useScrollSync } from './hooks/useScrollSync';

const { Header, Content } = Layout;

export default function AppWrapper() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#1677ff',
                    borderRadius: 4,
                },
            }}
        >
            <AppContent isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </ConfigProvider>
    );
}

function AppContent({ isDarkMode, toggleTheme }: { isDarkMode: boolean; toggleTheme: () => void }) {
    const [markdown, setMarkdown] = useState<string>('# Welcome to Markdown Lab\n\nStart typing in the editor to see the magic happen!\n\n## Features\n\n- **Real-time Preview**: See your changes instantly.\n- **Sync Scrolling**: Scroll one side, the other follows.\n- **Dark Mode**: Easy on the eyes.\n- **GitHub Flavored**: Support for tables, tasks, and more.\n\n```javascript\nconsole.log("Hello, World!");\n```\n\n| Feature | Status |\n| :--- | :--- |\n| Sync Scroll | ✅ |\n| Dark Mode | ✅ |\n| GFM | ✅ |');
    const [isEditorFirst, setIsEditorFirst] = useState(() => {
        const saved = localStorage.getItem('editorPosition');
        return saved ? saved === 'first' : true;
    });
    const [layoutMode, setLayoutMode] = useState<'both' | 'left' | 'right'>(() => {
        const saved = localStorage.getItem('layoutMode');
        return (saved as 'both' | 'left' | 'right') || 'both';
    });

    const editorRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useScrollSync(editorRef, previewRef);

    const toggleLayout = () => {
        const newPosition = !isEditorFirst;
        setIsEditorFirst(newPosition);
        localStorage.setItem('editorPosition', newPosition ? 'first' : 'second');
    };

    const handleLayoutChange = (mode: 'both' | 'left' | 'right') => {
        setLayoutMode(mode);
        localStorage.setItem('layoutMode', mode);
    };

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden', background: isDarkMode ? '#0f111a' : '#ffffff' }}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    background: isDarkMode ? '#161b22' : '#ffffff',
                    borderBottom: `1px solid ${isDarkMode ? '#30363d' : '#d0d7de'}`,
                    height: '64px',
                    zIndex: 10
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            background: 'linear-gradient(to right, #1677ff, #722ed1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '20px',
                            fontWeight: 'bold'
                        }}>
                        Markdown Lab
                    </div>
                    {/* <span style={{ color: isDarkMode ? '#8b949e' : '#57606a', fontSize: '12px' }}>
                        Powered by WePie EE Team
                    </span> */}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* 布局模式切换 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                        <Tooltip title="两边同时显示">
                            <Button
                                type="text"
                                icon={<AppstoreOutlined />}
                                onClick={() => handleLayoutChange('both')}
                                style={{ 
                                    color: layoutMode === 'both' ? '#1677ff' : (isDarkMode ? '#8b949e' : '#57606a'),
                                    background: layoutMode === 'both' ? (isDarkMode ? 'rgba(22, 119, 255, 0.15)' : 'rgba(22, 119, 255, 0.1)') : 'transparent',
                                    minWidth: '32px'
                                }}
                                size="small"
                            />
                        </Tooltip>
                        <Tooltip title={isEditorFirst ? '仅显示编辑器' : '仅显示预览'}>
                            <Button
                                type="text"
                                icon={<LayoutOutlined />}
                                onClick={() => handleLayoutChange('left')}
                                style={{ 
                                    color: layoutMode === 'left' ? '#1677ff' : (isDarkMode ? '#8b949e' : '#57606a'),
                                    background: layoutMode === 'left' ? (isDarkMode ? 'rgba(22, 119, 255, 0.15)' : 'rgba(22, 119, 255, 0.1)') : 'transparent',
                                    minWidth: '32px'
                                }}
                                size="small"
                            />
                        </Tooltip>
                        <Tooltip title={isEditorFirst ? '仅显示预览' : '仅显示编辑器'}>
                            <Button
                                type="text"
                                icon={<ColumnWidthOutlined />}
                                onClick={() => handleLayoutChange('right')}
                                style={{ 
                                    color: layoutMode === 'right' ? '#1677ff' : (isDarkMode ? '#8b949e' : '#57606a'),
                                    background: layoutMode === 'right' ? (isDarkMode ? 'rgba(22, 119, 255, 0.15)' : 'rgba(22, 119, 255, 0.1)') : 'transparent',
                                    minWidth: '32px'
                                }}
                                size="small"
                            />
                        </Tooltip>
                    </div>

                    <Tooltip title="交换左右位置">
                        <Button
                            type="text"
                            icon={<SwapOutlined />}
                            onClick={toggleLayout}
                            style={{ color: isDarkMode ? '#e6edf3' : '#24292f' }}
                            disabled={layoutMode !== 'both'}
                        />
                    </Tooltip>
                    <Tooltip title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}>
                        <Button
                            type="text"
                            icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
                            onClick={toggleTheme}
                            style={{ color: isDarkMode ? '#e6edf3' : '#24292f' }}
                        />
                    </Tooltip>
                    <Button
                        type="text"
                        icon={<GithubOutlined />}
                        href="https://github.com"
                        target="_blank"
                        style={{ color: isDarkMode ? '#e6edf3' : '#24292f' }}
                    />
                </div>
            </Header>

            <Content style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
                {layoutMode === 'both' ? (
                    <ResizablePanels
                        isDarkMode={isDarkMode}
                        leftPanel={
                            isEditorFirst ? (
                                <Editor
                                    ref={editorRef}
                                    value={markdown}
                                    onChange={setMarkdown}
                                    isDarkMode={isDarkMode}
                                />
                            ) : (
                                <Preview
                                    ref={previewRef}
                                    content={markdown}
                                    isDarkMode={isDarkMode}
                                />
                            )
                        }
                        rightPanel={
                            isEditorFirst ? (
                                <Preview
                                    ref={previewRef}
                                    content={markdown}
                                    isDarkMode={isDarkMode}
                                />
                            ) : (
                                <Editor
                                    ref={editorRef}
                                    value={markdown}
                                    onChange={setMarkdown}
                                    isDarkMode={isDarkMode}
                                />
                            )
                        }
                    />
                ) : layoutMode === 'left' ? (
                    isEditorFirst ? (
                        <Editor
                            ref={editorRef}
                            value={markdown}
                            onChange={setMarkdown}
                            isDarkMode={isDarkMode}
                        />
                    ) : (
                        <Preview
                            ref={previewRef}
                            content={markdown}
                            isDarkMode={isDarkMode}
                        />
                    )
                ) : (
                    isEditorFirst ? (
                        <Preview
                            ref={previewRef}
                            content={markdown}
                            isDarkMode={isDarkMode}
                        />
                    ) : (
                        <Editor
                            ref={editorRef}
                            value={markdown}
                            onChange={setMarkdown}
                            isDarkMode={isDarkMode}
                        />
                    )
                )}
            </Content>
        </Layout>
    );
}
