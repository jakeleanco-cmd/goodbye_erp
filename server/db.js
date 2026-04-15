const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[GoodBye DB] MongoDB 연결 성공');
  } catch (error) {
    console.error('[GoodBye DB] MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
