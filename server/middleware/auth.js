const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT 토큰 검증 미들웨어
 * - Authorization: Bearer <token> 헤더에서 토큰을 추출하여 사용자 정보를 req.user 에 주입
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증 토큰이 없습니다. 로그인을 해주세요.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '해당 사용자를 찾을 수 없습니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

/**
 * 권한 체크 미들웨어 팩토리
 * - 예: restrictTo('ADMIN')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '이 작업에 대한 권한이 없습니다.' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
