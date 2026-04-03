import React, { useEffect } from 'react';
import { message, Form } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormGroup,
} from '@ant-design/pro-components';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';

interface Props {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow: any;
  editingRecord?: any;
  onSuccess: () => void;
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
      });
      setSuccessContent(editingRecord.success_content || '');
    } else if (open && !editingRecord) {
      // 新建模式：重置表单
      form.resetFields();
      setSuccessContent('');
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

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'checkin_rule_config',
        defaultMessage: editingRecord ? '编辑签到规则' : '配置签到规则',
      })}
      open={open}
      form={form}
      width={800}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
      }}
      onFinish={handleSubmit}
      initialValues={{
        type: 'daily',
        reward: 10,
        keywords: '签到',
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
