import { useState, useEffect } from 'react'
import { ConfigProvider, Layout, Typography, Card, Space, Alert, Table, theme } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import cronstrue from 'cronstrue'
import CronInput from './components/CronInput'
import SchedulePreview from './components/SchedulePreview'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

interface ExampleItem {
  key: string
  expression: string
  description: string
}

function App() {
  const [cronExpression, setCronExpression] = useState<string>('* * * * *')
  const [humanReadable, setHumanReadable] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    try {
      const parts = cronExpression.trim().split(/\s+/)
      if (parts.length !== 5) {
        setError('Cron 表达式必须包含 5 个字段')
        setHumanReadable('')
        return
      }

      const description = cronstrue.toString(cronExpression, {
        locale: 'zh_CN',
        use24HourTimeFormat: true
      })
      setHumanReadable(description)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的 Cron 表达式')
      setHumanReadable('')
    }
  }, [cronExpression])

  const examples: ExampleItem[] = [
    { key: '1', expression: '* * * * *', description: '每分钟' },
    { key: '2', expression: '0 * * * *', description: '每小时' },
    { key: '3', expression: '0 0 * * *', description: '每天午夜' },
    { key: '4', expression: '0 0 * * 0', description: '每周日午夜' },
    { key: '5', expression: '0 0 1 * *', description: '每月 1 号午夜' },
    { key: '6', expression: '0 9 * * 1-5', description: '工作日上午 9 点' },
    { key: '7', expression: '*/15 * * * *', description: '每 15 分钟' },
    { key: '8', expression: '0 */2 * * *', description: '每 2 小时' },
    { key: '9', expression: '30 3 * * *', description: '每天凌晨 3:30' },
    { key: '10', expression: '0 0 1 1 *', description: '每年 1 月 1 日午夜' },
  ]

  const columns: ColumnsType<ExampleItem> = [
    {
      title: 'Cron 表达式',
      dataIndex: 'expression',
      key: 'expression',
      render: (text: string) => (
        <Text code copyable style={{ cursor: 'pointer' }} onClick={() => setCronExpression(text)}>
          {text}
        </Text>
      ),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{
          background: isDark ? '#141414' : '#001529',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            Cron 表达式生成器
          </Title>
          <Text
            style={{ color: '#fff', cursor: 'pointer' }}
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? '🌞' : '🌙'}
          </Text>
        </Header>

        <Content style={{ padding: '24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex' }}>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Title level={4}>输入 Cron 表达式</Title>
                  <Paragraph type="secondary">
                    标准格式: 分钟 小时 日期 月份 星期
                  </Paragraph>
                </div>

                <CronInput value={cronExpression} onChange={setCronExpression} />

                {error && (
                  <Alert message={error} type="error" showIcon />
                )}

                {humanReadable && (
                  <Alert
                    message="执行时间"
                    description={<Text strong style={{ fontSize: 16 }}>{humanReadable}</Text>}
                    type="success"
                    showIcon
                  />
                )}
              </Space>
            </Card>

            {humanReadable && <SchedulePreview cronExpression={cronExpression} />}

            <Card title="Cron 表达式格式说明">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Paragraph>
                  Cron 表达式由 5 个字段组成，用空格分隔：
                </Paragraph>
                <Paragraph>
                  <Text code>分钟(0-59) 小时(0-23) 日期(1-31) 月份(1-12) 星期(0-6)</Text>
                </Paragraph>
                <Paragraph strong>特殊字符：</Paragraph>
                <ul>
                  <li><Text code>*</Text> - 所有值</li>
                  <li><Text code>,</Text> - 列举多个值，如 1,3,5</li>
                  <li><Text code>-</Text> - 范围，如 1-5</li>
                  <li><Text code>/</Text> - 间隔，如 */15 表示每 15 个单位</li>
                </ul>
              </Space>
            </Card>

            <Card title="常用示例">
              <Table
                columns={columns}
                dataSource={examples}
                pagination={false}
                size="small"
              />
            </Card>
          </Space>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          Powered by WePie EE Team
        </Footer>
      </Layout>
    </ConfigProvider>
  )
}

export default App
