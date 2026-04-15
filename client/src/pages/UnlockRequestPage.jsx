import React, { useState, useEffect } from 'react'
import {
  Card, Button, Upload, Typography, Space, Tag, List,
  Avatar, Empty, message, Alert, Steps, Progress,
} from 'antd'
import {
  UploadOutlined, UnlockOutlined, TeamOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileProtectOutlined,
} from '@ant-design/icons'
import api from '../api/axios'

const { Title, Text } = Typography

const STATUS_MAP = {
  PENDING:   { step: 0, label: '초대 대기 중', color: 'orange' },
  ACCEPTED:  { step: 1, label: '연결됨 (잠금)', color: 'blue' },
  REQUESTED: { step: 2, label: '관리자 검토 중', color: 'purple' },
  ACTIVE:    { step: 3, label: '활성화 완료', color: 'success' },
  REJECTED:  { step: 1, label: '거절됨 (재신청 필요)', color: 'error' },
}

/**
 * 상속 활성화 요청 페이지 (CHILD 전용)
 * - 연결된 부모님 계정 목록 확인
 * - 증빙서류(사망진단서 등) 업로드 후 관리자 승인 요청
 */
function UnlockRequestPage() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading]         = useState(false)
  const [uploading, setUploading]     = useState({}) // connectionId별 업로드 상태
  const [fileMap, setFileMap]         = useState({}) // connectionId별 선택된 파일

  const fetchConnections = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trustees/my-connections')
      // ACCEPTED 또는 REQUESTED 상태인 연결만 표시
      setConnections(data.filter((c) => ['ACCEPTED', 'REQUESTED', 'ACTIVE', 'REJECTED'].includes(c.status)))
    } catch {
      message.error('연결 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConnections() }, [])

  // 증빙서류 업로드 + 활성화 요청
  const handleRequestUnlock = async (connectionId) => {
    const file = fileMap[connectionId]
    if (!file) {
      return message.warning('증빙서류 파일을 먼저 선택해주세요.')
    }

    const formData = new FormData()
    formData.append('proofDocument', file)

    setUploading((prev) => ({ ...prev, [connectionId]: true }))
    try {
      await api.post(`/trustees/${connectionId}/request-unlock`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      message.success('요청이 완료되었습니다. 관리자 검토 후 승인됩니다.')
      fetchConnections()
    } catch (err) {
      message.error(err.response?.data?.message || '요청에 실패했습니다.')
    } finally {
      setUploading((prev) => ({ ...prev, [connectionId]: false }))
    }
  }

  if (connections.length === 0 && !loading) {
    return (
      <div>
        <Space align="center" style={{ marginBottom: 24 }}>
          <UnlockOutlined style={{ fontSize: 22, color: '#8a4a8a' }} />
          <Title level={4} style={{ margin: 0 }}>권한 활성화 요청</Title>
        </Space>
        <Empty
          description="연결된 부모님 계정이 없습니다. 먼저 '연결 관리' 메뉴에서 초대를 수락해주세요."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  return (
    <div>
      <Space align="center" style={{ marginBottom: 6 }}>
        <UnlockOutlined style={{ fontSize: 22, color: '#8a4a8a' }} />
        <Title level={4} style={{ margin: 0 }}>권한 활성화 요청</Title>
      </Space>
      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 24 }}>
        사망진단서 등의 증빙서류를 업로드하여 관리자 승인을 요청하세요.
      </Text>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="개인정보 보호 안내"
        description="업로드된 증빙서류는 관리자만 열람 가능하며, 승인 및 검토 목적으로만 사용됩니다."
      />

      {connections.map((conn) => {
        const status = STATUS_MAP[conn.status] || STATUS_MAP.ACCEPTED
        return (
          <Card key={conn._id} style={{ marginBottom: 16, borderRadius: 14 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Space>
                <Avatar icon={<TeamOutlined />} style={{ background: '#4a7c59' }} />
                <div>
                  <Text strong>{conn.parentId?.name || '부모님'}</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                    {conn.parentId?.email}
                  </Text>
                </div>
              </Space>
              <Tag color={status.color}>{status.label}</Tag>
            </Space>

            {/* 진행 단계 표시 */}
            <Steps
              size="small"
              current={status.step}
              style={{ margin: '16px 0' }}
              items={[
                { title: '연결', icon: <TeamOutlined /> },
                { title: '서류 제출', icon: <FileProtectOutlined /> },
                { title: '관리자 검토', icon: <ClockCircleOutlined /> },
                { title: '활성화', icon: <CheckCircleOutlined /> },
              ]}
            />

            {/* ACCEPTED: 서류 업로드 폼 */}
            {conn.status === 'ACCEPTED' && (
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                  📎 증빙서류 (사망진단서, 사망확인서 등 JPG/PNG/PDF - 최대 10MB)
                </Text>
                <Space wrap>
                  <Upload
                    beforeUpload={(file) => {
                      setFileMap((prev) => ({ ...prev, [conn._id]: file }))
                      return false // 자동 업로드 방지
                    }}
                    maxCount={1}
                    showUploadList={{ showRemoveIcon: true }}
                    onRemove={() => setFileMap((prev) => ({ ...prev, [conn._id]: null }))}
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                  >
                    <Button icon={<UploadOutlined />}>파일 선택</Button>
                  </Upload>
                  <Button
                    type="primary"
                    danger
                    onClick={() => handleRequestUnlock(conn._id)}
                    loading={uploading[conn._id]}
                    disabled={!fileMap[conn._id]}
                  >
                    활성화 요청 제출
                  </Button>
                </Space>
              </div>
            )}

            {/* REQUESTED: 검토 대기 중 안내 */}
            {conn.status === 'REQUESTED' && (
              <Alert
                type="warning"
                showIcon
                icon={<ClockCircleOutlined />}
                message={`제출된 서류 파일: ${conn.proofDocumentName || '파일 있음'}`}
                description="관리자가 서류를 검토 중입니다. 승인 후 알림을 확인하세요."
                style={{ marginTop: 12 }}
              />
            )}

            {/* ACTIVE: 활성화 완료 */}
            {conn.status === 'ACTIVE' && (
              <Alert
                type="success"
                showIcon
                message="활성화 완료! 이제 '부고 문자' 메뉴에서 연락처를 사용할 수 있습니다."
                style={{ marginTop: 12 }}
              />
            )}

            {/* REJECTED: 거절 안내 */}
            {conn.status === 'REJECTED' && (
              <Alert
                type="error"
                showIcon
                message={`요청이 거절되었습니다. ${conn.adminNote ? `사유: ${conn.adminNote}` : ''}`}
                description="서류를 다시 확인하고 재신청해주세요."
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default UnlockRequestPage
