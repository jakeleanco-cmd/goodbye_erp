import { create } from 'zustand'
import api from '../api/axios'

/**
 * 인증 상태 관리 스토어
 * - user: 현재 로그인된 사용자 정보
 * - token: JWT 토큰
 * - login, logout, socialLogin 액션
 */
const useAuthStore = create((set) => ({
  // 로컬스토리지에서 초기값 복원 (새로고침 시 로그인 상태 유지)
  user: JSON.parse(localStorage.getItem('goodbye_user') || 'null'),
  token: localStorage.getItem('goodbye_token') || null,
  loading: false,

  // 일반 이메일/비밀번호 로그인
  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('goodbye_token', data.token)
      localStorage.setItem('goodbye_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, message: error.response?.data?.message || '로그인에 실패했습니다.' }
    }
  },

  // 회원가입
  register: async (formData) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/register', formData)
      localStorage.setItem('goodbye_token', data.token)
      localStorage.setItem('goodbye_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, message: error.response?.data?.message || '회원가입에 실패했습니다.' }
    }
  },

  // 소셜 로그인 (카카오, 구글 등 클라이언트 SDK로 인증 후 사용자 정보 전달)
  socialLogin: async (socialData) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/social', socialData)
      localStorage.setItem('goodbye_token', data.token)
      localStorage.setItem('goodbye_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, message: error.response?.data?.message || '소셜 로그인에 실패했습니다.' }
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('goodbye_token')
    localStorage.removeItem('goodbye_user')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
