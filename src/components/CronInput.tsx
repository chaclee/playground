import { Input, Space, Typography } from 'antd'

const { Text } = Typography

interface CronInputProps {
  value: string
  onChange: (value: string) => void
}

const CronInput = ({ value, onChange }: CronInputProps) => {
  const fields = value.split(' ')
  const labels = ['分钟', '小时', '日期', '月份', '星期']

  const handleFieldChange = (index: number, newValue: string) => {
    const newFields = [...fields]
    newFields[index] = newValue
    while (newFields.length < 5) {
      newFields.push('*')
    }
    onChange(newFields.join(' '))
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space wrap style={{ width: '100%' }}>
        {labels.map((label, index) => (
          <Space key={index} direction="vertical" size="small">
            <Text type="secondary">{label}</Text>
            <Input
              value={fields[index] || '*'}
              onChange={(e) => handleFieldChange(index, e.target.value)}
              style={{ width: 100 }}
              placeholder="*"
            />
          </Space>
        ))}
      </Space>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="* * * * *"
        size="large"
        style={{ fontFamily: 'monospace' }}
      />
    </Space>
  )
}

export default CronInput
