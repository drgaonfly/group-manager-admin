import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Switch, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryList, updateItem, removeItem } from '@/services/ant-design-pro/api';
import CheckinRuleForm from './CheckinRuleForm';

interface CheckinRuleTabProps {
  currentRow: any;
  onDataChange?: () => void;
}

const CheckinRuleTab: React.FC<CheckinRuleTabProps> = ({ currentRow, onDataChange }) => {
  const [checkinRules, setCheckinRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    try {
      const response = await queryList(
        '/checkin-rules',
        { current: 1, pageSize: 100, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data) {
        setCheckinRules(response.data);
      }
    } catch (error) {
      console.error('获取签到规则失败:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentRow?._id]);

  const handleDelete = async (id: string) => {
    try {
      await removeItem('/checkin-rules', { ids: [id] });
      message.success('删除成功');
      fetchData();
      onDataChange?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '删除失败');
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/checkin-rules/${record._id}`, { isOnline });
      message.success('状态更新成功');
      fetchData();
      onDataChange?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '更新失败');
    }
  };

  const columns = [
    {
      title: '签到类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          daily: { text: '每日签到', color: 'blue' },
          first: { text: '初次签到', color: 'green' },
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '奖励积分',
      dataIndex: 'reward',
      width: 100,
      render: (reward: number) => <Tag color="orange">{reward} 积分</Tag>,
    },
    {
      title: '触发关键词',
      dataIndex: 'keywords',
      width: 150,
      render: (keywords: string[]) => {
        const arr = Array.isArray(keywords) ? keywords : [keywords];
        return (
          <Space wrap size={[4, 4]}>
            {arr.slice(0, 3).map((k, idx) => (
              <Tag key={idx} color="blue">
                {k}
              </Tag>
            ))}
            {arr.length > 3 && <Tag>+{arr.length - 3}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '成功提示',
      dataIndex: 'success_content',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div
          style={{ maxWidth: 200 }}
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.isOnline}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: any) => (
        <Space size={0}>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          新建
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={checkinRules}
        rowKey="_id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 700 }}
      />

      <CheckinRuleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={currentRow}
        onSuccess={() => {
          setFormOpen(false);
          message.success('签到规则添加成功');
          fetchData();
          onDataChange?.();
        }}
      />
    </div>
  );
};

export default CheckinRuleTab;
