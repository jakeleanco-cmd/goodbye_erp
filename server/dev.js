// 개발용 서버 진입점 (nodemon 이 이 파일을 감시하며 자동 재시작)
const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[GoodBye Server] 개발 서버 실행 중: http://localhost:${PORT}`);
});
