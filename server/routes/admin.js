const express = require('express');
const router = express.Router();
const TrusteeConnection = require('../models/TrusteeConnection');
const { protect, restrictTo } = require('../middleware/auth');

// 모든 관리자 라우트는 ADMIN 역할만 접근 가능
router.use(protect, restrictTo('ADMIN'));

/**
 * GET /api/admin/requests
 * 상속 활성화 요청 목록 조회 (REQUESTED 상태)
 */
router.get('/requests', async (req, res) => {
  try {
    const requests = await TrusteeConnection.find({ status: 'REQUESTED' })
      .populate('parentId', 'name email phoneNumber')
      .populate('childId', 'name email phoneNumber')
      .sort({ updatedAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: '요청 목록 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * GET /api/admin/requests/all
 * 전체 연결 목록 조회 (상태별 필터 지원)
 */
router.get('/requests/all', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await TrusteeConnection.find(filter)
      .populate('parentId', 'name email')
      .populate('childId', 'name email')
      .sort({ updatedAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: '목록 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * PUT /api/admin/requests/:id/approve
 * [ADMIN] 상속 활성화 요청 승인
 */
router.put('/requests/:id/approve', async (req, res) => {
  try {
    const connection = await TrusteeConnection.findOne({ _id: req.params.id, status: 'REQUESTED' });
    if (!connection) return res.status(404).json({ message: '처리할 요청을 찾을 수 없습니다.' });

    connection.status = 'ACTIVE';
    connection.adminNote = req.body.adminNote || '';
    connection.processedAt = new Date();
    await connection.save();

    res.json({ message: '승인이 완료되었습니다. 자녀가 이제 연락처를 열람할 수 있습니다.', connection });
  } catch (error) {
    res.status(500).json({ message: '승인 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * PUT /api/admin/requests/:id/reject
 * [ADMIN] 상속 활성화 요청 거절
 */
router.put('/requests/:id/reject', async (req, res) => {
  try {
    const connection = await TrusteeConnection.findOne({ _id: req.params.id, status: 'REQUESTED' });
    if (!connection) return res.status(404).json({ message: '처리할 요청을 찾을 수 없습니다.' });

    connection.status = 'REJECTED';
    connection.adminNote = req.body.adminNote || '';
    connection.processedAt = new Date();
    await connection.save();

    res.json({ message: '요청이 거절되었습니다.', connection });
  } catch (error) {
    res.status(500).json({ message: '거절 처리 중 오류가 발생했습니다.', error: error.message });
  }
});

module.exports = router;
