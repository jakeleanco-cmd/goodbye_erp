import React, { useState, useEffect } from 'react'
import { 
  Card, Typography, Space, Button, Form, Input, 
  message, Row, Col, Divider, Skeleton 
} from 'antd'
import { 
  CarryOutOutlined, HeartFilled, SaveOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons'
import api from '../api/axios'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

/**
 * 장례 희망 사항 (FuneralWish) 관리 페이지
 * - 부모님(PARENT)이 자신의 장례 방식에 대한 의사를 미리 기록
 */
function FuneralWishPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const fetchWish = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/legacy/funeral')
      if (data && data.userId) {
        form.setFieldsValue({
          religion: data.religion,
          flowers: data.flowers,
          additional: data.additional
        })
      }
    } catch (err) {
      message.error('장례 희망 사항을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWish()
  }, [])

  const handleSave = async (values) => {
    setSaving(true)
    try {
      await api.post('/legacy/funeral', values)
      message.success('장례 희망 사항이 저장되었습니다.')
    } catch (err) {
      message.error('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-fade-in">
      <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
        <Title level={4}>
          <CarryOutOutlined style={{ marginRight: 8, color: 'var(--primary)' }} />
          나의 장례 희망 사항
        </Title>
        <Text type="secondary">
          남겨진 가족들이 당황하지 않도록, 평소 바라던 장례 방식과 의사를 미리 남겨주세요.
        </Text>
      </Space>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card className="glass-panel" style={{ borderRadius: 20, boxShadow: 'var(--shadow-md)' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSave}
                requiredMark={false}
              >
                <div style={{ padding: '0 8px' }}>
                  <Title level={5}>종교 및 의식 방식</Title>
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                    희망하시는 종교 예법(기독교, 불교, 천주교, 유교 등)이 있다면 적어주세요.
                  </Paragraph>
                  <Form.Item name="religion">
                    <Input placeholder="예: 독실한 기독교 방식으로 진행되기를 원합니다." size="large" />
                  </Form.Item>

                  <Divider />

                  <Title level={5}>선호하는 꽃 및 장식</Title>
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                    장례 사단에 올릴 꽃의 종류나 색상에 대한 의견이 있으신가요?
                  </Paragraph>
                  <Form.Item name="flowers">
                    <Input placeholder="예: 국화 외에 평소 좋아하던 밝은 수국을 함께 놓아주세요." size="large" />
                  </Form.Item>

                  <Divider />

                  <Title level={5}>기타 남기고 싶은 희망 사항</Title>
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                    수의, 장지(매장/봉안), 또는 장례식에서 꼭 지켜졌으면 하는 분위기 등을 자유롭게 적어주세요.
                  </Paragraph>
                  <Form.Item name="additional">
                    <TextArea 
                      rows={6} 
                      placeholder="예: 조문객들이 너무 슬퍼하기보다 저와의 추억을 웃으며 나누는 분위기였으면 좋겠습니다. 장지는 꼭 선영 아래로 부탁한다." 
                    />
                  </Form.Item>

                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large" 
                      icon={<SaveOutlined />} 
                      loading={saving}
                      style={{ padding: '0 32px', borderRadius: 12, height: 48 }}
                    >
                      저장하기
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={<Space><InfoCircleOutlined style={{ color: 'var(--primary)' }} /><span>안내 사항</span></Space>}
            style={{ borderRadius: 16, border: '1px solid #f0f0f0' }}
          >
            <Paragraph style={{ fontSize: 14, color: '#666' }}>
              작성하신 내용은 수정 시마다 즉시 업데이트됩니다. 
            </Paragraph>
            <Paragraph style={{ fontSize: 14, color: '#666' }}>
              상속 자녀(수속자)가 활성화를 요청하고 관리자가 승인한 이후에만 이 내용이 자녀에게 공개됩니다. 
            </Paragraph>
            <Divider />
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <HeartFilled style={{ fontSize: 40, color: '#f5f5f5' }} />
              <div style={{ marginTop: 12, color: '#999', fontSize: 13 }}>
                가족을 사랑하는 마음으로<br/>편안하게 기록해 보세요.
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default FuneralWishPage
