import React, { useState, useEffect } from 'react'
import { 
  Card, Table, Typography, Space, Button, Modal, 
  Form, Input, message, Tag, List, Avatar 
} from 'antd'
import { 
  MessageOutlined, UserOutlined, EditOutlined, 
  DeleteOutlined, PlusOutlined, MailOutlined 
} from '@ant-design/icons'
import api from '../api/axios'

const { Title, Text } = Typography
const { TextArea } = Input

/**
 * 마지막 편지 (LegacyMessage) 관리 페이지
 * - 부모님(PARENT)이 자신의 각 연락처별로 하나의 메시지를 남길 수 있음
 */
function LegacyMessagePage() {
  const [contacts, setContacts] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      // 연락처 및 이미 작성된 메시지 조회
      const [contRes, msgRes] = await Promise.all([
        api.get('/contacts'),
        api.get('/legacy/messages')
      ])
      setContacts(contRes.data)
      setMessages(msgRes.data)
    } catch (err) {
      message.error('데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 연락처별 작성 여부 체크
  const getMessageForContact = (contactId) => {
    return messages.find(m => m.contactId._id === contactId || m.contactId === contactId)
  }

  // 모달 열기
  const handleOpenModal = (contact) => {
    setSelectedContact(contact)
    const existingMsg = getMessageForContact(contact._id)
    form.setFieldsValue({
      content: existingMsg ? existingMsg.content : ''
    })
    setModalOpen(true)
  }

  // 저장 (UPSERT)
  const handleSave = async (values) => {
    try {
      await api.post('/legacy/messages', {
        contactId: selectedContact._id,
        content: values.content
      })
      message.success(`${selectedContact.name}님에게 남길 편지가 저장되었습니다.`)
      setModalOpen(false)
      fetchData()
    } catch (err) {
      message.error('편지 저장에 실패했습니다.')
    }
  }

  // 삭제
  const handleDelete = async (msgId) => {
    try {
      await api.delete(`/legacy/messages/${msgId}`)
      message.success('편지가 삭제되었습니다.')
      fetchData()
    } catch (err) {
      message.error('편지 삭제에 실패했습니다.')
    }
  }

  const columns = [
    {
      title: '연락처',
      key: 'contact',
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: '#4a7c59' }} />
          <div>
            <Text strong>{r.name}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{r.phoneNumber}</Text>
          </div>
        </Space>
      )
    },
    {
      title: '그룹',
      dataIndex: 'group',
      key: 'group',
      render: (g) => <Tag color="blue">{g}</Tag>
    },
    {
      title: '작성 상태',
      key: 'status',
      render: (_, r) => {
        const msg = getMessageForContact(r._id)
        return msg ? (
          <Tag color="success">작성 완료</Tag>
        ) : (
          <Tag color="default">미작성</Tag>
        )
      }
    },
    {
      title: '관리',
      key: 'action',
      render: (_, r) => {
        const msg = getMessageForContact(r._id)
        return (
          <Space>
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleOpenModal(r)}
            >
              {msg ? '수정' : '작성'}
            </Button>
            {msg && (
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />} 
                onClick={() => handleDelete(msg._id)}
              />
            )}
          </Space>
        )
      }
    }
  ]

  return (
    <div className="page-fade-in">
      <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
        <Title level={4}>
          <MailOutlined style={{ marginRight: 8, color: 'var(--primary)' }} />
          마지막 편지 남기기
        </Title>
        <Text type="secondary">
          소중한 분들에게 미처 하지 못한 말들을 남겨보세요. 상속이 활성화된 후 전달됩니다. (연락처당 1개)
        </Text>
      </Space>

      <Card className="glass-panel" style={{ borderRadius: 16 }}>
        <Table 
          columns={columns} 
          dataSource={contacts} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title={selectedContact ? `${selectedContact.name}님에게 보내는 편지` : '편지 작성'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="저장"
        cancelText="취소"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item 
            name="content" 
            label="메시지 내용" 
            rules={[{ required: true, message: '내용을 입력해주세요.' }]}
          >
            <TextArea 
              rows={8} 
              placeholder="여기에 진심을 담아 작성해 보세요. 이 편지는 오직 수신자로 지정된 분에게만 전달될 자격이 주어집니다." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LegacyMessagePage
