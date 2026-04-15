import React from 'react'
import { Card, Row, Col, Typography, Tag, Space, Button } from 'antd'
import {
  ContactsOutlined,
  TeamOutlined,
  FileTextOutlined,
  HeartFilled,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import heroImage from '../assets/hero_premium.png'

const { Title, Text, Paragraph } = Typography

/**
 * 대시보드 홈 페이지
 * - Flexible Layout 적용 (반응형 그리드)
 * - Premium UI: 이미지 배너, 글래스모피즘 카드
 */
function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const parentCards = [
    {
      icon: <ContactsOutlined style={{ fontSize: 28, color: 'var(--primary)' }} />,
      title: '연락처 관리',
      desc: '소중한 분들의 연락처를 그룹별로 안전하게 정리하세요.',
      link: '/contacts',
      accent: 'var(--primary)',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 28, color: '#4a6e8a' }} />,
      title: '수속자 설정',
      desc: '사후에 연락처를 열람할 자녀를 지정하고 초대합니다.',
      link: '/trustee',
      accent: '#4a6e8a',
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#8a4a4a' }} />,
      title: '부고 문자',
      desc: '준비된 리스트를 기반으로 부고 알림을 생성합니다.',
      link: '/obituary',
      accent: '#8a4a4a',
    },
  ]

  const childCards = [
    {
      icon: <TeamOutlined style={{ fontSize: 28, color: '#4a6e8a' }} />,
      title: '연결 관리',
      desc: '부모님의 초대를 확인하고 수락하여 연결을 완료하세요.',
      link: '/trustee',
      accent: '#4a6e8a',
    },
    {
      icon: <ContactsOutlined style={{ fontSize: 28, color: 'var(--primary)' }} />,
      title: '권한 활성화',
      desc: '증빙서류를 제출하고 부모님의 연락처 열람을 요청하세요.',
      link: '/unlock',
      accent: 'var(--primary)',
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#8a4a4a' }} />,
      title: '부고 문자',
      desc: '권한 승인 후 연락처를 기반으로 부고를 전송합니다.',
      link: '/obituary',
      accent: '#8a4a4a',
    },
  ]

  const cards = user?.role === 'PARENT' ? parentCards : childCards

  return (
    <div className="page-fade-in">
      {/* 프리미엄 히어로 배너 */}
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <Row align="middle">
          <Col xs={24} md={14} style={{ padding: '40px 48px' }}>
            <Space direction="vertical" size={16}>
              <Tag color="rgba(255,255,255,0.2)" style={{ borderRadius: 20, color: '#fff', border: 'none' }}>
                {user?.role === 'PARENT' ? '부모님 계정' : '자녀 계정'}
              </Tag>
              <div>
                <Title level={2} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit' }}>
                  어서오세요, {user?.name}님
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                  {user?.role === 'PARENT'
                    ? '가족을 위한 따뜻한 배려, GoodBye가 함께 준비하겠습니다.'
                    : '부모님의 남은 발자취를 소중히 이어받을 수 있도록 돕습니다.'}
                </Text>
              </div>
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate(user?.role === 'PARENT' ? '/contacts' : '/trustee')}
                style={{ 
                  background: '#fff', 
                  color: 'var(--primary-dark)', 
                  fontWeight: 600,
                  borderRadius: 12,
                  boxShadow: 'none',
                  border: 'none',
                  marginTop: 8
                }}
              >
                시작하기 <ArrowRightOutlined />
              </Button>
            </Space>
          </Col>
          <Col xs={0} md={10} style={{ textAlign: 'right', paddingRight: 0 }}>
            <img 
              src={heroImage} 
              alt="Premium Hero" 
              style={{ 
                height: 320, 
                objectFit: 'cover', 
                width: '100%', 
                borderTopLeftRadius: 100, 
                borderBottomLeftRadius: 100,
                opacity: 0.9
              }} 
            />
          </Col>
        </Row>
      </Card>

      {/* 대시보드 주요 기능 섹션 */}
      <div style={{ marginBottom: 24, padding: '0 4px' }}>
        <Title level={4} style={{ marginBottom: 4 }}>무엇을 도와드릴까요?</Title>
        <Text type="secondary">꼭 필요한 기능을 쉽고 빠르게 이용해 보세요.</Text>
      </div>

      <Row gutter={[24, 24]}>
        {cards.map((card, index) => (
          <Col xs={24} sm={12} md={8} key={card.title}>
            <Card
              hoverable
              onClick={() => navigate(card.link)}
              style={{ 
                height: '100%',
                borderRadius: 20,
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: 28 }}
            >
              <div style={{ 
                background: card.accent + '15', // 15% 투명도
                width: 56,
                height: 56,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                {card.icon}
              </div>
              <Title level={4} style={{ marginBottom: 12 }}>{card.title}</Title>
              <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6, display: 'block', minHeight: 44 }}>
                {card.desc}
              </Text>
              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Button type="text" icon={<ArrowRightOutlined />} style={{ color: card.accent }}>
                  이동하기
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default DashboardPage
