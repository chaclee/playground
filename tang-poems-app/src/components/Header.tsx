import React from 'react';
import { Layout, Switch, Typography, Space, Button } from 'antd';
import { BulbOutlined, BulbFilled, GithubOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
    const navigate = useNavigate();

    return (
        <AntHeader
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: isDarkMode ? '#141414' : '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                zIndex: 10,
                position: 'sticky',
                top: 0,
            }}
        >
            <div
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <div style={{
                    width: 32,
                    height: 32,
                    background: '#d4380d',
                    borderRadius: 4,
                    marginRight: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontFamily: '"Ma Shan Zheng", cursive'
                }}>
                    唐
                </div>
                <Title level={4} style={{ margin: 0, fontFamily: '"Ma Shan Zheng", cursive' }}>
                    唐诗三百首
                </Title>
            </div>

            <Space>
                <Switch
                    checkedChildren={<BulbFilled />}
                    unCheckedChildren={<BulbOutlined />}
                    checked={isDarkMode}
                    onChange={toggleTheme}
                />
                <Button
                    type="text"
                    icon={<GithubOutlined />}
                    href="https://github.com"
                    target="_blank"
                />
            </Space>
        </AntHeader>
    );
};

export default Header;
