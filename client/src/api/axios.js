import axios from 'axios'

// axios 기본 설정
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 요청 인터셉터: 모든 요청에 JWT 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('goodbye_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터: 401 에러 시 자동 로그아웃 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('goodbye_token')
      localStorage.removeItem('goodbye_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
