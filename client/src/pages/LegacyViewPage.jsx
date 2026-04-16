import React, { useState, useEffect } from 'react'
import { 
  Card, Typography, Space, Tabs, List, 
  Avatar, Tag, Empty, Grid, Row, Col, Alert,
  Divider, Skeleton
} from 'antd'
import { 
  ReadOutlined, MailOutlined, SolutionOutlined, 
  CarryOutOutlined, HeartFilled, LockOutlined,
  PaperClipOutlined, FilePdfOutlined, FileImageOutlined,
  UserOutlined
} from '@ant-design/icons'
import api from '../api/axios'

const { Title, Text, Paragraph } = Typography
const { useBreakpoint } = Grid

/**
 * 유언 및 가이드 열람 페이지 (CHILD 전용)
 * - 상속이 활성화된 부모님의 정보를 확인
 */
function LegacyViewPage() {
  const [activeConnections, setActiveConnections] = useState([])
  const [selectedParentId, setSelectedParentId] = useState(null)
  const [data, setData] = useState({ messages: [], guides: [], funeral: {} })
  const [loading, setLoading] = useState(false)
  const screens = useBreakpoint()

  // 1. 활성화된 연결 목록 조회
  const fetchConnections = async () => {
    try {
      const { data } = await api.get('/trustees/my-connections')
      const activeOnes = data.filter(c => c.status === 'ACTIVE')
      setActiveConnections(activeOnes)
      if (activeOnes.length > 0) {
        setSelectedParentId(activeOnes[0].parentId._id)
      }
    } catch {
      // message.error('연결 정보를 불러오지 못했습니다.')
    }
  }

  // 2. 선택된 부모님의 레거시 데이터 조회
  const fetchLegacyData = async (parentId) => {
    if (!parentId) return
    setLoading(true)
    try {
      const [msgRes, guideRes, funeralRes] = await Promise.all([
        api.get(`/legacy/messages?parentId=${parentId}`),
        api.get(`/legacy/guides?parentId=${parentId}`),
        api.get(`/legacy/funeral?parentId=${parentId}`)
      ])
      setData({
        messages: msgRes.data,
        guides: guideRes.data,
        funeral: funeralRes.data
      })
    } catch {
      // message.error('정보를 불러올 권한이 없거나 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  useEffect(() => {
    if (selectedParentId) fetchLegacyData(selectedParentId)
  }, [selectedParentId])

  const curParent = activeConnections.find(c => c.parentId._id === selectedParentId)?.parentId

  if (activeConnections.length === 0) {
    return (
      <Card style={{ borderRadius: 20, padding: '40px 0', textAlign: 'center' }}>
        <LockOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
        <Title level={4}>활성화된 정보가 없습니다.</Title>
        <Paragraph type="secondary">
          부모님으로부터 활성화 승인을 받거나, 증빙서류 관리자 승인이 완료된 후에만 열람 가능합니다.
        </Paragraph>
      </Card>
    )
  }

  return (
    <div className="page-fade-in">
      <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
        <Title level={4}>
          <ReadOutlined style={{ marginRight: 8, color: 'var(--primary)' }} />
          부모님의 마지막 유언 및 가이드
        </Title>
        <Text type="secondary">
          부모님이 당신과 소중한 분들을 위해 남기신 마지막 메시지와 준비 사항을 확인하세요.
        </Text>
      </Space>

      <Tabs 
        activeKey={selectedParentId} 
        onChange={setSelectedParentId}
        type="card"
        style={{ marginBottom: 20 }}
      >
        {activeConnections.map(c => (
          <Tabs.TabPane 
            tab={<Space><UserOutlined />{c.parentId.name}</Space>} 
            key={c.parentId._id} 
          />
        ))}
      </Tabs>

      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Row gutter={[24, 24]}>
          {/* 1. 장례 희망 사항 */}
          <Col xs={24} lg={12}>
            <Card 
              title={<Space><CarryOutOutlined style={{ color: '#8a4a4a' }} /><span>장례 희망 사항</span></Space>}
              style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            >
              {!data.funeral.userId ? (
                <Empty description="기록된 내용이 없습니다." />
              ) : (
                <div style={{ padding: '0 8px' }}>
                  <div style={{ marginBottom: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>종교 및 의식</Text>
                    <Title level={5} style={{ marginTop: 4 }}>{data.funeral.religion || '-'}</Title>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>선호하는 꽃</Text>
                    <Title level={5} style={{ marginTop: 4 }}>{data.funeral.flowers || '-'}</Title>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>기타 희망 사항</Text>
                    <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                      {data.funeral.additional || '-'}
                    </Paragraph>
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* 2. 자산 및 서류 가이드 */}
          <Col xs={24} lg={12}>
            <Card 
              title={<Space><SolutionOutlined style={{ color: '#4a6e8a' }} /><span>디지털 자산 & 서류 가이드</span></Space>}
              style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            >
              {data.guides.length === 0 ? (
                <Empty description="기록된 가이드가 없습니다." />
              ) : (
                <List
                  dataSource={data.guides}
                  renderItem={guide => (
                    <List.Item style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0' }}>
                      <Tag color="blue" style={{ marginBottom: 8 }}>{guide.category}</Tag>
                      <Title level={5} style={{ margin: 0, marginBottom: 8 }}>{guide.title}</Title>
                      <Paragraph style={{ color: '#666', fontSize: 14 }}>{guide.content}</Paragraph>
                      {guide.fileUrl && (
                        <div style={{ 
                          background: '#f9f9f9', padding: '8px 12px', borderRadius: 8, 
                          display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, width: '100%' 
                        }}>
                          {guide.fileName?.toLowerCase().endsWith('.pdf') ? <FilePdfOutlined /> : <FileImageOutlined />}
                          <Text type="secondary" ellipsis style={{ flex: 1 }}>{guide.fileName}</Text>
                          <a href={guide.fileUrl} target="_blank" rel="noreferrer">파일 열기</a>
                        </div>
                      )}
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* 3. 마지막 편지 (지정 대상자별) */}
          <Col xs={24}>
            <Card 
              title={<Space><MailOutlined style={{ color: 'var(--primary)' }} /><span>남긴 편지 목록</span></Space>}
              style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            >
              {data.messages.length === 0 ? (
                <Empty description="남긴 편지가 없습니다." />
              ) : (
                <Row gutter={[16, 16]}>
                  {data.messages.map(msg => (
                    <Col xs={24} md={12} key={msg._id}>
                      <Card 
                        bodyStyle={{ padding: 20 }} 
                        style={{ border: '1px solid #f0f7f2', borderRadius: 12, background: '#fcfdfc' }}
                      >
                        <Space style={{ marginBottom: 12 }}>
                          <Avatar icon={<UserOutlined />} style={{ background: 'var(--primary)' }} />
                          <div>
                            <Text strong>{msg.contactId.name}</Text>
                            <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{msg.contactId.phoneNumber}</Text>
                          </div>
                          <Tag style={{ marginLeft: 8 }}>{msg.contactId.group}</Tag>
                        </Space>
                        <Paragraph style={{ 
                          fontStyle: 'italic', 
                          color: '#444', 
                          background: '#fff', 
                          padding: '16px', 
                          borderRadius: 8, 
                          border: '1px solid #eee' 
                        }}>
                          "{msg.content}"
                        </Paragraph>
                        <Alert 
                          message="이 메시지는 지정된 연락처의 주인공에게만 공개해 주시기 바랍니다." 
                          type="info" 
                          showIcon 
                          style={{ fontSize: 11, padding: '4px 8px' }}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 40 }}>
        <HeartFilled style={{ fontSize: 24, color: 'var(--primary)', opacity: 0.3 }} />
        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>GoodBye - 사랑을 잇는 마지막 준비</div>
      </div>
    </div>
  )
}

export default LegacyViewPage
