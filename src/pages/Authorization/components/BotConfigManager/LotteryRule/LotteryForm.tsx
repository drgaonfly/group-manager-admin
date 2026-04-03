import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
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
import RichTextEditor from '@/components/RichTextEditor';
import MyUpload from '@/components/MyUpload';

const { Option } = Select;

// 抽奖通知变量
const LOTTERY_VARIABLES: { key: string; label: string; desc?: string }[] = [
  { key: '{lotteryTitle}', label: '抽奖标题' },
  { key: '{goodsList}', label: '奖品内容' },
  { key: '{joinCondition}', label: '参与条件' },
  { key: '{openCondition}', label: '开奖条件' },
  { key: '{joinNum}', label: '已参与人数' },
  { key: '{currentBot}', label: '当前机器人', desc: '当前机器人的昵称' },
];

// 开奖通知变量
const DRAW_RESULT_VARIABLES: { key: string; label: string; desc?: string }[] = [
  { key: '{lotteryTitle}', label: '抽奖标题' },
  { key: '{winnerList}', label: '中奖名单' },
  { key: '{joinNum}', label: '参与人数' },
  { key: '{openTime}', label: '开奖时间' },
  { key: '{currentBot}', label: '当前机器人', desc: '当前机器人的昵称' },
];

// 默认通知内容常量 (使用HTML格式的换行)
const DEFAULT_NOTIFY_CONTENT =
  '🎟️ {lotteryTitle}<br><br>🎫 参与条件:<br>{joinCondition}<br><br>🎁 奖品内容:<br>{goodsList}<br><br>⏰ 开奖方式:<br>{openCondition}';

const DEFAULT_JOIN_SUCCESS_CONTENT =
  '🎉 参与成功！<br><br>🎟️ 活动：{lotteryTitle}<br><br>🎁 奖品：<br>{goodsList}<br><br>祝您好运！';

const DEFAULT_DRAW_RESULT_CONTENT =
  '🎊 开奖结果公布<br><br>🎟️ 活动：{lotteryTitle}<br>当前参与人数: {joinNum}人<br><br>🏆 中奖名单：<br>{winnerList}<br><br>⏰ 开奖时间：{openTime}';

interface LotteryPrize {
  name: string;
  value: number;
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
        notifyContent: DEFAULT_NOTIFY_CONTENT,
        notifyButtons: [],
        joinSuccessContent: DEFAULT_JOIN_SUCCESS_CONTENT,
        joinSuccessButtons: [],
        drawResultContent: DEFAULT_DRAW_RESULT_CONTENT,
        drawResultButtons: [],
        notifyPin: false,
        joinSuccessPin: false,
        drawResultPin: false,
      });
    }
  }, [currentRow, form]);

  const handleSubmit = async () => {
    try {
      // 验证所有必需字段
      const requiredFields = [
        'title',
        'keywords',
        'prizes',
        'notifyContent',
        'joinSuccessContent',
        'drawResultContent',
        'drawMethod',
      ];

      for (const field of requiredFields) {
        const value = form.getFieldValue(field);
        if (!value || (Array.isArray(value) && value.length === 0)) {
          message.error(`请填写 ${field} 字段`);
          // 切换到对应步骤
          if (['title', 'keywords'].includes(field)) setCurrentStep(0);
          else if (field === 'prizes') setCurrentStep(1);
          else if (['notifyContent', 'joinSuccessContent', 'drawResultContent'].includes(field))
            setCurrentStep(2);
          else if (field === 'drawMethod') setCurrentStep(3);
          return;
        }
      }

      // 获取表单的所有值，包括所有步骤的字段
      const allValues = form.getFieldsValue(true);
      console.log('LotteryForm 提交的原始数据:', allValues);

      const submitData = {
        ...allValues,
        scheduledDrawTime: allValues.scheduledDrawTime?.toDate(),
      };
      console.log('LotteryForm 提交的处理后数据:', submitData);
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

  const handleMediaUpload = (url: string) => {
    // 简单判断媒体类型（可以根据URL或其他方式改进）
    const mediaType =
      url.includes('.mp4') || url.includes('.avi') || url.includes('.mov') ? 'video' : 'image';
    form.setFieldsValue({
      media: url,
      mediaType,
    });
    message.success('上传成功');
  };

  const handleMediaRemove = () => {
    form.setFieldsValue({
      media: undefined,
      mediaType: undefined,
    });
    return true; // 允许删除
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
        bot: currentRow?._id,
      }}
    >
      {/* 隐藏的 bot 字段 */}
      <Form.Item name="bot" hidden>
        <Input type="hidden" />
      </Form.Item>
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
            <MyUpload
              onFileUpload={handleMediaUpload}
              accept="image/*,video/*"
              url="/upload"
              onRemove={handleMediaRemove}
            />
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
                    description={`${prize.value}积分 x${prize.quantity}`}
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
            label="活动通知内容"
            rules={[{ required: true, message: '请输入活动通知内容' }]}
          >
            <Form.Item name="notifyContent" noStyle>
              <RichTextEditor
                placeholder="请输入活动通知内容，支持富文本格式和变量..."
                height={200}
                variables={LOTTERY_VARIABLES}
                showVariables={true}
              />
            </Form.Item>
          </Form.Item>

          <Form.Item name="notifyPin" valuePropName="checked">
            <span>置顶活动通知</span>
          </Form.Item>

          <Divider />

          <Form.Item
            label="参与成功通知内容"
            rules={[{ required: true, message: '请输入参与成功通知内容' }]}
          >
            <Form.Item name="joinSuccessContent" noStyle>
              <RichTextEditor
                placeholder="请输入参与成功通知内容，支持富文本格式和变量..."
                height={200}
                variables={LOTTERY_VARIABLES}
                showVariables={true}
              />
            </Form.Item>
          </Form.Item>

          <Form.Item name="joinSuccessPin" valuePropName="checked">
            <span>置顶参与成功通知</span>
          </Form.Item>

          <Divider />

          <Form.Item
            label="开奖通知内容"
            rules={[{ required: true, message: '请输入开奖通知内容' }]}
          >
            <Form.Item name="drawResultContent" noStyle>
              <RichTextEditor
                placeholder="请输入开奖通知内容，支持富文本格式和变量..."
                height={200}
                variables={DRAW_RESULT_VARIABLES}
                showVariables={true}
              />
            </Form.Item>
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
            name="value"
            label="积分数量"
            rules={[{ required: true, message: '请输入积分数量' }]}
          >
            <InputNumber min={0} />
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
