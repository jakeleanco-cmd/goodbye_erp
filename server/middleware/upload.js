const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 설정
// Vercel 환경에서는 /tmp 폴더만 쓰기가 가능하므로 환경에 따라 경로 조정
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../uploads');

// 업로드 디렉토리가 없으면 생성 시도 (Vercel에서는 읽기전용 필드에서 실패할 수 있으므로 try-catch 처리)
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    if (!isVercel) console.error('[Upload] 디렉토리 생성 실패:', err.message);
  }
}

// 파일을 서버 로컬 스토리지에 저장하는 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명 충돌 방지: timestamp + 원본 파일명 조합
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

// 허용할 파일 타입 필터 (이미지, PDF만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('JPG, PNG, WEBP, PDF 파일만 업로드할 수 있습니다.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 최대 10MB
});

module.exports = upload;
