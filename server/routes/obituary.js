const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const TrusteeConnection = require('../models/TrusteeConnection');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * POST /api/obituary/template
 * 부고 문자 템플릿 생성
 * - connectionId: 자녀가 접근 중인 신뢰 연결 ID (CHILD의 경우)
 * - parentId: 부모 본인의 경우 직접 사용
 * - funeralInfo: 장례식장 정보 (장소, 날짜, 시간, 상주, 계좌번호 등)
 */
router.post('/template', async (req, res) => {
  try {
    const { connectionId, funeralInfo } = req.body;
    let targetUserId = req.user._id;

    // 자녀가 요청하는 경우: 연결 권한 확인
    if (connectionId) {
      const connection = await TrusteeConnection.findOne({
        _id: connectionId,
        childId: req.user._id,
        status: 'ACTIVE',
      }).populate('parentId', 'name');

      if (!connection) {
        return res.status(403).json({ message: '연락처 열람 권한이 없습니다.' });
      }
      targetUserId = connection.parentId._id;
    }

    // 그룹별 연락처 조회
    const contacts = await Contact.find({ userId: targetUserId });
    const groups = {};
    contacts.forEach((c) => {
      if (!groups[c.group]) groups[c.group] = [];
      groups[c.group].push(c);
    });

    // 그룹별 부고 문자 템플릿 생성
    const templates = {};
    const { deceasedName, funeralHall, location, time, chiefMourner, bankAccount } = funeralInfo;

    Object.keys(groups).forEach((group) => {
      if (group === '가족' || group === '친척') {
        templates[group] = `[부고 알림]\n\n${deceasedName}께서 별세하셨기에 삼가 알려드립니다.\n\n🏛 빈소: ${funeralHall}\n📍 위치: ${location}\n⏰ 발인: ${time}\n\n상주: ${chiefMourner}\n\n생전에 베풀어 주신 따뜻한 정에 깊이 감사드립니다.`;
      } else if (group === '직장') {
        templates[group] = `[부고]\n\n삼가 고인의 별세(${deceasedName})를 알려드립니다.\n\n빈소: ${funeralHall} (${location})\n발인: ${time}\n상주: ${chiefMourner}\n\n조의금 계좌: ${bankAccount || '별도 문의'}\n\n바쁘신 중에도 연락 드려 죄송합니다.`;
      } else if (group === '종교') {
        templates[group] = `[부고 알림]\n\n${deceasedName}님께서 하나님의 품으로 돌아가셨습니다.\n\n빈소: ${funeralHall}\n위치: ${location}\n발인: ${time}\n상주: ${chiefMourner}\n\n함께 기도해 주시길 부탁드립니다.`;
      } else {
        templates[group] = `[부고]\n\n${deceasedName}의 별세를 알려드립니다.\n\n빈소: ${funeralHall}\n위치: ${location}\n발인: ${time}\n상주: ${chiefMourner}`;
      }
    });

    res.json({ templates, groupSummary: Object.keys(groups).map((g) => ({ group: g, count: groups[g].length })) });
  } catch (error) {
    res.status(500).json({ message: '템플릿 생성 중 오류가 발생했습니다.', error: error.message });
  }
});

module.exports = router;
