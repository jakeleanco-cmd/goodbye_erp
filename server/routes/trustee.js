const express = require('express');
const router = express.Router();
const TrusteeConnection = require('../models/TrusteeConnection');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

/**
 * POST /api/trustees/invite
 * [PARENT] 자녀 초대 (이메일 기반)
 */
router.post('/invite', async (req, res) => {
  try {
    const { inviteEmail } = req.body;
    if (req.user.role !== 'PARENT') {
      return res.status(403).json({ message: '부모님 계정만 초대할 수 있습니다.' });
    }

    // 이미 초대한 이메일인지 체크
    const existing = await TrusteeConnection.findOne({ parentId: req.user._id, inviteEmail });
    if (existing) {
      return res.status(400).json({ message: '이미 초대한 이메일입니다.' });
    }

    const connection = await TrusteeConnection.create({
      parentId: req.user._id,
      inviteEmail: inviteEmail.toLowerCase().trim(),
    });

    res.status(201).json({ message: '초대가 완료되었습니다.', connection });
  } catch (error) {
    res.status(500).json({ message: '초대 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * GET /api/trustees/my-invites
 * [CHILD] 내 이메일로 온 초대 목록 조회
 */
router.get('/my-invites', async (req, res) => {
  try {
    const invites = await TrusteeConnection.find({
      inviteEmail: req.user.email,
      status: 'PENDING',
    }).populate('parentId', 'name email phoneNumber');

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: '초대 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * PUT /api/trustees/:id/accept
 * [CHILD] 초대 수락
 */
router.put('/:id/accept', async (req, res) => {
  try {
    const connection = await TrusteeConnection.findOne({
      _id: req.params.id,
      inviteEmail: req.user.email,
      status: 'PENDING',
    });

    if (!connection) return res.status(404).json({ message: '초대를 찾을 수 없습니다.' });

    connection.childId = req.user._id;
    connection.status = 'ACCEPTED';
    await connection.save();

    res.json({ message: '초대를 수락했습니다.', connection });
  } catch (error) {
    res.status(500).json({ message: '수락 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * GET /api/trustees/my-connections
 * [CHILD & PARENT] 내 연결(신뢰 연결) 목록 조회
 */
router.get('/my-connections', async (req, res) => {
  try {
    let connections;
    if (req.user.role === 'PARENT') {
      connections = await TrusteeConnection.find({ parentId: req.user._id })
        .populate('childId', 'name email');
    } else {
      connections = await TrusteeConnection.find({ childId: req.user._id })
        .populate('parentId', 'name email phoneNumber');
    }
    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: '연결 목록 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * POST /api/trustees/:id/request-unlock
 * [CHILD] 상속 활성화 요청 + 증빙서류 업로드
 * - upload.single('proofDocument') 미들웨어로 파일 수신
 */
router.post('/:id/request-unlock', upload.single('proofDocument'), async (req, res) => {
  try {
    const connection = await TrusteeConnection.findOne({
      _id: req.params.id,
      childId: req.user._id,
      status: 'ACCEPTED',
    });

    if (!connection) {
      return res.status(404).json({ message: '수락된 연결을 찾을 수 없거나 이미 요청 중입니다.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: '증빙서류 파일을 업로드해야 합니다.' });
    }

    // 파일 경로를 URL 형태로 저장
    connection.proofDocumentUrl = `/uploads/${req.file.filename}`;
    connection.proofDocumentName = req.file.originalname;
    connection.status = 'REQUESTED';
    await connection.save();

    res.json({ message: '활성화 요청이 완료되었습니다. 관리자 검토 후 승인됩니다.', connection });
  } catch (error) {
    res.status(500).json({ message: '요청 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * GET /api/trustees/:parentId/contacts
 * [CHILD] 상속이 활성화된 경우 부모님 연락처 목록 열람
 */
router.get('/:connectionId/contacts', async (req, res) => {
  try {
    const connection = await TrusteeConnection.findOne({
      _id: req.params.connectionId,
      childId: req.user._id,
      status: 'ACTIVE', // ACTIVE 상태일 때만 열람 가능
    });

    if (!connection) {
      return res.status(403).json({ message: '연락처 열람 권한이 없습니다. 관리자 승인을 기다려주세요.' });
    }

    const contacts = await Contact.find({ userId: connection.parentId }).sort({ group: 1, name: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: '연락처 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

module.exports = router;
