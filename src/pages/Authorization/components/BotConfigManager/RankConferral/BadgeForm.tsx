import React, { useEffect } from 'react';
import { Form, message } from 'antd';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';

interface BadgeFormProps {
  open: boolean;
  onCancel: () => void;
  currentRow: any;
  editingRecord?: any;
  onSuccess: () => void;
}

const BadgeForm: React.FC<BadgeFormProps> = ({
  open,
  onCancel,
  currentRow,
  editingRecord,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          title: editingRecord.title,
          threshold: editingRecord.threshold,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingRecord, form]);

  const handleSubmit = async (values: any) => {
    const hide = message.loading(editingRecord ? '更新中...' : '添加中...');
    try {
      if (editingRecord) {
        await updateItem(`/badges/${editingRecord._id}`, values);
      } else {
        await addItem('/badges', { ...values, bot: currentRow._id });
      }
      hide();
      message.success(editingRecord ? '更新成功' : '添加成功');
      form.resetFields();
      onSuccess();
      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message ?? '操作失败，请重试');
      return false;
    }
  };

  return (
    <ModalForm
      title={editingRecord ? '编辑称号' : '添加称号'}
      open={open}
      form={form}
      width={480}
      modalProps={{
        destroyOnClose: true,
        onCancel,
      }}
      onFinish={handleSubmit}
    >
      <ProFormText
        name="title"
        label="称号名称"
        width="md"
        placeholder="例如：新人 / 🌟 活跃成员 / 💎 钻石会员"
        rules={[{ required: true, message: '请输入称号名称' }]}
        tooltip="支持 emoji，例如 🥇 传奇"
      />
      <ProFormDigit
        name="threshold"
        label="积分门槛"
        width="md"
        min={0}
        placeholder="用户累计积分达到此值时授予该称号"
        rules={[{ required: true, message: '请输入积分门槛' }]}
        tooltip="用户积分 ≥ 此值时自动匹配该称号，多个称号取最高匹配"
        fieldProps={{ precision: 0 }}
      />
    </ModalForm>
  );
};

export default BadgeForm;
