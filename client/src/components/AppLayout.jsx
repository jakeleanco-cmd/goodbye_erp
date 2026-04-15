import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Drawer, Avatar, Dropdown, Typography, Space } from 'antd'
import {
  ContactsOutlined,
  TeamOutlined,
  UnlockOutlined,
  FileTextOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  HeartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import useAuthStore from '../stores/authStore'

const { Header, Sider, Content } = Layout
const { Text } = Typography

/**
 * 왼쪽 사이드바 메뉴 아이템 정의
 * - PARENT: 연락처, 수속자, 부고 메뉴 노출
 * - CHILD: 수속자, 권한요청, 부고 메뉴 노출
 * - ADMIN: 관리자 메뉴 노출
 */
const getMenuItems = (role) => {
  const common = [{ key: '/', icon: <DashboardOutlined />, label: '홈' }]

  if (role === 'PARENT') {
    return [
      ...common,
      { key: '/contacts', icon: <ContactsOutlined />, label: '연락처 관리' },
      { key: '/trustee', icon: <TeamOutlined />, label: '수속자 설정' },
      { key: '/obituary', icon: <FileTextOutlined />, label: '부고 문자' },
    ]
  }

  if (role === 'CHILD') {
    return [
      ...common,
      { key: '/trustee', icon: <TeamOutlined />, label: '연결 관리' },
      { key: '/unlock', icon: <UnlockOutlined />, label: '권한 활성화' },
      { key: '/obituary', icon: <FileTextOutlined />, label: '부고 문자' },
    ]
  }

  if (role === 'ADMIN') {
    return [
      { key: '/admin', icon: <SettingOutlined />, label: '활성화 요청 관리' },
    ]
  }

  return common
}

function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = getMenuItems(user?.role)

  const handleMenuClick = ({ key }) => {
    navigate(key)
    setMobileMenuOpen(false)
  }

  // 상단 우측 사용자 드롭다운 메뉴
  const userDropdownItems = [
    {
      key: 'name',
      label: <Text style={{ color: '#888' }}>{user?.email}</Text>,
      disabled: true,
    },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '로그아웃', danger: true },
  ]

  const handleDropdown = ({ key }) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
    }
  }

  // 사이드바 공통 컴포넌트
  const SideMenu = () => (
    <>
      {/* 로고 영역 */}
      <div style={{
        padding: '24px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 8,
      }}>
        <Space>
          <HeartOutlined style={{ color: '#b8d4b8', fontSize: 20 }} />
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>
            GoodBye
          </span>
        </Space>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4, paddingLeft: 28 }}>
          사랑하는 분을 위한 준비
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ border: 'none', background: 'transparent' }}
      />

      {/* 역할 뱃지 */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        padding: '0 16px',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Avatar size={28} icon={<UserOutlined />} style={{ background: '#4a7c59', flexShrink: 0 }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              {user?.role === 'PARENT' ? '부모님 계정' : user?.role === 'CHILD' ? '자녀 계정' : '관리자'}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 데스크탑 사이드바 */}
      <Sider
        width={220}
        className="main-sider"
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: '#2e4a35',
        }}
      >
        <SideMenu />
      </Sider>

      {/* 모바일 드로어 */}
      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={220}
        bodyStyle={{ padding: 0, background: '#2e4a35' }}
        headerStyle={{ display: 'none' }}
      >
        <div style={{ position: 'relative', height: '100%' }}>
          <SideMenu />
        </div>
      </Drawer>

      <Layout style={{ marginLeft: 220 }}>
        {/* 상단 헤더 (모바일 햄버거 + 사용자 메뉴) */}
        <Header style={{
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0ece4',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          {/* 모바일 햄버거 */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            style={{ display: 'none' }}
            className="mobile-menu-btn"
          />

          <div /> {/* 좌측 공간 */}

          {/* 우측 사용자 드롭다운 */}
          <Dropdown menu={{ items: userDropdownItems, onClick: handleDropdown }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ background: '#4a7c59' }} />
              <Text strong style={{ fontSize: 13 }}>{user?.name}</Text>
            </Space>
          </Dropdown>
        </Header>

        {/* 메인 콘텐츠 */}
        <Content style={{ padding: '28px 32px', minHeight: 'calc(100vh - 64px)' }}>
          <div className="page-fade-in">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
