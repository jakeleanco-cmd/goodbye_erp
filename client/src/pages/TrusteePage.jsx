import React, { useState, useEffect } from 'react'
import {
  Card, Button, Form, Input, Typography, Space, Tag, List,
  Avatar, Empty, message, Divider, Row, Col, Alert,
} from 'antd'
import {
  TeamOutlined, LinkOutlined, MailOutlined,
  CheckCircleOutlined, ClockCircleOutlined, LockOutlined,
} from '@ant-design/icons'
import api from '../api/axios'
import useAuthStore from '../stores/authStore'

const { Title, Text } = Typography

// 연결 상태에 따른 뱃지 색상/텍스트
const STATUS_MAP = {
  PENDING:   { color: 'orange',  label: '초대 대기 중' },
  ACCEPTED:  { color: 'blue',    label: '연결됨 (잠금)' },
  REQUESTED: { color: 'purple',  label: '활성화 요청 중' },
  ACTIVE:    { color: 'success', label: '활성화 완료' },
  REJECTED:  { color: 'error',   label: '거절됨' },
}

/**
 * 수속자 설정 및 연결 관리 페이지
 * - PARENT: 자녀 이메일로 초대 발송 및 연결 목록 확인
 * - CHILD: 받은 초대 수락 및 연결 목록 확인
 */
function TrusteePage() {
  const { user } = useAuthStore()
  const [connections, setConnections] = useState([])
  const [invites, setInvites]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [form] = Form.useForm()

  // 연결/초대 목록 조회
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trustees/my-connections')
      setConnections(data)
      // CHILD인 경우 받은 초대 목록도 조회
      if (user?.role === 'CHILD') {
        const { data: inviteData } = await api.get('/trustees/my-invites')
        setInvites(inviteData)
      }
    } catch {
      message.error('목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // [PARENT] 자녀 초대
  const handleInvite = async ({ inviteEmail }) => {
    try {
      await api.post('/trustees/invite', { inviteEmail })
      message.success(`${inviteEmail}으로 초대를 보냈습니다.`)
      form.resetFields()
      fetchData()
    } catch (err) {
      message.error(err.response?.data?.message || '초대에 실패했습니다.')
    }
  }

  // [CHILD] 초대 수락
  const handleAccept = async (id) => {
    try {
      await api.put(`/trustees/${id}/accept`)
      message.success('초대를 수락했습니다!')
      fetchData()
    } catch {
      message.error('수락에 실패했습니다.')
    }
  }

  return (
    <div>
      <Space align="center" style={{ marginBottom: 6 }}>
        <TeamOutlined style={{ fontSize: 22, color: '#4a6e8a' }} />
        <Title level={4} style={{ margin: 0 }}>
          {user?.role === 'PARENT' ? '수속자 설정' : '연결 관리'}
        </Title>
      </Space>
      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 24 }}>
        {user?.role === 'PARENT'
          ? '사후에 연락처를 전달받을 자녀를 초대하세요.'
          : '부모님의 초대를 수락하고 연결 상태를 확인하세요.'}
      </Text>

      {/* PARENT: 초대 폼 */}
      {user?.role === 'PARENT' && (
        <Card style={{ marginBottom: 24, background: '#f0f7f2', border: 'none', borderRadius: 14 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <MailOutlined style={{ marginRight: 8 }} />자녀 초대
          </Title>
          <Form form={form} layout="inline" onFinish={handleInvite}>
            <Form.Item
              name="inviteEmail"
              rules={[{ required: true, type: 'email', message: '올바른 이메일을 입력하세요.' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="자녀 이메일 주소 입력" prefix={<MailOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<LinkOutlined />}>
                초대 보내기
              </Button>
            </Form.Item>
          </Form>
          <Alert
            style={{ marginTop: 12 }}
            type="info"
            showIcon
            message="초대를 받은 자녀가 수락하면 연결이 생성됩니다. 평상시 자녀는 연락처를 볼 수 없습니다."
          />
        </Card>
      )}

      {/* CHILD: 받은 초대 */}
      {user?.role === 'CHILD' && invites.length > 0 && (
        <Card
          style={{ marginBottom: 24, borderColor: '#4a7c59', borderRadius: 14 }}
          title={<Space><CheckCircleOutlined style={{ color: '#4a7c59' }} /><span>받은 초대</span></Space>}
        >
          <List
            dataSource={invites}
            renderItem={(invite) => (
              <List.Item
                actions={[
                  <Button type="primary" size="small" onClick={() => handleAccept(invite._id)}>
                    수락
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<TeamOutlined />} style={{ background: '#4a7c59' }} />}
                  title={invite.parentId?.name}
                  description={invite.parentId?.email}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 연결 목록 */}
      <Title level={5} style={{ marginBottom: 12 }}>연결 목록</Title>
      {connections.length === 0 ? (
        <Empty
          description={
            user?.role === 'PARENT'
              ? '아직 초대한 자녀가 없습니다.'
              : '연결된 부모님 계정이 없습니다. 이메일로 받은 초대를 수락하세요.'
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {connections.map((conn) => {
            const status = STATUS_MAP[conn.status] || {}
            const counterpart = user?.role === 'PARENT' ? conn.childId : conn.parentId

            return (
              <Col xs={24} md={12} key={conn._id}>
                <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Avatar icon={<TeamOutlined />} style={{ background: '#4a6e8a' }} />
                      <div>
                        <Text strong>{counterpart?.name || conn.inviteEmail}</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                          {counterpart?.email || conn.inviteEmail}
                        </Text>
                      </div>
                    </Space>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Space>

                  {/* 잠금 상태 안내 */}
                  {conn.status === 'ACCEPTED' && user?.role === 'CHILD' && (
                    <Alert
                      style={{ marginTop: 12 }}
                      type="warning"
                      showIcon
                      icon={<LockOutlined />}
                      message="연락처가 잠겨 있습니다. '권한 활성화' 메뉴에서 요청을 보내세요."
                    />
                  )}
                  {conn.status === 'ACTIVE' && (
                    <Alert
                      style={{ marginTop: 12 }}
                      type="success"
                      showIcon
                      message="활성화되었습니다. 연락처 열람이 가능합니다."
                    />
                  )}
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </div>
  )
}

export default TrusteePage
