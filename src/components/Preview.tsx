import { forwardRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

interface PreviewProps {
    content: string;
    isDarkMode?: boolean;
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, isDarkMode = true }, ref) => {
    useEffect(() => {
        // Remove existing highlight.js theme
        const existingLink = document.getElementById('hljs-theme');
        if (existingLink) {
            existingLink.remove();
        }

        // Add new theme based on mode
        const link = document.createElement('link');
        link.id = 'hljs-theme';
        link.rel = 'stylesheet';
        link.href = isDarkMode
            ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai.min.css'
            : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css';
        document.head.appendChild(link);

        return () => {
            const linkToRemove = document.getElementById('hljs-theme');
            if (linkToRemove) {
                linkToRemove.remove();
            }
        };
    }, [isDarkMode]);

    useEffect(() => {
        // Add line numbers to code blocks
        const preBlocks = document.querySelectorAll('.preview-content pre');
        preBlocks.forEach((pre) => {
            // Skip if already processed
            if (pre.getAttribute('data-line-numbers') === 'true') {
                return;
            }

            const code = pre.querySelector('code');
            if (!code) return;

            // Count lines based on text content
            const text = code.textContent || '';
            const lines = text.split('\n');
            const lineCount = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;

            // Create line numbers container
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'line-numbers';
            lineNumbers.setAttribute('aria-hidden', 'true');

            // Add line numbers
            for (let i = 1; i <= lineCount; i++) {
                const lineNumber = document.createElement('span');
                lineNumber.textContent = String(i);
                lineNumbers.appendChild(lineNumber);
            }

            // Wrap code block with line numbers
            (pre as HTMLElement).style.display = 'flex';
            pre.insertBefore(lineNumbers, code);
            pre.setAttribute('data-line-numbers', 'true');
        });
    }, [content]);

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
            <div style={{ maxWidth: '800px', margin: '0 auto' }} className="preview-content">
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
