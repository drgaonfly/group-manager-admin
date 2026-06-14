import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Table,
  Space,
  Switch,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryList, updateItem, addItem } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import AdRemovalForm from './AdRemovalForm';
import { formatDuration } from './DurationInput';

interface Props {
  open: boolean;
  onClose: () => void;
  bot: any;
  group: any;
}

const AdRemovalGroupModal: React.FC<Props> = ({ open, onClose, bot, group }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  const fetchData = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await queryList('/ad-removals', { botId: bot._id, groupId: group._id });
      if (res?.success) setData(res.data || []);
    } catch {
      message.error('获取广告拦截规则失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, bot?._id, group?._id]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      let res;
      if (currentRecord?._id) {
        res = await updateItem(`/ad-removals/${currentRecord._id}`, values);
      } else {
        res = await addItem('/ad-removals', { ...values, bot: bot._id, group: group._id });
      }
      if ((res as any)?.success) {
        message.success(currentRecord?._id ? '更新成功' : '添加成功');
        setModalVisible(false);
        fetchData();
      }
    } catch {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request(`/ad-removals/${id}`, { method: 'DELETE' });
      if ((res as any)?.success) {
        message.success('删除成功');
        fetchData();
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      const res = await updateItem(`/ad-removals/${record._id}`, { isOnline });
      if ((res as any)?.success) {
        message.success('更新成功');
        fetchData();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const renderPunishment = (punishment: any, record: any) => {
    const warning = record?.warning;
    const warningCount = warning?.count ?? 0;
    const warningTag =
      warningCount > 0 ? (
        <Tooltip
          title={`警告 ${warningCount} 次后处罚，时间窗口 ${formatDuration(
            warning?.windowSeconds ?? 0,
          )}`}
        >
          <Tag color="gold" style={{ marginRight: 4 }}>
            警告×{warningCount}
          </Tag>
        </Tooltip>
      ) : null;

    if (!punishment?.type)
      return (
        <>
          {warningTag}
          <Tag>仅删除</Tag>
        </>
      );
    if (punishment.type === 'kick')
      return (
        <>
          {warningTag}
          <Tag color="red">踢出群</Tag>
        </>
      );
    if (punishment.type === 'mute') {
      const sec = punishment.muteDuration ?? 0;
      const label = formatDuration(sec);
      return (
        <>
          {warningTag}
          <Tooltip title={`禁言 ${punishment.muteDuration} 秒`}>
            <Tag color="orange">禁言 {label}</Tag>
          </Tooltip>
        </>
      );
    }
    return (
      <>
        {warningTag}
        <Tag>仅删除</Tag>
      </>
    );
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    {
      title: '行内模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (val: string) =>
        val === 'all' ? <Tag color="blue">全部词</Tag> : <Tag color="green">任意词</Tag>,
    },
    {
      title: '关键词行数',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[][]) => {
        const lines = keywords?.length || 0;
        const total = keywords?.reduce((s, l) => s + (l?.length || 0), 0) || 0;
        return (
          <Tooltip title={`共 ${lines} 行，${total} 个词`}>
            <span>{lines} 行</span>
          </Tooltip>
        );
      },
    },
    {
      title: '处罚',
      dataIndex: 'punishment',
      key: 'punishment',
      render: (p: any, r: any) => renderPunishment(p, r),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (checked: boolean, record: any) => (
        <Switch checked={checked} size="small" onChange={(v) => handleStatusChange(record, v)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRecord(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`去除广告 — ${group?.title}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={860}
        destroyOnClose
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="去除广告功能需要机器人在目标群组中拥有「删除消息」管理员权限。"
        />
        <div style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentRecord(null);
              setModalVisible(true);
            }}
          >
            添加规则
          </Button>
        </div>
        <Table
          rowKey="_id"
          dataSource={data}
          columns={columns}
          loading={loading}
          size="small"
          pagination={false}
        />
      </Modal>

      <AdRemovalForm
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        botId={bot?._id}
        // 群组已固定，Form 内不需要再选
        fixedGroupId={group?._id}
      />
    </>
  );
};

export default AdRemovalGroupModal;
