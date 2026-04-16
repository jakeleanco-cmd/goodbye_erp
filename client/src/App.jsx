import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ContactsPage from './pages/ContactsPage'
import TrusteePage from './pages/TrusteePage'
import UnlockRequestPage from './pages/UnlockRequestPage'
import ObituaryPage from './pages/ObituaryPage'
import AdminPage from './pages/AdminPage'
import DashboardPage from './pages/DashboardPage'
import LegacyMessagePage from './pages/LegacyMessagePage'
import LegacyGuidePage from './pages/LegacyGuidePage'
import FuneralWishPage from './pages/FuneralWishPage'
import LegacyViewPage from './pages/LegacyViewPage'

/**
 * 로그인된 사용자만 접근 가능한 라우트 보호 컴포넌트
 */
const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

/**
 * ADMIN 역할만 접근 가능한 라우트 보호 컴포넌트
 */
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 보호된 라우트: 레이아웃 안에 중첩 */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="trustee" element={<TrusteePage />} />
        <Route path="unlock" element={<UnlockRequestPage />} />
        <Route path="obituary" element={<ObituaryPage />} />
        
        {/* Phase 2: Legacy Features */}
        <Route path="legacy/messages" element={<LegacyMessagePage />} />
        <Route path="legacy/guide" element={<LegacyGuidePage />} />
        <Route path="legacy/funeral" element={<FuneralWishPage />} />
        <Route path="legacy/view" element={<LegacyViewPage />} />
      </Route>

      {/* 관리자 전용 라우트 */}
      <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
        <Route index element={<AdminPage />} />
      </Route>

      {/* 잘못된 경로 처리 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
