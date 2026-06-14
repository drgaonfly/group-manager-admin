import React, { useState, useEffect } from 'react';
import {
  Alert,
  Card,
  Table,
  Empty,
  Button,
  message,
  Space,
  Switch,
  Tag,
  Popconfirm,
  Tooltip,
} from 'antd';
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryList, removeItem, updateItem, addItem } from '@/services/ant-design-pro/api';
import AdRemovalForm from './AdRemovalForm';
import { formatDuration } from './DurationInput';

interface AdRemovalTabProps {
  currentRow: any;
  onBotUpdate?: (values: any) => Promise<void>;
}

const AdRemovalTab: React.FC<AdRemovalTabProps> = ({ currentRow, onBotUpdate }) => {
  console.log('AdRemovalTab - onBotUpdate:', onBotUpdate);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  const fetchList = async () => {
    if (!currentRow?._id) return;
    try {
      setLoading(true);
      const res = await queryList('/ad-removals', { botId: currentRow._id });
      if (res?.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch ad removals:', error);
      message.error('获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentRow?._id]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      let res;
      if (currentRecord?._id) {
        res = await updateItem(`/ad-removals/${currentRecord._id}`, values);
      } else {
        res = await addItem('/ad-removals', { ...values, bot: currentRow._id });
      }

      if ((res as any)?.success) {
        message.success(currentRecord?._id ? '更新成功' : '添加成功');
        setModalVisible(false);
        fetchList();
        // 通知父组件更新
        if (onBotUpdate) {
          console.log('AdRemovalTab - calling onBotUpdate after submit');
          await onBotUpdate({ _id: currentRow._id });
        }
      }
    } catch (error) {
      console.error('Failed to submit ad removal:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await removeItem(`/ad-removals/${id}`);
      if ((res as any)?.success) {
        message.success('删除成功');
        fetchList();
        // 通知父组件更新
        if (onBotUpdate) {
          console.log('AdRemovalTab - calling onBotUpdate after delete');
          await onBotUpdate({ _id: currentRow._id });
        }
      }
    } catch (error) {
      console.error('Failed to delete ad removal:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (record: any, data: any) => {
    try {
      const res = await updateItem(`/ad-removals/${record._id}`, data);
      if ((res as any)?.success) {
        message.success('更新成功');
        fetchList();
        // 通知父组件更新
        if (onBotUpdate) {
          console.log('AdRemovalTab - calling onBotUpdate after status change');
          await onBotUpdate({ _id: currentRow._id });
        }
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  /** 将处罚配置渲染成可读文字 */
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
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '适用群组',
      dataIndex: 'group',
      key: 'group',
      render: (group: any) => {
        if (!group) return <Tag color="default">全部群组</Tag>;
        const name = group?.title || group?.toString();
        return <Tag color="blue">{name}</Tag>;
      },
    },
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
        const total = keywords?.reduce((sum, line) => sum + (line?.length || 0), 0) || 0;
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
      render: (punishment: any, record: any) => renderPunishment(punishment, record),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (checked: boolean, record: any) => (
        <Switch
          checked={checked}
          size="small"
          onChange={(val) => handleStatusChange(record, { isOnline: val })}
        />
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
    <Card
      size="small"
      title="去除广告规则"
      extra={
        <Space>
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
          <Button icon={<ReloadOutlined />} onClick={fetchList} loading={loading}>
            刷新
          </Button>
        </Space>
      }
    >
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="权限提醒"
        description="去除广告功能需要机器人在目标群组中拥有「删除消息」管理员权限；若需执行禁言/踢出处罚，还需同时拥有「封禁用户」权限。请确保已在群组设置中将机器人设为管理员并开启对应权限，否则规则命中后将无法执行相应操作。"
      />
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        size="small"
        loading={loading}
        locale={{ emptyText: <Empty description="暂无拦截规则" /> }}
      />
      <AdRemovalForm
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        botId={currentRow?._id}
      />
    </Card>
  );
};

export default AdRemovalTab;
