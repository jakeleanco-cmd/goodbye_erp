const mongoose = require('mongoose');

/**
 * Contact 스키마
 * - 부모님(PARENT)이 등록한 연락처 정보
 * - group 필드로 그룹화하여 부고 문자 대상을 분류할 수 있음
 */
const contactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    group: {
      type: String,
      enum: ['가족', '친척', '고향친구', '직장', '종교', '지인', '기타'],
      default: '지인',
    },
    memo: { type: String, trim: true }, // 선택: 장례식 연락 시 유의사항 등
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
