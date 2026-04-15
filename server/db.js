const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[GoodBye DB] MongoDB 연결 성공');
  } catch (error) {
    console.error('[GoodBye DB] MongoDB 연결 실패:', error.message);
    // 서버리스 환경에서는 프로세스를 종료(exit)하지 않고 에러를 던져 호출측에서 알 수 있게 함
    throw error;
  }
};

module.exports = connectDB;
