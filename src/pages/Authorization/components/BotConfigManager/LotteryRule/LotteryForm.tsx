import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Upload,
  message,
  Card,
  List,
  Modal,
  InputNumber,
  Space,
  Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
// import { useIntl } from '@umijs/max';
import moment from 'moment';
import type { UploadProps } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

interface LotteryPrize {
  name: string;
  type: 'points' | 'custom';
  value: number | string;
  quantity: number;
}

interface NotifyButton {
  name: string;
  url: string;
  row: number;
}

interface LotteryFormData {
  title: string;
  keywords: string[];
  notifyContent: string;
  notifyButtons: NotifyButton[];
  notifyPin: boolean;
  media?: string;
  mediaType?: 'image' | 'video';
  joinSuccessContent: string;
  joinSuccessButtons: NotifyButton[];
  joinSuccessPin: boolean;
  drawResultContent: string;
  drawResultButtons: NotifyButton[];
  drawResultPin: boolean;
  drawMethod: ('fullParticipants' | 'scheduledTime')[];
  fullParticipantsCount?: number;
  scheduledDrawTime?: moment.Moment;
  prizes: LotteryPrize[];
}

interface LotteryFormProps {
  currentRow: any;
  onSubmit: (values: LotteryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const LotteryForm: React.FC<LotteryFormProps> = ({
  currentRow,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [prizeModalVisible, setPrizeModalVisible] = useState(false);
  const [editingPrizeIndex, setEditingPrizeIndex] = useState<number | null>(null);

  const [prizeForm] = Form.useForm();

  useEffect(() => {
    if (currentRow?._id) {
      // 编辑模式，加载现有数据
      const formData = {
        ...currentRow,
        scheduledDrawTime: currentRow.scheduledDrawTime
          ? moment(currentRow.scheduledDrawTime)
          : undefined,
      };
      form.setFieldsValue(formData);
    } else {
      // 新建模式，设置默认值
      form.setFieldsValue({
        keywords: ['抽奖'],
        drawMethod: ['fullParticipants'],
        prizes: [],
        notifyButtons: [],
        joinSuccessButtons: [],
        drawResultButtons: [],
        notifyPin: false,
        joinSuccessPin: false,
        drawResultPin: false,
      });
    }
  }, [currentRow, form]);

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        scheduledDrawTime: values.scheduledDrawTime?.toDate(),
      };
      await onSubmit(submitData);
      message.success('保存成功');
      onCancel();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  const addPrize = () => {
    setEditingPrizeIndex(null);
    prizeForm.resetFields();
    setPrizeModalVisible(true);
  };

  const editPrize = (index: number) => {
    const prizes = form.getFieldValue('prizes') || [];
    prizeForm.setFieldsValue(prizes[index]);
    setEditingPrizeIndex(index);
    setPrizeModalVisible(true);
  };

  const deletePrize = (index: number) => {
    const prizes = form.getFieldValue('prizes') || [];
    prizes.splice(index, 1);
    form.setFieldsValue({ prizes });
  };

  const handlePrizeSubmit = () => {
    prizeForm.validateFields().then((values) => {
      const prizes = form.getFieldValue('prizes') || [];
      if (editingPrizeIndex !== null) {
        prizes[editingPrizeIndex] = values;
      } else {
        prizes.push(values);
      }
      form.setFieldsValue({ prizes });
      setPrizeModalVisible(false);
      prizeForm.resetFields();
    });
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isValidType = file.type?.startsWith('image/') || file.type?.startsWith('video/');
      if (!isValidType) {
        message.error('只能上传图片或视频文件');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
        return false;
      }
      return false; // 阻止自动上传，由表单处理
    },
  };

  const steps = [
    { title: '基本信息', key: 'basic' },
    { title: '奖品设置', key: 'prizes' },
    { title: '通知设置', key: 'notifications' },
    { title: '开奖设置', key: 'draw' },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        keywords: ['抽奖'],
        drawMethod: ['fullParticipants'],
        prizes: [],
        notifyButtons: [],
        joinSuccessButtons: [],
        drawResultButtons: [],
      }}
    >
      {/* 步骤导航 */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          {steps.map((step, index) => (
            <Button
              key={step.key}
              type={currentStep === index ? 'primary' : 'default'}
              onClick={() => setCurrentStep(index)}
            >
              {step.title}
            </Button>
          ))}
        </Space>
      </div>

      {/* 步骤内容 */}
      {currentStep === 0 && (
        <Card title="基本信息">
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: '请输入活动标题' }]}
          >
            <Input placeholder="请输入抽奖活动标题" />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="触发关键词"
            rules={[{ required: true, message: '请设置触发关键词' }]}
          >
            <Select mode="tags" placeholder="输入关键词，按回车添加" />
          </Form.Item>

