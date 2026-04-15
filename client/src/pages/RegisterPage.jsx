import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Divider, Space, message, Select, Alert } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined, HeartOutlined } from '@ant-design/icons'
import useAuthStore from '../stores/authStore'

const { Title, Text } = Typography
const { Option } = Select

/**
 * 회원가입 페이지
 * - 이름, 이메일, 비밀번호, 역할(PARENT/CHILD), 전화번호
 */
function RegisterPage() {
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    const result = await register(values)
    if (result.success) {
      message.success('회원가입이 완료되었습니다!')
      navigate('/')
    } else {
      message.error(result.message)
    }
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
      <Card style={{ width: '100%', maxWidth: 440, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <HeartOutlined style={{ fontSize: 36, color: '#4a7c59' }} />
          <Title level={3} style={{ margin: '8px 0 4px', color: '#2e4a35' }}>GoodBye</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>사랑하는 분을 위한 준비를 시작하세요</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력해주세요.' }]}>
            <Input prefix={<UserOutlined />} placeholder="홍길동" />
          </Form.Item>

          <Form.Item
            name="email"
            label="이메일"
            rules={[{ required: true, type: 'email', message: '올바른 이메일을 입력해주세요.' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[{ required: true, min: 6, message: '비밀번호는 6자 이상이어야 합니다.' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="6자 이상 입력" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="전화번호 (선택)">
            <Input placeholder="010-0000-0000" />
          </Form.Item>

          <Form.Item
            name="role"
            label="역할"
            initialValue="PARENT"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="PARENT">부모님 계정 (연락처 등록)</Option>
              <Option value="CHILD">자녀 계정 (수속자)</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontWeight: 600 }}
            >
              회원가입
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '16px 0' }} />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">이미 계정이 있으신가요? </Text>
          <Link to="/login" style={{ color: '#4a7c59', fontWeight: 500 }}>로그인</Link>
        </div>
      </Card>
    </div>
  )
}

export default RegisterPage
