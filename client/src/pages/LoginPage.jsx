import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Divider, Space, message } from 'antd'
import { MailOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons'
import useAuthStore from '../stores/authStore'

const { Title, Text } = Typography

/**
 * 로그인 페이지
 * - 일반 이메일/비밀번호 로그인
 * - 소셜 로그인은 추후 카카오 SDK 연동 예정 (현재는 시뮬레이션 버튼 표시)
 */
function LoginPage() {
  const { login, socialLogin, loading } = useAuthStore()
  const navigate = useNavigate()

  const onFinish = async ({ email, password }) => {
    const result = await login(email, password)
    if (result.success) {
      navigate('/')
    } else {
      message.error(result.message)
    }
  }

  // 소셜 로그인 시뮬레이션 (카카오 SDK 연동 전 테스트용)
  const handleKakaoLogin = async () => {
    const result = await socialLogin({
      socialId: 'kakao_test_001',
      provider: 'kakao',
      name: '카카오 사용자',
      email: 'kakao_test@goodbye.social',
      role: 'PARENT',
    })
    if (result.success) navigate('/')
    else message.error(result.message)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2e4a35 0%, #4a7c59 50%, #c9a96e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <Card style={{ width: '100%', maxWidth: 400, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <HeartOutlined style={{ fontSize: 40, color: '#4a7c59' }} />
          <Title level={2} style={{ margin: '8px 0 4px', color: '#2e4a35', letterSpacing: '-0.5px' }}>GoodBye</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>사랑하는 분을 위한 따뜻한 준비</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: '올바른 이메일을 입력해주세요.' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="이메일" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontWeight: 600 }}
            >
              로그인
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '4px 0 12px', color: '#999', fontSize: 12 }}>또는</Divider>

        {/* 소셜 로그인 버튼 (카카오 시뮬레이션) */}
        <Button
          block
          onClick={handleKakaoLogin}
          loading={loading}
          style={{
            height: 44,
            background: '#FEE500',
            border: 'none',
            color: '#191919',
            fontWeight: 600,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          카카오로 계속하기
        </Button>

        <Button
          block
          style={{ height: 44, border: '1px solid #e0e0e0', fontWeight: 500, borderRadius: 8 }}
          disabled
        >
          구글로 계속하기 (준비 중)
        </Button>

        <Divider style={{ margin: '16px 0' }} />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">계정이 없으신가요? </Text>
          <Link to="/register" style={{ color: '#4a7c59', fontWeight: 500 }}>회원가입</Link>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
