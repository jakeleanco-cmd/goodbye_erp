const mongoose = require('mongoose');

/**
 * TrusteeConnection 스키마
 * - 부모(parentId)와 자녀(childId) 사이의 신뢰 연결 상태를 관리
 * - 상속 활성화 요청 시 자녀가 증빙서류를 업로드하고, 관리자가 승인
 *
 * 상태(status) 흐름:
 * PENDING (부모가 자녀 초대)
 * → ACCEPTED (자녀가 초대 수락, 잠금 상태)
 * → REQUESTED (자녀가 활성화 요청 + 증빙서류 업로드)
 * → ACTIVE (관리자 승인, 자녀가 연락처 열람 가능)
 */
const trusteeConnectionSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 초대 수락 후 연결
    inviteEmail: { type: String, required: true }, // 초대 이메일 (수락 전 식별용)
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REQUESTED', 'ACTIVE', 'REJECTED'],
      default: 'PENDING',
    },
    // 자녀가 활성화 요청 시 업로드한 증빙서류 파일 경로 (사망진단서 등)
    proofDocumentUrl: { type: String },
    proofDocumentName: { type: String },
    // 관리자 승인/거절 시 남기는 메모
    adminNote: { type: String },
    // 관리자가 처리한 시간
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrusteeConnection', trusteeConnectionSchema);
