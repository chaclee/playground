/**
 * 加载骨架屏组件
 */
export function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            {/* 表头 */}
            <div className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                <div className="grid grid-cols-8 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>

            {/* 表格行 */}
            {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="bg-gray-800/30 rounded-lg p-4 animate-pulse">
                    <div className="grid grid-cols-8 gap-4">
                        {[...Array(8)].map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className="h-4 bg-gray-700/50 rounded"
                                style={{
                                    animationDelay: `${(rowIndex * 8 + colIndex) * 50}ms`,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
