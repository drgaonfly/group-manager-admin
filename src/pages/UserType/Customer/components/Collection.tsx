import React, { useState } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { addItem } from '@/services/ant-design-pro/api';
interface WithdrawProps {
  open: boolean;
  onClose: () => void;
  currentRow?: API.ItemData;
  onSuccess?: () => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ open, onClose, currentRow }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch wallet data directly with simpleGet

  const handleOk = async () => {
    const hide = message.loading('正在处理中...', 0);
    try {
      setLoading(true);
      console.log('Validating form fields...');
      const values = await form.validateFields();

      // 记录转账记录到后端
      await addItem(`/transfers/${currentRow?._id}/collection`, {
        amount: values.amount,
      });

      hide();
      message.success('资金分配成功！');
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error('分配错误:', error);
      message.error(error.message || '资金分配失败');
    } finally {
      setLoading(false);
      hide();
    }
  };

  return (
    <Modal title="归集" open={open} onOk={handleOk} onCancel={onClose} confirmLoading={loading}>
      <Form form={form} layout="vertical">
        <Form.Item name="amount" label="归集金额" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} placeholder="输入归集金额" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Withdraw;
