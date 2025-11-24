import { Card, Timeline, Typography } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

const { Text } = Typography

interface SchedulePreviewProps {
  cronExpression: string
}

const SchedulePreview = ({ cronExpression }: SchedulePreviewProps) => {
  const [nextRuns, setNextRuns] = useState<string[]>([])

  useEffect(() => {
    try {
      const runs = calculateNextRuns(cronExpression, 10)
      setNextRuns(runs)
    } catch (err) {
      setNextRuns([])
    }
  }, [cronExpression])

  const calculateNextRuns = (cron: string, count: number): string[] => {
    const parts = cron.split(' ')
    if (parts.length !== 5) return []

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
    const results: string[] = []
    const now = new Date()
    let currentDate = new Date(now)

    // 简化版本：只处理基本情况
    while (results.length < count) {
      currentDate.setMinutes(currentDate.getMinutes() + 1)

      if (matchesCron(currentDate, minute, hour, dayOfMonth, month, dayOfWeek)) {
        results.push(formatDate(currentDate))
      }

      // 防止无限循环
      if (currentDate.getTime() - now.getTime() > 1000 * 60 * 60 * 24 * 365) {
        break
      }
    }

    return results
  }

  const matchesCron = (
    date: Date,
    minute: string,
    hour: string,
    dayOfMonth: string,
    month: string,
    dayOfWeek: string
  ): boolean => {
    const m = date.getMinutes()
    const h = date.getHours()
    const dom = date.getDate()
    const mon = date.getMonth() + 1
    const dow = date.getDay()

    return (
      matchField(m, minute) &&
      matchField(h, hour) &&
      matchField(dom, dayOfMonth) &&
      matchField(mon, month) &&
      matchField(dow, dayOfWeek)
    )
  }

  const matchField = (value: number, pattern: string): boolean => {
    if (pattern === '*') return true

    // 处理步长 */n
    if (pattern.startsWith('*/')) {
      const step = parseInt(pattern.slice(2))
      return value % step === 0
    }

    // 处理范围+步长 n-m/step
    if (pattern.includes('/') && pattern.includes('-')) {
      const [range, stepStr] = pattern.split('/')
      const [start, end] = range.split('-').map(Number)
      const step = parseInt(stepStr)

      if (value < start || value > end) return false
      return (value - start) % step === 0
    }

    // 处理范围 n-m
    if (pattern.includes('-')) {
      const [start, end] = pattern.split('-').map(Number)
      return value >= start && value <= end
    }

    // 处理列表 n,m,o
    if (pattern.includes(',')) {
      const values = pattern.split(',').map(Number)
      return values.includes(value)
    }

    // 处理单个值
    return value === parseInt(pattern)
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[date.getDay()]

    return `${year}-${month}-${day} ${hour}:${minute} ${weekday}`
  }

  if (nextRuns.length === 0) {
    return null
  }

  return (
    <Card title="接下来的执行时间">
      <Timeline
        items={nextRuns.map((time, index) => ({
          children: <Text>{time}</Text>,
          color: index === 0 ? 'green' : 'blue',
          dot: index === 0 ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : undefined,
        }))}
      />
    </Card>
  )
}

export default SchedulePreview
