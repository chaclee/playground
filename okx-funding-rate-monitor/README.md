# OKX 永续合约资金费率监控仪表盘

实时追踪 OKX USDT 保证金永续合约的资金费率，帮助发现高收益套利机会。

## 功能特性

✅ **实时监控** - 自动获取 300+ 个 USDT 永续合约的资金费率数据  
✅ **智能计算** - 实时计算年化收益率、溢价率、结算倒计时  
✅ **灵活排序** - 支持按任意列排序，快速找到套利机会  
✅ **自动刷新** - 每 60 秒自动更新数据  
✅ **高亮显示** - 年化 >50% 橙色，>100% 红色加粗  
✅ **一键复制** - 点击合约代码快速复制  
✅ **深色模式** - 默认深色主题，跟随系统设置  
✅ **响应式设计** - 支持桌面和移动端访问  

## 技术栈

- **React 18** - 现代化 React 框架
- **TypeScript** - 类型安全
- **Vite** - 极速构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **React Query** - 强大的数据获取和缓存
- **Lucide React** - 精美的图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:3000` 运行。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
okx-funding-rate-monitor/
├── src/
│   ├── components/          # React 组件
│   │   ├── FundingRateTable.tsx    # 资金费率表格
│   │   ├── LoadingSkeleton.tsx     # 加载骨架屏
│   │   └── ErrorMessage.tsx        # 错误提示
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useFundingRates.ts      # 资金费率数据查询
│   │   └── useCountdown.ts         # 倒计时逻辑
│   ├── services/            # API 服务
│   │   └── okx-api.ts               # OKX API 封装
│   ├── types/               # TypeScript 类型定义
│   │   └── okx.ts                   # OKX 数据类型
│   ├── utils/               # 工具函数
│   │   └── calculations.ts          # 计算和格式化工具
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── index.html               # HTML 模板
├── package.json             # 项目配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # 项目文档
```

## 数据说明

### OKX API 接口

项目使用 OKX V5 公共 API（无需 API Key）：

1. **获取合约列表**
   ```
   GET https://www.okx.com/api/v5/public/instruments?instType=SWAP
   ```

2. **获取资金费率**
   ```
   GET https://www.okx.com/api/v5/public/funding-rate?instId={instId}
   ```

3. **获取标记价格**
   ```
   GET https://www.okx.com/api/v5/public/mark-price?instType=SWAP&instId={instId}
   ```

### 计算公式

- **年化收益率** = 当前资金费率 × 3 × 365 × 100
- **溢价率** = (标记价格 - 指数价格) / 指数价格 × 100%

## 高亮规则

- 🟢 **绿色** - 正资金费率（多头支付空头）
- 🔴 **红色** - 负资金费率（空头支付多头）
- 🟠 **橙色** - 年化收益率 > 50%
- 🔴 **红色加粗** - 年化收益率 > 100%

## 注意事项

1. 数据仅供参考，不构成投资建议
2. 资金费率每 8 小时结算一次
3. 实际套利需考虑交易手续费、滑点等成本
4. API 请求频率限制：批量请求采用分批处理，避免触发限流

## 后续扩展方向

- [ ] WebSocket 实时推送
- [ ] 资金费率历史趋势图表
- [ ] 套利收益计算器
- [ ] 邮件/webhook 报警提醒
- [ ] 多交易所对比
- [ ] 用户自定义筛选条件
- [ ] 收藏夹功能

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
