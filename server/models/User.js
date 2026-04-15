const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User 스키마
 * - PARENT: 연락처를 등록하고 관리하는 부모님 계정
 * - CHILD: 부모님으로부터 상속권을 받는 자녀 계정
 * - ADMIN: 상속 활성화 요청을 검토하고 승인하는 관리자 계정
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // 일반 가입자만 사용 (소셜 로그인은 불필요)
    phoneNumber: { type: String, trim: true },
    role: { type: String, enum: ['PARENT', 'CHILD', 'ADMIN'], default: 'PARENT' },
    // 소셜 로그인 관련 필드 (카카오, 구글 등)
    socialId: { type: String },
    provider: { type: String, enum: ['local', 'kakao', 'google'], default: 'local' },
  },
  { timestamps: true }
);

// 비밀번호 저장 전 해싱 처리 (보안 핵심 로직)
userSchema.pre('save', async function () {
  // password 필드가 변경된 경우에만 해싱 (예: 소셜 로그인 사용자는 무시)
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// 로그인 시 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
