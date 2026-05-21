import React, { useEffect, useState } from 'react';
import { message, Form, Button, InputNumber, Row, Col } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormGroup,
  ProFormSwitch,
} from '@ant-design/pro-components';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface Props {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow: any;
  editingRecord?: any;
  onSuccess: () => void;
}

interface StreakCycle {
  days: number;
  multiplier: number;
}

const CheckinRuleForm: React.FC<Props> = ({
  open,
  onCancel,
  currentRow,
  editingRecord,
  onSuccess,
}) => {
  const intl = useIntl();
  const [successContent, setSuccessContent] = React.useState('');
  const [form] = Form.useForm();
  const [enableStreakBonus, setEnableStreakBonus] = useState(false);
  const [streakCycles, setStreakCycles] = useState<StreakCycle[]>([
    { days: 3, multiplier: 2 },
    { days: 5, multiplier: 3 },
    { days: 10, multiplier: 4 },
  ]);
  const [maxMultiplier, setMaxMultiplier] = useState(4);

  // 处理编辑模式下的表单初始化
  useEffect(() => {
    if (open && editingRecord) {
      // 编辑模式：设置表单值
      form.setFieldsValue({
        type: editingRecord.type,
        reward: editingRecord.reward,
        keywords: Array.isArray(editingRecord.keywords)
          ? editingRecord.keywords.join('\n')
          : editingRecord.keywords,
        enableStreakBonus: editingRecord.enableStreakBonus || false,
        maxMultiplier: editingRecord.maxMultiplier || 4,
      });
      setSuccessContent(editingRecord.success_content || '');
      setEnableStreakBonus(editingRecord.enableStreakBonus || false);
      setStreakCycles(
        editingRecord.streakCycles || [
          { days: 3, multiplier: 2 },
          { days: 5, multiplier: 3 },
          { days: 10, multiplier: 4 },
        ],
      );
      setMaxMultiplier(editingRecord.maxMultiplier || 4);
    } else if (open && !editingRecord) {
      // 新建模式：重置表单
      form.resetFields();
      setSuccessContent('');
      setEnableStreakBonus(false);
      setStreakCycles([
        { days: 3, multiplier: 2 },
        { days: 5, multiplier: 3 },
        { days: 10, multiplier: 4 },
      ]);
      setMaxMultiplier(4);
    }
  }, [open, editingRecord, form]);

  const handleSubmit = async (values: any) => {
    const isEditing = !!editingRecord;
    const hide = message.loading(
      isEditing ? (
        <FormattedMessage id="updating" defaultMessage="更新中..." />
      ) : (
        <FormattedMessage id="adding" defaultMessage="添加中..." />
      ),
    );
    try {
      const telegramContent = convertToTelegramHtml(successContent);
      const keywordArray = (values.keywords || '')
        .split(/[,，\n]/)
        .map((k: string) => k.trim())
        .filter((k: string) => k);

      const formData = {
        ...values,
        keywords: keywordArray,
        success_content: telegramContent,
        bot: currentRow?._id,
        enableStreakBonus,
        streakCycles,
        maxMultiplier,
      };

      if (isEditing) {
        // 更新操作
        await updateItem(`/checkin-rules/${editingRecord._id}`, formData);
        hide();
        message.success(<FormattedMessage id="update_successful" defaultMessage="更新成功" />);
      } else {
        // 新建操作
        await addItem('/checkin-rules', formData);
        hide();
        message.success(<FormattedMessage id="add_successful" defaultMessage="添加成功" />);
      }

      onSuccess();
      form.resetFields();
      setSuccessContent('');
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="operation_failed" defaultMessage="操作失败，请重试" />
        ),
      );
      return false;
    }
  };

  const addStreakCycle = () => {
    setStreakCycles([...streakCycles, { days: 1, multiplier: 1 }]);
  };

  const removeStreakCycle = (index: number) => {
    const newCycles = [...streakCycles];
    newCycles.splice(index, 1);
    setStreakCycles(newCycles);
  };

  const updateStreakCycle = (index: number, field: keyof StreakCycle, value: number) => {
    const newCycles = [...streakCycles];
    newCycles[index] = { ...newCycles[index], [field]: value };
    setStreakCycles(newCycles);
  };

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'checkin_rule_config',
        defaultMessage: editingRecord ? '编辑签到规则' : '配置签到规则',
      })}
      open={open}
      form={form}
      width={900}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
      }}
      onFinish={handleSubmit}
      initialValues={{
        type: 'daily',
        reward: 10,
        keywords: '签到',
        enableStreakBonus: false,
        maxMultiplier: 4,
      }}
    >
      <ProFormGroup>
        <ProFormSelect
          name="type"
          label={intl.formatMessage({ id: 'checkin_type', defaultMessage: '签到类型' })}
          width="md"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'checkin_type_required',
                defaultMessage: '请选择签到类型',
              }),
            },
          ]}
          options={[
            {
              label: intl.formatMessage({ id: 'daily_checkin', defaultMessage: '每日签到' }),
              value: 'daily',
            },
            {
              label: intl.formatMessage({ id: 'first_checkin', defaultMessage: '初次签到' }),
              value: 'first',
            },
          ]}
          tooltip={intl.formatMessage({
            id: 'checkin_type_tooltip',
            defaultMessage: '每日签到：每天可签到一次；初次签到：用户首次签到',
          })}
        />

        <ProFormDigit
          name="reward"
          label={intl.formatMessage({ id: 'reward_points', defaultMessage: '奖励积分' })}
          width="md"
          min={1}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'reward_points_required',
                defaultMessage: '请输入奖励积分',
              }),
            },
          ]}
          tooltip={intl.formatMessage({
            id: 'reward_points_tooltip',
            defaultMessage: '用户签到成功后获得的积分数量',
          })}
          fieldProps={{ precision: 0 }}
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormText
          name="keywords"
          label={intl.formatMessage({ id: 'trigger_keywords', defaultMessage: '触发关键词' })}
          width="xl"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'trigger_keywords_required',
                defaultMessage: '请输入触发关键词',
              }),
            },
          ]}
          placeholder={intl.formatMessage({
            id: 'keywords_placeholder',
            defaultMessage: '多个关键词用逗号分隔',
          })}
          tooltip={intl.formatMessage({
            id: 'keywords_tooltip',
            defaultMessage: '用户发送这些关键词时触发签到',
          })}
        />
      </ProFormGroup>

      {/* 连续签到配置 */}
      <ProFormGroup>
        <ProFormSwitch
          name="enableStreakBonus"
          label={intl.formatMessage({
            id: 'enable_streak_bonus',
            defaultMessage: '启用连续签到奖励',
          })}
          fieldProps={{
            checked: enableStreakBonus,
            onChange: (checked) => setEnableStreakBonus(checked),
          }}
          tooltip={intl.formatMessage({
            id: 'streak_bonus_tooltip',
            defaultMessage: '开启后，连续签到天数越多，获得的积分倍率越高',
          })}
        />
      </ProFormGroup>

      {enableStreakBonus && (
        <>
          <Form.Item
            label={intl.formatMessage({ id: 'streak_cycles', defaultMessage: '连续签到周期配置' })}
            style={{ marginBottom: 16 }}
          >
            <div style={{ marginBottom: 8, color: '#666' }}>
              {intl.formatMessage({
                id: 'streak_cycles_desc',
                defaultMessage: '配置连续签到天数对应的倍率（按天数降序匹配）',
              })}
            </div>
            {streakCycles.map((cycle, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                <Col span={10}>
                  <InputNumber
                    placeholder={intl.formatMessage({ id: 'days', defaultMessage: '天数' })}
                    value={cycle.days}
                    onChange={(value) => updateStreakCycle(index, 'days', value || 1)}
                    min={1}
                    style={{ width: '100%' }}
                    addonAfter={intl.formatMessage({ id: 'days', defaultMessage: '天' })}
                  />
                </Col>
                <Col span={10}>
                  <InputNumber
                    placeholder={intl.formatMessage({ id: 'multiplier', defaultMessage: '倍率' })}
                    value={cycle.multiplier}
                    onChange={(value) => updateStreakCycle(index, 'multiplier', value || 1)}
                    min={1}
                    step={0.1}
                    style={{ width: '100%' }}
                    addonAfter={intl.formatMessage({ id: 'times', defaultMessage: '倍' })}
                  />
                </Col>
                <Col span={4}>
                  {streakCycles.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeStreakCycle(index)}
                    />
                  )}
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              onClick={addStreakCycle}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              {intl.formatMessage({ id: 'add_cycle', defaultMessage: '添加周期' })}
            </Button>
          </Form.Item>

          <ProFormGroup>
            <ProFormDigit
              name="maxMultiplier"
              label={intl.formatMessage({ id: 'max_multiplier', defaultMessage: '最高倍率限制' })}
              width="md"
              min={1}
              fieldProps={{
                value: maxMultiplier,
                onChange: (value) => setMaxMultiplier(value || 1),
                precision: 1,
              }}
              tooltip={intl.formatMessage({
                id: 'max_multiplier_tooltip',
                defaultMessage: '连续签到倍率最高不超过此值',
              })}
            />
          </ProFormGroup>
        </>
      )}

      <Form.Item
        label={intl.formatMessage({ id: 'success_message', defaultMessage: '签到成功提示' })}
        required
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={successContent}
          onChange={setSuccessContent}
          placeholder="请输入签到成功后的提示内容，支持富文本格式和变量..."
          height={150}
          variables="all"
        />
      </Form.Item>
    </ModalForm>
  );
};

export default CheckinRuleForm;
