const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// 로컬 환경을 위해 상대 경로로 한 번 더 시도 (Vercel 환경 변수가 우선함)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const trusteeRoutes = require('./routes/trustee');
const adminRoutes = require('./routes/admin');
const obituaryRoutes = require('./routes/obituary');

const app = express();

// MongoDB 연결 - 서버 종료 방지를 위해 에러 캐치 추가
connectDB().catch(err => {
  console.error('[App] 초기 DB 연결 실패:', err.message);
});

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 업로드 파일 정적 서빙 (증빙서류 열람용)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/trustees', trusteeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/obituary', obituaryRoutes);

// 기본 헬스체크 엔드포인트
app.get('/api', (req, res) => {
  res.json({ message: 'GoodBye API is running' });
});

// DB 연결 상태 확인용 헬스체크
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
