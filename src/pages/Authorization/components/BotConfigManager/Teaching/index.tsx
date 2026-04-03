import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Empty,
  Button,
  message,
  Popconfirm,
  Image,
  Modal,
  Tabs,
} from 'antd';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import EvaluationForm from './evaluationForm';

interface TeachingTabProps {
  currentRow: any;
}

const TeachingTab: React.FC<TeachingTabProps> = ({ currentRow }) => {
  const intl = useIntl();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('teachers');

  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [currentEval, setCurrentEval] = useState<any>(null);

  const fetchTeachers = async () => {
    if (!currentRow?._id) return;
    try {
      setLoading(true);
      const res = await queryList('/teachers', { botId: currentRow._id });
      if (res?.success) {
        setTeachers(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      message.error('获取老师列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async () => {
    if (!currentRow?._id) return;
    try {
      setLoading(true);
      const res = await queryList('/evaluations', { botId: currentRow._id });
      if (res?.success) {
        setEvaluations(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      message.error('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'teachers') {
      fetchTeachers();
    } else {
      fetchEvaluations();
    }
  }, [currentRow?._id, activeTab]);

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/teachers/${id}/approve`, {});
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已通过审核');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to approve teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/teachers/${id}/reject`, { remark: '未通过审核' });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('已拒绝申请');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to reject teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEvalApprove = async (id: string, remark: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/evaluations/${id}/approve`, { remark });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('评价已通过审核');
        setAuditModalVisible(false);
        fetchEvaluations();
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEvalReject = async (id: string, remark: string) => {
    try {
      setLoading(true);
      const res = await updateItem(`/evaluations/${id}/reject`, { remark });
      if ((res as any)?.success || (res as any)?.data) {
        message.success('评价已拒绝');
        setAuditModalVisible(false);
        fetchEvaluations();
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await removeItem(`/teachers/${id}`);
      if ((res as any)?.success || (res as any)?.data) {
        message.success('操作成功');
        fetchTeachers();
      }
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'teacher' }),
      dataIndex: 'botUser',
      key: 'botUser',
      render: (botUser: any) => {
        if (!botUser) return '未知';
        const name = botUser.userName
          ? `@${botUser.userName}`
          : `${botUser.firstName || ''} ${botUser.lastName || ''}`.trim();
        return name || '未知用户';
      },
    },
    {
      title: intl.formatMessage({ id: 'contact' }),
      dataIndex: 'contactLink',
      key: 'contactLink',
      width: 150,
      render: (link: string) =>
        link ? (
          <a href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: '简介',
      dataIndex: 'brief',
      key: 'brief',
      width: 300,
      render: (brief: string) => (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{brief || '-'}</div>
      ),
    },
    {
      title: '图片展示',
      dataIndex: 'images',
      key: 'images',
      width: 200,
      render: (images: string[]) =>
        images && images.length > 0 ? (
          <Image.PreviewGroup>
            <Space wrap size={[4, 4]}>
              {images.map((img: string, index: number) => (
                <Image
                  key={index}
                  src={img}
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover', borderRadius: '4px' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        ) : (
          '-'
        ),
    },
    {
      title: '视频展示',
      dataIndex: 'videos',
      key: 'videos',
      width: 150,
      render: (videos: string[]) =>
        videos && videos.length > 0 ? (
          <Space wrap size={[4, 4]}>
            {videos.map((video: string, index: number) => (
              <Button
                key={index}
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => setPreviewVideo(video)}
              >
                视频 {index + 1}
              </Button>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: intl.formatMessage({ id: 'isAvailable' }),
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>{available ? '可预约' : '忙碌'}</Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'reviews' }),
      dataIndex: 'reviews',
      key: 'reviewsCount',
      render: (reviews: any[]) => reviews?.length || 0,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status;
        if (status === 'approved') {
          color = 'success';
          text = '已通过';
        } else if (status === 'rejected') {
          color = 'error';
          text = '已拒绝';
        } else if (status === 'pending') {
          color = 'processing';
          text = '待审核';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'options' }),
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => handleApprove(record._id)}>
                通过
              </Button>
              <Button type="link" danger size="small" onClick={() => handleReject(record._id)}>
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title="确定要取消该老师的认证吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                取消认证
              </Button>
            </Popconfirm>
          )}
          {record.status === 'rejected' && (
            <Popconfirm
              title="确定要删除此条拒绝记录吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                删除记录
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const evalColumns = [
    {
      title: '评价人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      render: (u: any) =>
        u?.userName
          ? `@${u.userName}`
          : u
          ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
          : '未知',
    },
    {
      title: '被评老师',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (t: any) => t?.display_name,
    },
    {
      title: '评分 (人/颜/身/服/态/环)',
      key: 'ratings',
      render: (_: any, record: any) => (
        <span style={{ fontSize: '12px' }}>
          {record.avatar_rating * 2}/{record.appearance_rating * 2}/{record.body_rating * 2}/
          {record.service_rating * 2}/{record.attitude_rating * 2}/{record.circumstance_rating * 2}
        </span>
      ),
    },
    {
      title: '过程描述',
      dataIndex: 'process_desc',
      key: 'process_desc',
      ellipsis: true,
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status;
        if (status === 'approved') {
          color = 'success';
          text = '已通过';
        } else if (status === 'rejected') {
          color = 'error';
          text = '已拒绝';
        } else if (status === 'pending') {
          color = 'processing';
          text = '待审核';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setCurrentEval(record);
            setAuditModalVisible(true);
          }}
        >
          {record.status === 'pending' ? '审核' : '详情'}
        </Button>
      ),
    },
  ];

  return (
    <Card
      size="small"
      extra={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={activeTab === 'teachers' ? fetchTeachers : fetchEvaluations}
          loading={loading}
        >
          刷新
        </Button>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="认证老师" key="teachers">
          <Table
            dataSource={teachers}
            columns={columns}
            rowKey="_id"
            size="small"
            loading={loading}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="暂无老师数据" /> }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="评价管理" key="evaluations">
          <Table
            dataSource={evaluations}
            columns={evalColumns}
            rowKey="_id"
            size="small"
            loading={loading}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="暂无评价数据" /> }}
          />
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title="视频预览"
        open={!!previewVideo}
        onCancel={() => setPreviewVideo(null)}
        footer={null}
        destroyOnClose
        width={800}
        centered
      >
        {previewVideo && (
          <video src={previewVideo} controls autoPlay style={{ width: '100%', maxHeight: '70vh' }}>
            您的浏览器不支持 video 标签。
          </video>
        )}
      </Modal>

      <EvaluationForm
        open={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        evaluation={currentEval}
        onApprove={handleEvalApprove}
        onReject={handleEvalReject}
        loading={loading}
      />
    </Card>
  );
};

export default TeachingTab;
