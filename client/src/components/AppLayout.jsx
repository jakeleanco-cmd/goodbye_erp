import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Drawer, Avatar, Dropdown, Typography, Space, Grid } from 'antd'
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
const { Text, Title } = Typography
const { useBreakpoint } = Grid

/**
 * 전역 레이아웃 컴포넌트
 * - Flexible Layout: 모바일에서 사이드바 숨김 및 하단 탭 바 노출
 * - Premium UI: 글래스모피즘 헤더, 부드러운 애니메이션
 */
function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 데스크탑 여부 판단 (MD 이상)
  const isDesktop = screens.md

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '홈' },
    ...(user?.role === 'PARENT' ? [
      { key: '/contacts', icon: <ContactsOutlined />, label: '연락처 관리' },
      { key: '/trustee', icon: <TeamOutlined />, label: '수속자 설정' },
      { key: '/obituary', icon: <FileTextOutlined />, label: '부고 문자' },
    ] : []),
    ...(user?.role === 'CHILD' ? [
      { key: '/trustee', icon: <TeamOutlined />, label: '연결 관리' },
      { key: '/unlock', icon: <UnlockOutlined />, label: '권한 활성화' },
      { key: '/obituary', icon: <FileTextOutlined />, label: '부고 문자' },
    ] : []),
    ...(user?.role === 'ADMIN' ? [
      { key: '/admin', icon: <SettingOutlined />, label: '활성화 요청 관리' },
    ] : []),
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 상단 우측 사용자 드롭다운 메뉴
  const userDropdownItems = [
    { key: 'email', label: <Text type="secondary">{user?.email}</Text>, disabled: true },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '로그아웃', danger: true, onClick: handleLogout },
  ]

  // 사이드바 전용 메뉴 컴포넌트
  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#2e4a35' }}>
      <div style={{ padding: '32px 24px 24px' }}>
        <Space size={12}>
          <div style={{ 
            background: 'var(--secondary)', 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <HeartOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <Title level={4} style={{ color: '#fff', margin: 0, fontFamily: 'Outfit', letterSpacing: '-0.5px' }}>GoodBye</Title>
        </Space>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ border: 'none', background: 'transparent', flex: 1 }}
      />

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '12px', 
          borderRadius: 12, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12 
        }}>
          <Avatar icon={<UserOutlined />} style={{ background: 'var(--primary)' }} />
          <div style={{ overflow: 'hidden' }}>
            <Text style={{ color: '#fff', display: 'block', fontSize: 13, fontWeight: 500 }}>{user?.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{user?.role}</Text>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* 데스크탑 사이드바 (LG 이상에서만 고정) */}
      {isDesktop && (
        <Sider
          width={240}
          theme="dark"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1001,
            background: '#2e4a35',
            boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
          }}
        >
          <SidebarContent />
        </Sider>
      )}

      {/* 모바일 햄버거 메뉴용 드로어 */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={260}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
      >
        <SidebarContent />
      </Drawer>

      <Layout style={{ 
        marginLeft: isDesktop ? 240 : 0, 
        transition: 'all 0.3s var(--ease-premium)',
        minHeight: '100vh' 
      }}>
        {/* 프리미엄 글래스모피즘 헤더 */}
        <Header className="glass-panel" style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isDesktop ? '0 32px' : '0 16px',
          height: 64,
          background: 'var(--glass-bg)',
          lineHeight: '64px'
        }}>
          <Space size={16}>
            {!isDesktop && (
              <Button 
                type="text" 
                icon={<MenuOutlined />} 
                onClick={() => setMobileMenuOpen(true)}
                style={{ fontSize: 20 }}
              />
            )}
            {isDesktop ? (
              <Text strong style={{ fontSize: 16, color: 'var(--primary-dark)' }}>
                {menuItems.find(item => item.key === location.pathname)?.label || 'GoodBye'}
              </Text>
            ) : (
              <Text strong style={{ fontSize: 18, color: 'var(--primary)', fontFamily: 'Outfit' }}>GoodBye</Text>
            )}
          </Space>

          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar 
                size={36} 
                icon={<UserOutlined />} 
                style={{ background: 'var(--primary)', border: '2px solid #fff' }} 
              />
              {isDesktop && <Text strong>{user?.name}</Text>}
            </Space>
          </Dropdown>
        </Header>

        {/* 메인 콘텐츠 영역 */}
        <Content style={{ 
          padding: isDesktop ? '32px' : '20px 16px 100px', // 모바일 하단 탭바 여유 공간
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%'
        }}>
          <div className="page-fade-in">
            <Outlet />
          </div>
        </Content>

        {/* 모바일 전용 하단 탭 바 (Flexible Layout 핵심) */}
        {!isDesktop && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            left: '20px',
            right: '20px',
            height: 64,
            background: 'rgba(46, 74, 53, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: 1001
          }}>
            {menuItems.slice(0, 4).map(item => (
              <div 
                key={item.key} 
                onClick={() => navigate(item.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: location.pathname === item.key ? 'var(--secondary)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: 20 }}>{item.icon}</div>
                <span style={{ fontSize: 10, marginTop: 4 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </Layout>
  )
}

export default AppLayout
