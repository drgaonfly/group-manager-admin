import React, { useState, useEffect } from 'react';
import { Card, Table, Empty, Button, message, Space, Switch, Tag, Popconfirm } from 'antd';
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryList, removeItem, updateItem, addItem } from '@/services/ant-design-pro/api';
import AdRemovalForm from './AdRemovalForm';

interface AdRemovalTabProps {
  currentRow: any;
}

const AdRemovalTab: React.FC<AdRemovalTabProps> = ({ currentRow }) => {
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
      }
    } catch (error) {
      console.error('Failed to delete ad removal:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (record: any, checked: boolean) => {
    try {
      const res = await updateItem(`/ad-removals/${record._id}`, { isOnline: checked });
      if ((res as any)?.success) {
        message.success('状态更新成功');
        fetchList();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (val: string) =>
        val === 'all' ? <Tag color="blue">全部命中</Tag> : <Tag color="green">任意命中</Tag>,
    },
    {
      title: '关键词数量',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: any[]) => keywords?.length || 0,
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (checked: boolean, record: any) => (
        <Switch
          checked={checked}
          size="small"
          onChange={(val) => handleStatusChange(record, val)}
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
      title="广告拦截规则"
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
      />
    </Card>
  );
};

export default AdRemovalTab;
