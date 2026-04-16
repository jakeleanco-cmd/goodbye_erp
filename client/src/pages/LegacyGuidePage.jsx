import React, { useState, useEffect } from 'react'
import { 
  Card, Typography, Space, Button, Modal, 
  Form, Input, message, Tag, Row, Col, Upload, Empty 
} from 'antd'
import { 
  SolutionOutlined, PlusOutlined, DeleteOutlined, 
  PaperClipOutlined, FilePdfOutlined, FileImageOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import api from '../api/axios'

const { Title, Text } = Typography
const { TextArea } = Input

/**
 * 디지털 자산 가이드 (LegacyGuide) 관리 페이지
 * - 구독 서비스, 중요 서류 보관 위치 등을 기록
 * - 이미지 및 PDF 업로드 지원
 */
function LegacyGuidePage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [fileList, setFileList] = useState([])
  const [form] = Form.useForm()

  const CATEGORIES = [
    { label: '구독 서비스', value: '구독', color: 'blue' },
    { label: '금융/계좌', value: '금융', color: 'green' },
    { label: '중요 서류', value: '서류', color: 'orange' },
    { label: '기타 가이드', value: '기타', color: 'default' },
  ]

  const fetchGuides = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/legacy/guides')
      setGuides(data)
    } catch (err) {
      message.error('가이드 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuides()
  }, [])

  // 저장 처리
  const handleSave = async (values) => {
    try {
      const formData = new FormData()
      formData.append('category', values.category)
      formData.append('title', values.title)
      formData.append('content', values.content || '')
      
      if (fileList.length > 0) {
        formData.append('guideFile', fileList[0].originFileObj)
      }

      await api.post('/legacy/guides', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      message.success('새로운 가이드가 저장되었습니다.')
      setModalOpen(false)
      setFileList([])
      form.resetFields()
      fetchGuides()
    } catch (err) {
      message.error('가이드 저장에 실패했습니다.')
    }
  }

  // 삭제 처리
  const handleDelete = async (id) => {
    try {
      await api.delete(`/legacy/guides/${id}`)
      message.success('가이드가 삭제되었습니다.')
      fetchGuides()
    } catch (err) {
      message.error('가이드 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="page-fade-in">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4}>
              <SolutionOutlined style={{ marginRight: 8, color: 'var(--primary)' }} />
              디지털 자산 & 서류 가이드
            </Title>
            <Text type="secondary">
              잊기 쉬운 구독 서비스나 중요 서류의 보관 위치를 자녀를 위해 기록해 보세요.
            </Text>
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            가이드 추가
          </Button>
        </Col>
      </Row>

      {guides.length === 0 ? (
        <Card style={{ borderRadius: 16, padding: '40px 0' }}>
          <Empty description="등록된 가이드가 없습니다." />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {guides.map(guide => (
            <Col xs={24} md={12} lg={8} key={guide._id}>
              <Card 
                className="glass-panel"
                hoverable
                style={{ borderRadius: 16, height: '100%' }}
                title={<Tag color={CATEGORIES.find(c => c.value === guide.category)?.color}>{guide.category}</Tag>}
                extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(guide._id)} />}
              >
                <Title level={5}>{guide.title}</Title>
                <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#666', marginBottom: 16 }}>
                  {guide.content}
                </Paragraph>
                
                {guide.fileUrl && (
                  <div style={{ 
                    background: '#f9f9f9', 
                    padding: '8px 12px', 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12
                  }}>
                    {guide.fileName?.toLowerCase().endsWith('.pdf') ? <FilePdfOutlined /> : <FileImageOutlined />}
                    <Text type="secondary" ellipsis>{guide.fileName}</Text>
                    <a href={guide.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>열람</a>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 가이드 추가 모달 */}
      <Modal
        title="자산 가이드 작성"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="저장"
        cancelText="취소"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item 
            name="category" 
            label="카테고리" 
            initialValue="기타"
            rules={[{ required: true }]}
          >
            <Row gutter={8}>
              {CATEGORIES.map(c => (
                <Col span={6} key={c.value}>
                  <Card 
                    size="small" 
                    hoverable 
                    onClick={() => form.setFieldsValue({ category: c.value })}
                    style={{ 
                      textAlign: 'center', 
                      background: form.getFieldValue('category') === c.value ? '#f0f7f2' : '#fff',
                      borderColor: form.getFieldValue('category') === c.value ? 'var(--primary)' : '#d9d9d9'
                    }}
                  >
                    <Text style={{ fontSize: 11 }}>{c.label}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Form.Item>

          <Form.Item 
            name="title" 
            label="제목" 
            rules={[{ required: true, message: '제목을 입력해주세요.' }]}
          >
            <Input placeholder="예: 넷플릭스 구독 정보, 집 서류 보관 위치" />
          </Form.Item>

          <Form.Item name="content" label="내용">
            <TextArea rows={4} placeholder="상세한 가이드를 입력해 주세요." />
          </Form.Item>

          <Form.Item label="첨부 파일 (이미지 또는 PDF)">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<PaperClipOutlined />}>파일 선택</Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              <InfoCircleOutlined /> 고지서 사진이나 스캔한 서류를 첨부하면 더 명확히 전달할 수 있습니다.
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LegacyGuidePage
