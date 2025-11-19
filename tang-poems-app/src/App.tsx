import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, theme } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PoemDetail from './pages/PoemDetail';
import Header from './components/Header';

const { Content } = Layout;

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#d4380d', // Volcano Red for a classic feel
                    fontFamily: '"Noto Serif SC", "PingFang SC", sans-serif',
                },
            }}
        >
            <BrowserRouter>
                <Layout style={{ minHeight: '100vh' }}>
                    <Header isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
                    <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/poem/:id" element={<PoemDetail />} />
                        </Routes>
                    </Content>
                </Layout>
            </BrowserRouter>
        </ConfigProvider>
    );
};

export default App;
