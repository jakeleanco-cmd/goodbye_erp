const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, restrictTo } = require('../middleware/auth');

// 모든 연락처 라우트는 로그인된 PARENT 만 접근 가능
router.use(protect);

/**
 * GET /api/contacts
 * 내 연락처 전체 조회 (그룹 필터링 지원)
 */
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.group) filter.group = req.query.group;

    const contacts = await Contact.find(filter).sort({ group: 1, name: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: '연락처 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * POST /api/contacts
 * 연락처 등록
 */
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber, group, memo } = req.body;
    const contact = await Contact.create({ userId: req.user._id, name, phoneNumber, group, memo });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: '연락처 등록 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * PUT /api/contacts/:id
 * 연락처 수정
 */
router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // 본인 연락처만 수정 가능
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) return res.status(404).json({ message: '연락처를 찾을 수 없습니다.' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: '연락처 수정 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * DELETE /api/contacts/:id
 * 연락처 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!contact) return res.status(404).json({ message: '연락처를 찾을 수 없습니다.' });
    res.json({ message: '연락처가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '연락처 삭제 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * DELETE /api/contacts
 * 선택 연락처 일괄 삭제
 */
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: '삭제할 ID 목록이 필요합니다.' });
    }
    await Contact.deleteMany({ _id: { $in: ids }, userId: req.user._id });
    res.json({ message: `${ids.length}개의 연락처가 삭제되었습니다.` });
  } catch (error) {
    res.status(500).json({ message: '일괄 삭제 중 오류가 발생했습니다.', error: error.message });
  }
});

module.exports = router;
