import React from 'react'
import { Card, Row, Col, Typography, Tag, Space } from 'antd'
import {
  ContactsOutlined,
  TeamOutlined,
  FileTextOutlined,
  HeartFilled,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const { Title, Text, Paragraph } = Typography

/**
 * 대시보드 홈 페이지
 * - 역할에 따라 안내 카드를 다르게 표시
 */
function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const parentCards = [
    {
      icon: <ContactsOutlined style={{ fontSize: 28, color: '#4a7c59' }} />,
      title: '연락처 관리',
      desc: '가족, 친구, 직장 등 소중한 분들의 연락처를 그룹으로 정리하세요.',
      link: '/contacts',
      bg: '#f0f7f2',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 28, color: '#4a6e8a' }} />,
      title: '수속자 설정',
      desc: '사후에 연락처 목록을 열람할 자녀를 지정하고 초대하세요.',
      link: '/trustee',
      bg: '#f0f4f8',
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#8a4a4a' }} />,
      title: '부고 문자',
      desc: '부고 알림 문자를 그룹별로 자동 생성하고 복사하세요.',
      link: '/obituary',
      bg: '#f8f4f0',
    },
  ]

  const childCards = [
    {
      icon: <TeamOutlined style={{ fontSize: 28, color: '#4a6e8a' }} />,
      title: '연결 관리',
      desc: '부모님의 초대를 확인하고 수락하세요.',
      link: '/trustee',
      bg: '#f0f4f8',
    },
    {
      icon: <ContactsOutlined style={{ fontSize: 28, color: '#4a7c59' }} />,
      title: '권한 활성화',
      desc: '증빙서류를 업로드하고 연락처 열람을 요청하세요.',
      link: '/unlock',
      bg: '#f0f7f2',
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#8a4a4a' }} />,
      title: '부고 문자',
      desc: '활성화 후 연락처를 기반으로 부고 문자를 생성하세요.',
      link: '/obituary',
      bg: '#f8f4f0',
    },
  ]

  const cards = user?.role === 'PARENT' ? parentCards : childCards

  return (
    <div>
      {/* 환영 배너 */}
      <div style={{
        background: 'linear-gradient(120deg, #2e4a35, #4a7c59)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 28,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          right: -20,
          top: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <HeartFilled style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }} />
        <Title level={3} style={{ color: '#fff', margin: '4px 0 8px' }}>
          안녕하세요, {user?.name}님 👋
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          {user?.role === 'PARENT'
            ? '사랑하는 가족을 위해 미리 준비하는 따뜻한 마음에 감사드립니다.'
            : '부모님의 뜻을 이어받아 소중한 분들께 전달하는 역할을 도와드립니다.'}
        </Text>
        <Tag
          color="success"
          style={{ marginTop: 12, borderRadius: 20 }}
        >
          {user?.role === 'PARENT' ? '부모님 계정' : '자녀 계정'}
        </Tag>
      </div>

      {/* 기능 카드 */}
      <Title level={5} style={{ marginBottom: 16, color: '#555' }}>주요 기능</Title>
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} md={8} key={card.title}>
            <Card
              hoverable
              onClick={() => navigate(card.link)}
              style={{ background: card.bg, border: 'none', borderRadius: 14, cursor: 'pointer' }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" size={8}>
                {card.icon}
                <Title level={5} style={{ margin: 0 }}>{card.title}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>{card.desc}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default DashboardPage
