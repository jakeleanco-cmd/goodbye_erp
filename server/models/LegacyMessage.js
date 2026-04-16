const mongoose = require('mongoose');

/**
 * LegacyMessage 스키마
 * - 특정 연락처(Contact)에게 남기는 부모님의 마지막 메시지
 * - 연락처당 하나만 작성 가능하도록 userId와 contactId의 조합에 유니크 제약
 */
const legacyMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// 연락처당 메시지 1개 제한
legacyMessageSchema.index({ userId: 1, contactId: 1 }, { unique: true });

module.exports = mongoose.model('LegacyMessage', legacyMessageSchema);
