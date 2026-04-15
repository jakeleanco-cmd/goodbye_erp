import React, { useState, useEffect } from 'react'
import {
  Card, Form, Input, Button, Select, Typography, Space, Tag,
  Divider, Alert, Row, Col, message, Tabs, Empty,
} from 'antd'
import {
  FileTextOutlined, CopyOutlined, TeamOutlined,
} from '@ant-design/icons'
import api from '../api/axios'
import useAuthStore from '../stores/authStore'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const GROUP_COLORS = {
  '가족': 'red', '친척': 'volcano', '고향친구': 'orange',
  '직장': 'blue', '종교': 'purple', '지인': 'green', '기타': 'default',
}

/**
 * 부고 문자 템플릿 생성 페이지
 * - PARENT: 본인 연락처 기반으로 템플릿 생성
 * - CHILD: 활성화된 부모님 계정의 연락처 기반으로 템플릿 생성
 */
function ObituaryPage() {
  const { user } = useAuthStore()
  const [connections, setConnections] = useState([]) // CHILD용 활성화된 연결 목록
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [templates, setTemplates] = useState(null) // 생성된 템플릿 맵
  const [groupSummary, setGroupSummary] = useState([])
  const [generating, setGenerating] = useState(false)
  const [form] = Form.useForm()

  // CHILD의 경우 활성화된 연결 목록 조회
  useEffect(() => {
    if (user?.role === 'CHILD') {
      api.get('/trustees/my-connections')
        .then(({ data }) => setConnections(data.filter((c) => c.status === 'ACTIVE')))
        .catch(() => message.error('연결 목록을 불러오지 못했습니다.'))
    }
  }, [])

  const onGenerate = async (values) => {
    setGenerating(true)
    try {
      const payload = {
        funeralInfo: values,
        connectionId: selectedConnection || undefined,
      }
      const { data } = await api.post('/obituary/template', payload)
      setTemplates(data.templates)
      setGroupSummary(data.groupSummary)
      message.success('부고 문자 템플릿이 생성되었습니다!')
    } catch (err) {
      message.error(err.response?.data?.message || '템플릿 생성에 실패했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  // 클립보드 복사
  const handleCopy = (text, group) => {
    navigator.clipboard.writeText(text)
      .then(() => message.success(`'${group}' 부고 문자가 복사되었습니다!`))
      .catch(() => message.error('복사에 실패했습니다.'))
  }

  return (
    <div>
      <Space align="center" style={{ marginBottom: 6 }}>
        <FileTextOutlined style={{ fontSize: 22, color: '#8a4a4a' }} />
        <Title level={4} style={{ margin: 0 }}>부고 문자 템플릿</Title>
      </Space>
      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 24 }}>
        장례식장 정보를 입력하면 그룹별 맞춤 부고 문자를 자동으로 생성합니다.
      </Text>

      {/* CHILD: 활성화된 연결 선택 */}
      {user?.role === 'CHILD' && (
        <Card style={{ marginBottom: 20, background: '#f8f4f0', border: 'none', borderRadius: 12 }}>
          <Form layout="vertical">
            <Form.Item label="부모님 계정 선택" style={{ marginBottom: 0 }}>
              {connections.length === 0 ? (
                <Alert
                  type="warning"
                  showIcon
                  message="활성화된 연결이 없습니다. '권한 활성화' 메뉴에서 먼저 승인을 받으세요."
                />
              ) : (
                <Select
                  placeholder="연락처를 불러올 부모님 계정을 선택하세요"
                  onChange={setSelectedConnection}
                  style={{ width: '100%' }}
                >
                  {connections.map((c) => (
                    <Option key={c._id} value={c._id}>
                      <Space>
                        <TeamOutlined />
                        {c.parentId?.name} ({c.parentId?.email})
                      </Space>
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 장례식장 정보 입력 폼 */}
      <Card style={{ marginBottom: 24, borderRadius: 14 }} title="장례식장 정보 입력">
        <Form form={form} layout="vertical" onFinish={onGenerate}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="deceasedName" label="고인 성함" rules={[{ required: true, message: '고인 성함을 입력하세요.' }]}>
                <Input placeholder="홍길동" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="chiefMourner" label="상주 (대표 연락처)" rules={[{ required: true, message: '상주를 입력하세요.' }]}>
                <Input placeholder="장남 홍철수" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="funeralHall" label="빈소 (장례식장명)" rules={[{ required: true, message: '빈소를 입력하세요.' }]}>
                <Input placeholder="서울삼성병원 장례식장 1호실" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="location" label="위치 (주소)" rules={[{ required: true, message: '주소를 입력하세요.' }]}>
                <Input placeholder="서울시 강남구 일원로 81" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="time" label="발인 일시" rules={[{ required: true, message: '발인 일시를 입력하세요.' }]}>
                <Input placeholder="2026년 4월 17일 (금) 오전 9시" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="bankAccount" label="조의금 계좌 (선택)">
                <Input placeholder="국민은행 123-456-789012 홍철수" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={generating}
              icon={<FileTextOutlined />}
              disabled={user?.role === 'CHILD' && !selectedConnection}
            >
              부고 문자 생성하기
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 생성된 템플릿 */}
      {templates && (
        <div>
          <Space style={{ marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>생성된 부고 문자</Title>
            <Space wrap>
              {groupSummary.map(({ group, count }) => (
                <Tag key={group} color={GROUP_COLORS[group]}>{group} {count}명</Tag>
              ))}
            </Space>
          </Space>

          <Tabs
            type="card"
            items={Object.entries(templates).map(([group, text]) => ({
              key: group,
              label: (
                <Space>
                  <Tag color={GROUP_COLORS[group]} style={{ margin: 0 }}>{group}</Tag>
                </Space>
              ),
              children: (
                <Card
                  extra={
                    <Button
                      type="primary"
                      ghost
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(text, group)}
                    >
                      복사
                    </Button>
                  }
                  style={{ borderTopLeftRadius: 0 }}
                >
                  <Paragraph
                    style={{
                      background: '#f9f6f0',
                      padding: 16,
                      borderRadius: 8,
                      whiteSpace: 'pre-line',
                      fontFamily: 'inherit',
                      lineHeight: 1.8,
                      fontSize: 14,
                    }}
                  >
                    {text}
                  </Paragraph>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    * 복사 후 직접 문자메시지 앱에 붙여넣기 하여 발송하세요.
                  </Text>
                </Card>
              ),
            }))}
          />
        </div>
      )}
    </div>
  )
}

export default ObituaryPage
