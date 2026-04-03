import React, { useEffect } from 'react';
import { Modal, Form, Input, Rate, Descriptions, Image, Space, Tag, Button } from 'antd';
import dayjs from 'dayjs';

export const getEvaluationColumns = (
  setCurrentEval: (record: any) => void,
  setAuditModalVisible: (visible: boolean) => void,
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

interface EvaluationFormProps {
  open: boolean;
  onCancel: () => void;
  onApprove: (id: string, remark: string) => void;
  onReject: (id: string, remark: string) => void;
  evaluation: any;
  loading?: boolean;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  open,
  onCancel,
  onApprove,
  onReject,
  evaluation,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && evaluation) {
      form.setFieldsValue({ remark: evaluation.remark || '' });
    }
  }, [open, evaluation]);

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
            onReject(evaluation._id, values.remark);
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
            onApprove(evaluation._id, values.remark);
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
          {evaluation.teacher?.botUser?.userName || '未知'}
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
};

export default EvaluationForm;
