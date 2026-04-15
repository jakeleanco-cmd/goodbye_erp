const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT 토큰 생성 헬퍼 함수
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * POST /api/auth/register
 * 일반 이메일/비밀번호 회원가입
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    // 이미 가입된 이메일 체크
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    const user = await User.create({ name, email, password, role: role || 'PARENT', phoneNumber, provider: 'local' });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * POST /api/auth/login
 * 일반 이메일/비밀번호 로그인
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // password 필드는 기본적으로 select: false 이므로 명시적으로 조회
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * POST /api/auth/social
 * 소셜 로그인 (카카오/구글) - 프론트에서 받은 사용자 정보로 가입 또는 로그인 처리
 * 실제 소셜 OAuth 토큰 검증은 클라이언트 SDK (Kakao JS SDK, Google Identity) 에서 처리하고,
 * 검증된 사용자 정보만 이 API로 전송하는 방식
 */
router.post('/social', async (req, res) => {
  try {
    const { socialId, provider, name, email, role } = req.body;
    console.log(`[Auth] 소셜 로그인 요청: ${provider} (${email})`);

    if (!socialId || !provider) {
      return res.status(400).json({ message: '소셜 로그인 정보가 올바르지 않습니다.' });
    }

    // 1. 기존 소셜 계정 조회 (socialId + provider)
    let user = await User.findOne({ socialId, provider });

    // 2. 소셜 계정이 없으면 이메일로 기존 계정 조회
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        // 기존 계정이 있으면 소셜 정보 업데이트 (연동)
        user.socialId = socialId;
        user.provider = provider;
        await user.save();
        console.log(`[Auth] 기존 계정에 소셜 연동 완료: ${email}`);
      }
    }

    // 3. 둘 다 없으면 신규 생성
    if (!user) {
      user = await User.create({
        name,
        email: email || `${provider}_${socialId}@goodbye.social`,
        socialId,
        provider,
        role: role || 'PARENT',
      });
      console.log(`[Auth] 신규 소셜 사용자 생성: ${user.email}`);
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('[Auth] 소셜 로그인 오류:', error);
    res.status(500).json({ message: '소셜 로그인 중 오류가 발생했습니다.', error: error.message });
  }
});

module.exports = router;
