import React, { useState, useEffect } from 'react';
import { Button, Space, message, Tag, Card, Row, Col, Spin, Empty, Popconfirm, Modal } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryList } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import CheckinRuleForm from './CheckinRuleForm';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

type RuleType = 'daily' | 'first';

const TYPE_LABEL: Record<RuleType, string> = {
  daily: '每日签到',
  first: '初次签到',
};

const TYPE_COLOR: Record<RuleType, string> = {
  daily: 'blue',
  first: 'green',
};

const CheckinRuleGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [rules, setRules] = useState<Record<RuleType, any>>({ daily: null, first: null });
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<RuleType>('daily');
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchRules = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await queryList('/checkin-rules', {
        current: 1,
        pageSize: 10,
        botId: bot._id,
        groupId: group._id,
      });
      const data: any[] = res?.data || [];
      setRules({
        daily: data.find((r) => r.type === 'daily') ?? null,
        first: data.find((r) => r.type === 'first') ?? null,
      });
    } catch {
      message.error('获取签到规则失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchRules();
  }, [open, bot?._id, group?._id]);

  const handleEdit = (type: RuleType) => {
    setEditingType(type);
    setEditingRecord(rules[type]);
    setFormOpen(true);
  };

  const handleDelete = async (type: RuleType) => {
    const rule = rules[type];
    if (!rule?._id) return;
    try {
      await request(`/checkin-rules/${rule._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchRules();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord?._id) {
        await request(`/checkin-rules/${editingRecord._id}`, {
          method: 'PUT',
          data: { ...values, bot: bot._id, group: group._id },
        });
      } else {
        await request('/checkin-rules', {
          method: 'POST',
          data: { ...values, type: editingType, bot: bot._id, group: group._id },
        });
      }
      message.success(editingRecord ? '更新成功' : '创建成功');
      setFormOpen(false);
      fetchRules();
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || e.message || '操作失败');
    }
  };

  const renderRuleCard = (type: RuleType) => {
    const rule = rules[type];
    return (
      <Card
        key={type}
        size="small"
        title={
          <Space>
            <Tag color={TYPE_COLOR[type]}>{TYPE_LABEL[type]}</Tag>
            {rule ? (
              <Tag color={rule.isOnline ? 'success' : 'default'}>
                {rule.isOnline ? '启用' : '停用'}
              </Tag>
            ) : (
              <Tag color="default">未配置</Tag>
            )}
          </Space>
        }
        extra={
          rule ? (
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(type)}>
                编辑
              </Button>
              <Popconfirm
                title={`确定删除${TYPE_LABEL[type]}规则吗？`}
                onConfirm={() => handleDelete(type)}
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleEdit(type)}
            >
              配置
            </Button>
          )
        }
        style={{ marginBottom: 16 }}
      >
        {rule ? (
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <span style={{ color: '#888' }}>触发词：</span>
              {(rule.keywords || []).map((k: string, i: number) => (
                <Tag key={i}>{k}</Tag>
              ))}
            </Col>
            <Col span={6}>
              <span style={{ color: '#888' }}>奖励积分：</span>
              <strong>{rule.reward}</strong>
            </Col>
            <Col span={6}>
              <span style={{ color: '#888' }}>连续奖励：</span>
              {rule.enableStreakBonus ? <Tag color="blue">已启用</Tag> : <Tag>未启用</Tag>}
            </Col>
            {(rule.deleteAfterSeconds > 0 || rule.deleteUserMsgAfterSeconds > 0) && (
              <Col span={24}>
                <span style={{ color: '#888' }}>自动删除：</span>
                {rule.deleteAfterSeconds > 0 && (
                  <Tag color="orange">回复 {rule.deleteAfterSeconds}s</Tag>
                )}
                {rule.deleteUserMsgAfterSeconds > 0 && (
                  <Tag color="orange">用户消息 {rule.deleteUserMsgAfterSeconds}s</Tag>
                )}
              </Col>
            )}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`尚未配置${TYPE_LABEL[type]}规则`}
            style={{ margin: '8px 0' }}
          />
        )}
      </Card>
    );
  };

  return (
    <>
      <Spin spinning={loading}>
        {renderRuleCard('daily')}
        {renderRuleCard('first')}
      </Spin>

      <Modal
        title={`${editingRecord ? '编辑' : '配置'}${TYPE_LABEL[editingType]}规则 — ${group?.title}`}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 900 }}
        destroyOnClose
      >
        <CheckinRuleForm
          currentRow={bot}
          editingRecord={editingRecord ? editingRecord : { type: editingType }}
          fixedGroupId={group?._id}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </>
  );
};

export default CheckinRuleGroupContent;
