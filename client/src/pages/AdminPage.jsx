import React, { useState, useEffect } from 'react'
import {
  Table, Card, Button, Space, Tag, Typography, Modal,
  Input, Descriptions, Image, message, Popconfirm, Badge,
} from 'antd'
import {
  CheckCircleOutlined, CloseCircleOutlined,
  FileProtectOutlined, SettingOutlined, EyeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../api/axios'

const { Title, Text } = Typography
const { TextArea } = Input

const STATUS_COLORS = {
  REQUESTED: 'purple',
  ACTIVE: 'success',
  REJECTED: 'error',
  ACCEPTED: 'blue',
  PENDING: 'orange',
}

/**
 * 관리자 페이지 - 상속 활성화 요청 검토 및 승인/거절
 */
function AdminPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(false)
  const [detailModal, setDetailModal] = useState({ open: false, record: null })
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('REQUESTED')

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const url = statusFilter === 'REQUESTED'
        ? '/admin/requests'
        : `/admin/requests/all?status=${statusFilter}`
      const { data } = await api.get(url)
      setRequests(data)
    } catch {
      message.error('요청 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [statusFilter])

  // 요청 상세 모달 열기
  const openDetail = (record) => {
    setAdminNote('')
    setDetailModal({ open: true, record })
  }

  // 승인
  const handleApprove = async () => {
    setProcessing(true)
    try {
      await api.put(`/admin/requests/${detailModal.record._id}/approve`, { adminNote })
      message.success('승인이 완료되었습니다.')
      setDetailModal({ open: false, record: null })
      fetchRequests()
    } catch {
      message.error('승인에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  // 거절
  const handleReject = async () => {
    setProcessing(true)
    try {
      await api.put(`/admin/requests/${detailModal.record._id}/reject`, { adminNote })
      message.success('거절 처리되었습니다.')
      setDetailModal({ open: false, record: null })
      fetchRequests()
    } catch {
      message.error('거절 처리에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const columns = [
    {
      title: '요청 일시',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '부모님',
      key: 'parent',
      render: (_, r) => (
        <div>
          <Text strong>{r.parentId?.name}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{r.parentId?.email}</Text>
        </div>
      ),
    },
    {
      title: '자녀(요청자)',
      key: 'child',
      render: (_, r) => (
        <div>
          <Text strong>{r.childId?.name}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{r.childId?.email}</Text>
        </div>
      ),
    },
    {
      title: '증빙서류',
      key: 'proof',
      render: (_, r) => r.proofDocumentName ? (
        <Tag icon={<FileProtectOutlined />} color="blue">{r.proofDocumentName}</Tag>
      ) : <Text type="secondary">없음</Text>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={STATUS_COLORS[status]}>{status}</Tag>,
    },
    {
      title: '처리',
      key: 'action',
      render: (_, r) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetail(r)}
        >
          상세보기
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Space align="center" style={{ marginBottom: 6 }}>
        <SettingOutlined style={{ fontSize: 22, color: '#4a7c59' }} />
        <Title level={4} style={{ margin: 0 }}>활성화 요청 관리</Title>
      </Space>
      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 24 }}>
        자녀가 제출한 증빙서류를 확인하고 상속 활성화를 승인 또는 거절합니다.
      </Text>

      {/* 상태 필터 버튼 */}
      <Space style={{ marginBottom: 16 }}>
        {['REQUESTED', 'ACTIVE', 'REJECTED', 'ACCEPTED'].map((s) => (
          <Button
            key={s}
            type={statusFilter === s ? 'primary' : 'default'}
            onClick={() => setStatusFilter(s)}
            size="small"
          >
            <Tag color={STATUS_COLORS[s]} style={{ margin: 0 }}>{s}</Tag>
          </Button>
        ))}
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={requests}
        loading={loading}
        scroll={{ x: 700 }}
        pagination={{ pageSize: 10, showTotal: (t) => `총 ${t}건` }}
        style={{ borderRadius: 12, overflow: 'hidden' }}
      />

      {/* 상세보기 + 승인/거절 모달 */}
      <Modal
        title="상속 활성화 요청 상세"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        width={600}
      >
        {detailModal.record && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="부모님">
                {detailModal.record.parentId?.name} ({detailModal.record.parentId?.email})
              </Descriptions.Item>
              <Descriptions.Item label="자녀">
                {detailModal.record.childId?.name} ({detailModal.record.childId?.email})
              </Descriptions.Item>
              <Descriptions.Item label="현재 상태">
                <Tag color={STATUS_COLORS[detailModal.record.status]}>{detailModal.record.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="제출 서류">
                {detailModal.record.proofDocumentName || '미첨부'}
              </Descriptions.Item>
            </Descriptions>

            {/* 증빙서류 이미지 미리보기 */}
            {detailModal.record.proofDocumentUrl && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>📋 제출된 증빙서류</Text>
                {detailModal.record.proofDocumentUrl.endsWith('.pdf') ? (
                  <a href={detailModal.record.proofDocumentUrl} target="_blank" rel="noreferrer">
                    <Button icon={<FileProtectOutlined />}>PDF 열기</Button>
                  </a>
                ) : (
                  <Image
                    src={detailModal.record.proofDocumentUrl}
                    style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }}
                    placeholder
                  />
                )}
              </div>
            )}

            {/* 관리자 메모 */}
            {detailModal.record.status === 'REQUESTED' && (
              <>
                <Text style={{ display: 'block', marginBottom: 8 }}>처리 메모 (선택)</Text>
                <TextArea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="승인 또는 거절 사유를 입력하세요. (자녀에게 표시됩니다)"
                  style={{ marginBottom: 16 }}
                />
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Popconfirm
                    title="이 요청을 거절하시겠습니까?"
                    onConfirm={handleReject}
                    okText="거절"
                    cancelText="취소"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<CloseCircleOutlined />} loading={processing}>
                      거절
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="이 요청을 승인하시겠습니까? 자녀가 연락처를 열람할 수 있게 됩니다."
                    onConfirm={handleApprove}
                    okText="승인"
                    cancelText="취소"
                  >
                    <Button type="primary" icon={<CheckCircleOutlined />} loading={processing}>
                      승인
                    </Button>
                  </Popconfirm>
                </Space>
              </>
            )}

            {/* 이미 처리된 경우 처리 결과 표시 */}
            {detailModal.record.status !== 'REQUESTED' && (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="처리 일시">
                  {detailModal.record.processedAt
                    ? dayjs(detailModal.record.processedAt).format('YYYY-MM-DD HH:mm')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="관리자 메모">
                  {detailModal.record.adminNote || '-'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}

export default AdminPage