          <Form.Item name="media" label="媒体文件">
            <Upload {...uploadProps}>
              <Button icon={<PlusOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Card>
      )}

      {currentStep === 1 && (
        <Card
          title="奖品设置"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={addPrize}>
              添加奖品
            </Button>
          }
        >
          <Form.Item name="prizes">
            <List
              dataSource={form.getFieldValue('prizes') || []}
              renderItem={(prize: LotteryPrize, index) => (
                <List.Item
                  actions={[
                    <Button key="edit" icon={<EditOutlined />} onClick={() => editPrize(index)} />,
                    <Button
                      key="delete"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => deletePrize(index)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={prize.name}
                    description={`${
                      prize.type === 'points' ? `${prize.value}积分` : prize.value
                    } x${prize.quantity}`}
                  />
                </List.Item>
              )}
            />
          </Form.Item>
        </Card>
      )}

      {currentStep === 2 && (
        <Card title="通知设置">
          <Form.Item
            name="notifyContent"
            label="活动通知内容"
            rules={[{ required: true, message: '请输入活动通知内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="支持变量：{lotteryTitle}、{goodsList}、{joinCondition}、{openCondition}、{joinNum}"
            />
          </Form.Item>

          <Form.Item name="notifyPin" valuePropName="checked">
            <span>置顶活动通知</span>
          </Form.Item>

          <Divider />

          <Form.Item
            name="joinSuccessContent"
            label="参与成功通知内容"
            rules={[{ required: true, message: '请输入参与成功通知内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="支持变量：{lotteryTitle}、{goodsList}、{joinCondition}、{openCondition}、{joinNum}"
            />
          </Form.Item>

          <Form.Item name="joinSuccessPin" valuePropName="checked">
            <span>置顶参与成功通知</span>
          </Form.Item>

          <Divider />

          <Form.Item
            name="drawResultContent"
            label="开奖通知内容"
            rules={[{ required: true, message: '请输入开奖通知内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="支持变量：{lotteryTitle}、{winnerList}、{joinNum}、{openTime}"
            />
          </Form.Item>

          <Form.Item name="drawResultPin" valuePropName="checked">
            <span>置顶开奖通知</span>
          </Form.Item>
        </Card>
      )}

      {currentStep === 3 && (
        <Card title="开奖设置">
          <Form.Item
            name="drawMethod"
            label="开奖方式"
            rules={[{ required: true, message: '请选择开奖方式' }]}
          >
            <Select mode="multiple">
              <Option value="fullParticipants">满人开奖</Option>
              <Option value="scheduledTime">定时开奖</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues?.drawMethod !== currentValues?.drawMethod
            }
          >
            {({ getFieldValue }) => {
              const drawMethod = getFieldValue('drawMethod') || [];
              return (
                <>
                  {drawMethod.includes('fullParticipants') && (
                    <Form.Item
                      name="fullParticipantsCount"
                      label="满人开奖人数"
                      rules={[{ required: true, message: '请输入满人开奖人数' }]}
                    >
                      <InputNumber min={1} />
                    </Form.Item>
                  )}

                  {drawMethod.includes('scheduledTime') && (
                    <Form.Item
                      name="scheduledDrawTime"
                      label="定时开奖时间"
                      rules={[{ required: true, message: '请选择定时开奖时间' }]}
                    >
                      <DatePicker showTime />
                    </Form.Item>
                  )}
                </>
              );
            }}
          </Form.Item>
        </Card>
      )}

      {/* 操作按钮 */}
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Space>
      </div>

      {/* 奖品编辑模态框 */}
      <Modal
        title={editingPrizeIndex !== null ? '编辑奖品' : '添加奖品'}
        open={prizeModalVisible}
        onOk={handlePrizeSubmit}
        onCancel={() => setPrizeModalVisible(false)}
      >
        <Form form={prizeForm} layout="vertical">
          <Form.Item
            name="name"
            label="奖品名称"
            rules={[{ required: true, message: '请输入奖品名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="奖品类型"
            rules={[{ required: true, message: '请选择奖品类型' }]}
          >
            <Select>
              <Option value="points">积分</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues?.type !== currentValues?.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              return (
                <Form.Item
                  name="value"
                  label={type === 'points' ? '积分数量' : '奖品描述'}
                  rules={[{ required: true, message: '请输入奖品值' }]}
                >
                  {type === 'points' ? <InputNumber min={1} /> : <Input />}
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            name="quantity"
            label="奖品数量"
            rules={[{ required: true, message: '请输入奖品数量' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default LotteryForm;
