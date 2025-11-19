import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Poem } from '../data/poems';

const { Title, Paragraph, Text } = Typography;

interface PoemCardProps {
    poem: Poem;
}

const PoemCard: React.FC<PoemCardProps> = ({ poem }) => {
    const navigate = useNavigate();

    return (
        <Card
            hoverable
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            onClick={() => navigate(`/poem/${poem.id}`)}
            className="poem-card"
        >
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Title level={4} style={{ margin: 0, fontFamily: '"Noto Serif SC", serif' }}>
                    {poem.title}
                </Title>
                <Tag color="gold">{poem.dynasty}</Tag>
            </div>

            <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                {poem.author}
            </Text>

            <div style={{ flex: 1 }}>
                {poem.paragraphs.slice(0, 2).map((line, index) => (
                    <Paragraph
                        key={index}
                        style={{
                            marginBottom: 4,
                            fontFamily: '"Noto Serif SC", serif',
                            fontSize: '1.1em',
                            color: 'var(--ant-color-text-secondary)'
                        }}
                    >
                        {line}
                    </Paragraph>
                ))}
                {poem.paragraphs.length > 2 && (
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>...</Text>
                )}
            </div>
        </Card>
    );
};

export default PoemCard;
