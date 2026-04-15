import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import App from './App'
import './index.css'

// Ant Design 글로벌 테마 설정 (따뜻한 베이지 + 딥그린 테마)
const theme = {
  token: {
    colorPrimary: '#4a7c59',          // 딥그린 (신뢰, 생명)
    colorBgBase: '#faf7f2',           // 따뜻한 크림 배경
    colorTextBase: '#2c2c2c',         // 진한 텍스트
    colorBorder: '#e0d9cc',           // 따뜻한 베이지 보더
    borderRadius: 10,
    fontFamily: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorSuccess: '#4a7c59',
    colorWarning: '#c9853c',
    colorError: '#c94a4a',
    colorInfo: '#4a6e8a',
    controlHeight: 38,
    paddingContentHorizontal: 16,
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      primaryShadow: 'none',
    },
    Card: {
      borderRadiusLG: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    Table: {
      borderRadius: 12,
    },
    Layout: {
      headerBg: '#2e4a35',
      siderBg: '#2e4a35',
      bodyBg: '#faf7f2',
    },
    Menu: {
      darkItemBg: '#2e4a35',
      darkItemSelectedBg: '#4a7c59',
      darkItemHoverBg: '#3d6347',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ConfigProvider locale={koKR} theme={theme}>
      <App />
    </ConfigProvider>
  </BrowserRouter>
)
