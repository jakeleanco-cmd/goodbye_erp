import React, { useState, useEffect } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space,
  Typography, Card, Popconfirm, message, Tooltip, Row, Col,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  PhoneOutlined, ContactsOutlined,
} from '@ant-design/icons'
import api from '../api/axios'

const { Title, Text } = Typography
const { Option } = Select

// 그룹별 색상 매핑
const GROUP_COLORS = {
  '가족': 'red', '친척': 'volcano', '고향친구': 'orange',
  '직장': 'blue', '종교': 'purple', '지인': 'green', '기타': 'default',
}
const GROUPS = Object.keys(GROUP_COLORS)

/**
 * 연락처 관리 페이지 (PARENT 전용)
 * - 연락처 CRUD, 그룹 필터링, 다중 삭제 지원
 */
function ContactsPage() {
  const [contacts, setContacts]       = useState([])
  const [loading, setLoading]         = useState(false)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState(null) // 수정 대상
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [form] = Form.useForm()

  // 연락처 목록 조회
  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = selectedGroup ? { group: selectedGroup } : {}
      const { data } = await api.get('/contacts', { params })
      setContacts(data)
    } catch (err) {
      message.error('연락처를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContacts() }, [selectedGroup])

  // 모달 열기 (신규 or 수정)
  const openModal = (record = null) => {
    setEditTarget(record)
    if (record) form.setFieldsValue(record)
    else form.resetFields()
    setModalOpen(true)
  }

  // 저장 (등록 or 수정)
  const handleSave = async (values) => {
    try {
      if (editTarget) {
        await api.put(`/contacts/${editTarget._id}`, values)
        message.success('연락처가 수정되었습니다.')
      } else {
        await api.post('/contacts', values)
        message.success('연락처가 등록되었습니다.')
      }
      setModalOpen(false)
      fetchContacts()
    } catch (err) {
      message.error(err.response?.data?.message || '저장에 실패했습니다.')
    }
  }

  // 단건 삭제
  const handleDelete = async (id) => {
    try {
      await api.delete(`/contacts/${id}`)
      message.success('삭제되었습니다.')
      fetchContacts()
    } catch {
      message.error('삭제에 실패했습니다.')
    }
  }

  // 일괄 삭제
  const handleBulkDelete = async () => {
    try {
      await api.delete('/contacts', { data: { ids: selectedRowKeys } })
      message.success(`${selectedRowKeys.length}개 삭제되었습니다.`)
      setSelectedRowKeys([])
      fetchContacts()
    } catch {
      message.error('일괄 삭제에 실패했습니다.')
    }
  }

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: '전화번호',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: '#4a7c59' }} />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: '그룹',
      dataIndex: 'group',
      key: 'group',
      render: (group) => <Tag color={GROUP_COLORS[group]}>{group}</Tag>,
    },
    {
      title: '메모',
      dataIndex: 'memo',
      key: 'memo',
      ellipsis: true,
      render: (memo) => memo || <Text type="secondary">-</Text>,
    },
    {
      title: '관리',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="수정">
            <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(record._id)} okText="삭제" cancelText="취소">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Space align="center">
            <ContactsOutlined style={{ fontSize: 22, color: '#4a7c59' }} />
            <Title level={4} style={{ margin: 0 }}>연락처 관리</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 2, fontSize: 13 }}>
            소중한 분들의 연락처를 그룹별로 정리하세요.
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            연락처 추가
          </Button>
        </Col>
      </Row>

      {/* 그룹 필터 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap>
          <Text type="secondary" style={{ fontSize: 13 }}>그룹 필터:</Text>
          <Button
            size="small"
            type={!selectedGroup ? 'primary' : 'default'}
            onClick={() => setSelectedGroup(null)}
          >
            전체 ({contacts.length})
          </Button>
          {GROUPS.map((g) => (
            <Button
              key={g}
              size="small"
              type={selectedGroup === g ? 'primary' : 'default'}
              onClick={() => setSelectedGroup(g)}
            >
              <Tag color={GROUP_COLORS[g]} style={{ margin: 0 }}>{g}</Tag>
            </Button>
          ))}
        </Space>
      </Card>

      {/* 다중 선택 삭제 */}
      {selectedRowKeys.length > 0 && (
        <Popconfirm
          title={`선택한 ${selectedRowKeys.length}개를 삭제하시겠습니까?`}
          onConfirm={handleBulkDelete}
          okText="삭제"
          cancelText="취소"
        >
          <Button danger style={{ marginBottom: 12 }}>
            선택 삭제 ({selectedRowKeys.length}개)
          </Button>
        </Popconfirm>
      )}

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={contacts}
        loading={loading}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        scroll={{ x: 600 }}
        pagination={{ pageSize: 15, showTotal: (t) => `총 ${t}명` }}
        style={{ borderRadius: 12, overflow: 'hidden' }}
      />

      {/* 연락처 등록/수정 모달 */}
      <Modal
        title={editTarget ? '연락처 수정' : '연락처 추가'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력하세요.' }]}>
            <Input placeholder="홍길동" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="전화번호" rules={[{ required: true, message: '전화번호를 입력하세요.' }]}>
            <Input placeholder="010-0000-0000" />
          </Form.Item>
          <Form.Item name="group" label="그룹" initialValue="지인" rules={[{ required: true }]}>
            <Select>
              {GROUPS.map((g) => <Option key={g} value={g}>{g}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="memo" label="메모 (선택)">
            <Input.TextArea placeholder="장례식 연락 시 유의사항 등을 적어두세요." rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>취소</Button>
              <Button type="primary" htmlType="submit">저장</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ContactsPage
