import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

/**
 * 错误提示组件
 */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
                <AlertCircle size={32} />
                <span className="text-lg font-medium">加载失败</span>
            </div>

            <p className="text-gray-400 text-center max-w-md">
                {message}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 
                     text-white rounded-lg transition-colors duration-200"
                >
                    <RefreshCw size={18} />
                    <span>重试</span>
                </button>
            )}
        </div>
    );
}
