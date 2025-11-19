import React, { useState, useMemo } from 'react';
import { Input, Row, Col, Typography, Card, Avatar, Empty } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { poems } from '../data/poems';
import PoemCard from '../components/PoemCard';

const { Title } = Typography;

const Home: React.FC = () => {
    const [searchText, setSearchText] = useState('');

    // Filter poems based on search text
    const filteredPoems = useMemo(() => {
        if (!searchText) return poems;
        const lowerText = searchText.toLowerCase();
        return poems.filter(poem =>
            poem.title.toLowerCase().includes(lowerText) ||
            poem.author.toLowerCase().includes(lowerText) ||
            poem.paragraphs.some(p => p.toLowerCase().includes(lowerText))
        );
    }, [searchText]);

    // Calculate top poets
    const topPoets = useMemo(() => {
        const poetCounts: Record<string, number> = {};
        poems.forEach(poem => {
            poetCounts[poem.author] = (poetCounts[poem.author] || 0) + 1;
        });

        return Object.entries(poetCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Search Section */}
            <div style={{ textAlign: 'center', marginBottom: 48, marginTop: 24 }}>
                <Title level={2} style={{ fontFamily: '"Ma Shan Zheng", cursive', marginBottom: 24 }}>
                    熟读唐诗三百首，不会作诗也会吟
                </Title>
                <Input.Search
                    placeholder="搜索诗名、作者或诗句..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    style={{ maxWidth: 600 }}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            {/* Top Poets Section - Only show when not searching */}
            {!searchText && (
                <div style={{ marginBottom: 48 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>诗人排行</Title>
                    <div
                        style={{
                            display: 'flex',
                            overflowX: 'auto',
                            paddingBottom: 16,
                            gap: 16,
                            scrollbarWidth: 'thin'
                        }}
                    >
                        {topPoets.map((poet, index) => (
                            <Card
                                key={poet.name}
                                hoverable
                                style={{ minWidth: 140, textAlign: 'center', flexShrink: 0 }}
                                onClick={() => setSearchText(poet.name)}
                            >
                                <Avatar
                                    size={64}
                                    icon={<UserOutlined />}
                                    style={{ marginBottom: 12, backgroundColor: index < 3 ? '#d4380d' : undefined }}
                                />
                                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{poet.name}</div>
                                <div style={{ color: '#888' }}>{poet.count} 首</div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Poems Grid */}
            <Title level={4} style={{ marginBottom: 16 }}>
                {searchText ? `搜索结果 (${filteredPoems.length})` : '精选诗词'}
            </Title>

            {filteredPoems.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {filteredPoems.map(poem => (
                        <Col xs={24} sm={12} md={8} lg={6} key={poem.id}>
                            <PoemCard poem={poem} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="未找到相关诗词" style={{ marginTop: 48 }} />
            )}
        </div>
    );
};

export default Home;
