const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const LegacyMessage = require('../models/LegacyMessage');
const LegacyGuide = require('../models/LegacyGuide');
const FuneralWish = require('../models/FuneralWish');
const TrusteeConnection = require('../models/TrusteeConnection');

// 모든 라우트 로그인 보호
router.use(protect);

// ---------------------------------------------------------
// [공통 미들웨어] 자녀의 열람 권한 체크
// ---------------------------------------------------------
const checkAccess = async (req, res, next) => {
  if (req.user.role === 'PARENT') return next();

  const { parentId } = req.query; // 조회하려는 부모 ID
  if (!parentId) return res.status(400).json({ message: '조회할 부모 ID가 필요합니다.' });

  const connection = await TrusteeConnection.findOne({
    parentId,
    childId: req.user._id,
    status: 'ACTIVE'
  });

  if (!connection) {
    return res.status(403).json({ message: '유언 및 가이드 열람 권한이 없습니다.' });
  }
  
  // 조회용 필터에 parentId 적용을 위해 넘겨줌
  req.targetUserId = parentId;
  next();
};

// ---------------------------------------------------------
// 1. 마지막 편지 (LegacyMessage)
// ---------------------------------------------------------
router.get('/messages', checkAccess, async (req, res) => {
  try {
    const userId = req.targetUserId || req.user._id;
    const messages = await LegacyMessage.find({ userId }).populate('contactId', 'name phoneNumber group');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: '메시지 조회 중 오류 발생', error: error.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { contactId, content } = req.body;
    // 기존 메시지 수정 또는 생성 (upsert)
    const message = await LegacyMessage.findOneAndUpdate(
      { userId: req.user._id, contactId },
      { content },
      { upsert: true, new: true }
    );
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: '메시지 저장 중 오류 발생', error: error.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    await LegacyMessage.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: '메시지가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '메시지 삭제 중 오류 발생', error: error.message });
  }
});

// ---------------------------------------------------------
// 2. 디지털 자산 가이드 (LegacyGuide)
// ---------------------------------------------------------
router.get('/guides', checkAccess, async (req, res) => {
  try {
    const userId = req.targetUserId || req.user._id;
    const guides = await LegacyGuide.find({ userId }).sort({ createdAt: -1 });
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: '가이드 조회 중 오류 발생', error: error.message });
  }
});

router.post('/guides', upload.single('guideFile'), async (req, res) => {
  try {
    const { category, title, content } = req.body;
    const guideData = { userId: req.user._id, category, title, content };
    
    if (req.file) {
      guideData.fileUrl = `/uploads/${req.file.filename}`;
      guideData.fileName = req.file.originalname;
    }

    const guide = await LegacyGuide.create(guideData);
    res.status(201).json(guide);
  } catch (error) {
    res.status(500).json({ message: '가이드 등록 중 오류 발생', error: error.message });
  }
});

router.delete('/guides/:id', async (req, res) => {
  try {
    await LegacyGuide.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: '가이드가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '가이드 삭제 중 오류 발생', error: error.message });
  }
});

// ---------------------------------------------------------
// 3. 장례 희망 사항 (FuneralWish)
// ---------------------------------------------------------
router.get('/funeral', checkAccess, async (req, res) => {
  try {
    const userId = req.targetUserId || req.user._id;
    const wish = await FuneralWish.findOne({ userId });
    res.json(wish || {});
  } catch (error) {
    res.status(500).json({ message: '장례 희망 사항 조회 중 오류 발생', error: error.message });
  }
});

router.post('/funeral', async (req, res) => {
  try {
    const { religion, flowers, additional } = req.body;
    const wish = await FuneralWish.findOneAndUpdate(
      { userId: req.user._id },
      { religion, flowers, additional },
      { upsert: true, new: true }
    );
    res.json(wish);
  } catch (error) {
    res.status(500).json({ message: '장례 희망 사항 저장 중 오류 발생', error: error.message });
  }
});

module.exports = router;
