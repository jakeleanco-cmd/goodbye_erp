const mongoose = require('mongoose');

/**
 * FuneralWish 스키마
 * - 장례 희망 사항 (꽃, 종교, 기타 의사)
 * - 사용자당 하나만 존재 (findOne/findOneAndUpdate로 관리)
 */
const funeralWishSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    religion: { type: String, trim: true }, // 종교 방식
    flowers: { type: String, trim: true },  // 선호하는 꽃
    additional: { type: String, trim: true }, // 기타 희망 사항
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuneralWish', funeralWishSchema);
