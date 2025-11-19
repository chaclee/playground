import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Code highlight style

interface PreviewProps {
    content: string;
    isDarkMode?: boolean;
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, isDarkMode = true }, ref) => {
    return (
        <div
            ref={ref}
            style={{ 
                height: '100%',
                width: '100%',
                overflow: 'auto',
                padding: '24px',
                background: isDarkMode ? '#0d1117' : '#ffffff',
                color: isDarkMode ? '#e6edf3' : '#24292f'
            }}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <ReactMarkdown
                    className="markdown-body"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
});

Preview.displayName = 'Preview';
