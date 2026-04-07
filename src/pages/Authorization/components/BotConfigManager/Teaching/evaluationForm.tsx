import React, { useEffect } from 'react';
import { Modal, Form, Input, Rate, Descriptions, Image, Space, Tag, Button, Switch } from 'antd';
import dayjs from 'dayjs';
import MyUpload from '@/components/Upload';
import TeacherSelect from './teacherSelect';

export const getEvaluationColumns = (
  setCurrentEval: (record: any) => void,
  setAuditModalVisible: (visible: boolean) => void,
  handleDelete?: (id: string) => void,
) => [
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
      <Space>
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
        {handleDelete && (
          <Button type="link" danger size="small" onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        )}
      </Space>
    ),
  },
];

interface EvaluationFormProps {
  open: boolean;
  onCancel: () => void;
  onApprove?: (id: string, remark: string) => void;
  onReject?: (id: string, remark: string) => void;
  onSubmit?: (values: any) => void;
  evaluation: any;
  loading?: boolean;
  teachers?: any[];
  mode?: 'audit' | 'add';
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  open,
  onCancel,
  onApprove,
  onReject,
  onSubmit,
  evaluation,
  loading,
  teachers = [],
  mode = 'audit',
}) => {
  const [form] = Form.useForm();

  console.log('teachers', teachers);

  useEffect(() => {
    if (open) {
      if (mode === 'audit' && evaluation) {
        form.setFieldsValue({ remark: evaluation.remark || '' });
      } else if (mode === 'add') {
        form.resetFields();
      }
    }
  }, [open, evaluation, mode]);

  if (mode === 'audit') {
    if (!evaluation) return null;
    return (
      <Modal
        title="评价审核"
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            取消
          </Button>,
          <Button
            key="reject"
            danger
            loading={loading}
            onClick={async () => {
              const values = await form.validateFields();
              onReject?.(evaluation._id, values.remark);
            }}
          >
            拒绝
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={loading}
            onClick={async () => {
              const values = await form.validateFields();
              onApprove?.(evaluation._id, values.remark);
            }}
          >
            通过
          </Button>,
        ]}
        width={700}
      >
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="评价人">
            {evaluation.reviewer?.userName
              ? `@${evaluation.reviewer.userName}`
              : `${evaluation.reviewer?.firstName || ''} ${
                  evaluation.reviewer?.lastName || ''
                }`.trim() || '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="被评老师">
            {evaluation.teacher?.display_name || '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="人照评分">
            <Rate disabled defaultValue={evaluation.avatar_rating} />
          </Descriptions.Item>
          <Descriptions.Item label="颜值评分">
            <Rate disabled defaultValue={evaluation.appearance_rating} />
          </Descriptions.Item>
          <Descriptions.Item label="身材评分">
            <Rate disabled defaultValue={evaluation.body_rating} />
          </Descriptions.Item>
          <Descriptions.Item label="服务评分">
            <Rate disabled defaultValue={evaluation.service_rating} />
          </Descriptions.Item>
          <Descriptions.Item label="态度评分">
            <Rate disabled defaultValue={evaluation.attitude_rating} />
          </Descriptions.Item>
          <Descriptions.Item label="环境评分">
            <Rate disabled defaultValue={evaluation.circumstance_rating} />
          </Descriptions.Item>
          <Descriptions.Item label="匿名展示" span={2}>
            <Tag color={evaluation.isReportedAnoymously ? 'blue' : 'default'}>
              {evaluation.isReportedAnoymously ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="过程描述" span={2}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{evaluation.process_desc}</div>
          </Descriptions.Item>
          <Descriptions.Item label="证明媒体" span={2}>
            {evaluation.proof_media && evaluation.proof_media.length > 0 ? (
              <Image.PreviewGroup>
                <Space wrap>
                  {evaluation.proof_media.map((media: string, index: number) => {
                    if (media.startsWith('file_id:'))
                      return <Tag key={index}>Telegram File: {media}</Tag>;
                    return (
                      <Image
                        key={index}
                        src={media}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover' }}
                      />
                    );
                  })}
                </Space>
              </Image.PreviewGroup>
            ) : (
              '无'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="remark" label="审核备注" rules={[{ required: false }]}>
            <Input.TextArea rows={3} placeholder="请输入给用户的审核反馈（可选）..." />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  return (
    <Modal
      title="添加评价"
      open={open}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        onSubmit?.(values);
      }}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          avatar_rating: 5,
          appearance_rating: 5,
          body_rating: 5,
          service_rating: 5,
          attitude_rating: 5,
          circumstance_rating: 5,
          isReportedAnoymously: false,
        }}
      >
        <Form.Item
          name="teacherId"
          label="被评老师"
          rules={[{ required: true, message: '请选择老师' }]}
        >
          <TeacherSelect botId={evaluation?.bot?._id || evaluation?.bot} />
        </Form.Item>

        <Space wrap size={[16, 0]}>
          <Form.Item name="avatar_rating" label="人照评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="appearance_rating" label="颜值评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="body_rating" label="身材评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="service_rating" label="服务评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="attitude_rating" label="态度评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="circumstance_rating" label="环境评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
        </Space>

        <Form.Item name="isReportedAnoymously" label="匿名展示" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="process_desc"
          label="过程描述"
          rules={[{ required: true, message: '请输入过程描述' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入详细的补习过程描述..." />
        </Form.Item>

        <Form.Item label="证明媒体" name="proof_media">
          <MyUpload
            multiple
            accept="image/*,video/*"
            onFileUpload={(url) => {
              const currentMedia = form.getFieldValue('proof_media') || [];
              form.setFieldsValue({ proof_media: [...currentMedia, url] });
            }}
            onRemove={(file: any) => {
              const url = file.url || file.response?.data?.file;
              const currentMedia = form.getFieldValue('proof_media') || [];
              form.setFieldsValue({
                proof_media: currentMedia.filter((i: string) => i !== url),
              });
              return true;
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EvaluationForm;
