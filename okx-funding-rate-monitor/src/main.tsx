import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// 创建 QueryClient 实例
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000, // 30秒内数据被认为是新鲜的
            gcTime: 5 * 60 * 1000, // 缓存5分钟
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            retry: 3,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
)
