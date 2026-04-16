const mongoose = require('mongoose');

/**
 * LegacyGuide 스키마
 * - 디지털 자산(구독 서비스 해지, 서류 위치 등) 가이드 기록
 * - 텍스트 내용 외에도 이미지/PDF 첨부 파일 지원
 */
const legacyGuideSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['구독', '금융', '서류', '기타'],
      default: '기타'
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    fileUrl: { type: String }, // 첨부 파일 경로
    fileName: { type: String }, // 첨부 파일 원본 이름
  },
  { timestamps: true }
);

module.exports = mongoose.model('LegacyGuide', legacyGuideSchema);
