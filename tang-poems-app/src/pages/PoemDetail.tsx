import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Switch, Collapse, Divider, message, Tooltip } from 'antd';
import {
    ArrowLeftOutlined,
    SoundOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined
} from '@ant-design/icons';
import { poems } from '../data/poems';

const { Title, Paragraph, Text } = Typography;

const PoemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showPinyin, setShowPinyin] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const poem = poems.find(p => p.id === Number(id));

    useEffect(() => {
        if (poem) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorite(favorites.includes(poem.id));
        }
    }, [poem]);

    const toggleFavorite = () => {
        if (!poem) return;
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavorites;
        if (favorites.includes(poem.id)) {
            newFavorites = favorites.filter((fid: number) => fid !== poem.id);
            setIsFavorite(false);
            message.success('已取消收藏');
        } else {
            newFavorites = [...favorites, poem.id];
            setIsFavorite(true);
            message.success('已添加到收藏');
        }
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const handleSpeak = () => {
        if (!poem) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const text = `${poem.title}。${poem.author}。${poem.paragraphs.join('。')}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    if (!poem) {
        return (
            <div style={{ textAlign: 'center', marginTop: 100 }}>
                <Title level={3}>未找到该诗词</Title>
                <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                style={{ marginBottom: 24 }}
            >
                返回列表
            </Button>

            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Title level={2} style={{ fontFamily: '"Noto Serif SC", serif', marginBottom: 16 }}>
                    {poem.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 18 }}>
                    [{poem.dynasty}] {poem.author}
                </Text>
            </div>

            <div style={{
                textAlign: 'center',
                marginBottom: 48,
                fontSize: 24,
                lineHeight: 2,
                fontFamily: '"Noto Serif SC", "KaiTi", serif'
            }}>
                {poem.paragraphs.map((line, index) => {
                    // Simple pinyin mapping if available, otherwise just text
                    // Note: Real pinyin mapping requires complex logic or pre-processed data structure
                    // Here we assume poem.pinyin aligns with poem.paragraphs line by line
                    const pinyinLine = poem.pinyin ? poem.pinyin[index] : '';

                    return (
                        <div key={index} style={{ marginBottom: 16 }}>
                            {showPinyin && pinyinLine ? (
                                // Render ruby for the whole line? 
                                // Ideally we need char-by-char mapping. 
                                // For simplicity in this static demo, we just show pinyin above the line or use a simple approach.
                                // Since we don't have char-level mapping in the data structure provided in the prompt (it was just string[]),
                                // we will just display the pinyin line above the text line if enabled.
                                <div style={{ fontSize: 16, color: '#888', marginBottom: -8 }}>{pinyinLine}</div>
                            ) : null}
                            <div>{line}</div>
                        </div>
                    );
                })}
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48 }}>
                <Space align="center">
                    <span>拼音</span>
                    <Switch checked={showPinyin} onChange={setShowPinyin} />
                </Space>

                <Tooltip title={isSpeaking ? "停止朗读" : "朗读全诗"}>
                    <Button
                        shape="circle"
                        icon={<SoundOutlined spin={isSpeaking} />}
                        size="large"
                        onClick={handleSpeak}
                        type={isSpeaking ? "primary" : "default"}
                    />
                </Tooltip>

                <Tooltip title={isFavorite ? "取消收藏" : "收藏"}>
                    <Button
                        shape="circle"
                        icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                        size="large"
                        onClick={toggleFavorite}
                    />
                </Tooltip>

                <Tooltip title="分享">
                    <Button
                        shape="circle"
                        icon={<ShareAltOutlined />}
                        size="large"
                        onClick={() => {
                            navigator.clipboard.writeText(`${poem.title} - ${poem.author}\n${window.location.href}`);
                            message.success('链接已复制');
                        }}
                    />
                </Tooltip>
            </div>

            <Collapse
                defaultActiveKey={['1']}
                items={[
                    {
                        key: '1',
                        label: '译文',
                        children: <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>{poem.translation || '暂无译文'}</Paragraph>,
                    },
                    {
                        key: '2',
                        label: '注释与赏析',
                        children: <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>{poem.notes || '暂无注释'}</Paragraph>,
                    },
                ]}
            />
        </div>
    );
};

export default PoemDetail;
