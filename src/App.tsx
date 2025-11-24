import { ConfigProvider, Layout, Typography, theme } from 'antd'
import { useState } from 'react'
import RubiksCube from './components/Cube/RubiksCube'

const { Header, Content, Footer } = Layout
const { Title } = Typography

function App() {
    const [isDark, setIsDark] = useState(true)

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px'
                }}>
                    <Title level={3} style={{ margin: 0, color: isDark ? '#fff' : 'inherit' }}>
                        3D Rubik's Cube
                    </Title>
                </Header>

                <Content style={{ position: 'relative', height: 'calc(100vh - 64px - 70px)' }}>
                    <RubiksCube />
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    Powered by React Three Fiber & Ant Design
                </Footer>
            </Layout>
        </ConfigProvider>
    )
}

export default App
