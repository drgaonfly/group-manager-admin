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
  const [loading, setLoading] = useState(false);

  const [isWalletLoading] = useState(false);

  // Fetch wallet data directly with simpleGet

  const handleOk = async () => {
    try {
      console.log('Validating form fields...');
      // const values = await form.validateFields();

      // 记录转账记录到后端
      await addItem(`/transfers/${currentRow?._id}/collection`, {
        employee: currentRow?.employee?._id || '', // 添加可选链操作符，防止undefined错误
        adminWallet: '', // 接收者地址
        adminAmount: currentRow?.network === 'BSC' ? Number(5) / 10 ** 18 : Number(5) / 10 ** 6, // 根据网络类型转换金额
        type: 'direct', // 转账类型
      });

      message.success({ content: '资金分配成功！', key: 'withdraw' });
      onClose();
    } catch (error: any) {
      console.error('分配错误:', error);
      message.error({
        content: error.message || '资金分配失败',
        key: 'withdraw',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="归集"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading || isWalletLoading}
    >
      {isWalletLoading ? (
        <div>正在加载钱包数据...</div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="amount" label="归集金额" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="输入归集金额" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default Withdraw;
