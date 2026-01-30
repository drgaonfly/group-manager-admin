import { useIntl } from '@umijs/max';
import React from 'react';
import { ModalForm, ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { addItem } from '@/services/ant-design-pro/api';
import { FormattedMessage } from '@umijs/max';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any;
  onSuccess: () => void;
}

const CheckinRuleForm: React.FC<Props> = ({ open, onOpenChange, currentRow, onSuccess }) => {
  const intl = useIntl();
  const [successContent, setSuccessContent] = React.useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
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

      await addItem('/checkin-rules', formData);

      hide();
      message.success(<FormattedMessage id="add_successful" defaultMessage="添加成功" />);
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
      title={intl.formatMessage({ id: 'add_checkin_rule', defaultMessage: '添加签到规则' })}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
          setSuccessContent('');
        }
        onOpenChange(visible);
      }}
      form={form}
      width={700}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={handleSubmit}
      initialValues={{
        type: 'daily',
        reward: 10,
        keywords: '签到',
      }}
    >
      <ProFormSelect
        name="type"
        label="签到类型"
        width="md"
        rules={[{ required: true, message: '请选择签到类型' }]}
        options={[
          { label: '每日签到', value: 'daily' },
          { label: '初次签到', value: 'first' },
        ]}
        tooltip="每日签到：每天可签到一次；初次签到：用户首次签到"
      />

      <ProFormDigit
        name="reward"
        label="奖励积分"
        width="md"
        min={1}
        rules={[{ required: true, message: '请输入奖励积分' }]}
        tooltip="用户签到成功后获得的积分数量"
        fieldProps={{ precision: 0 }}
      />

      <ProFormText
        name="keywords"
        label="触发关键词"
        width="lg"
        rules={[{ required: true, message: '请输入触发关键词' }]}
        placeholder="多个关键词用逗号分隔"
        tooltip="用户发送这些关键词时触发签到"
      />

      <Form.Item label="签到成功提示" required style={{ marginBottom: 24 }}>
        <RichTextEditor
          value={successContent}
          onChange={setSuccessContent}
          placeholder="请输入签到成功后的提示内容，支持富文本格式和变量..."
          height={150}
          variables="withUser"
        />
      </Form.Item>
    </ModalForm>
  );
};

export default CheckinRuleForm;
