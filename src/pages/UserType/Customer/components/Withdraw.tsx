import React from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { request, useIntl } from '@umijs/max';

interface WithdrawProps {
  open: boolean;
  onClose: () => void;
  currentRow?: API.ItemData;
  onSuccess?: () => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ open, onClose, currentRow }) => {
  const [form] = Form.useForm();
  const intl = useIntl();

  const usdtPlatform = currentRow?.usdtPlatform || 0;

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Withdrawal amount:', values.amount);

      // 添加加载状态
      message.loading({ content: 'Submitting...', key: 'withdraw' });

      // 发送提现请求
      const res = await request<API.ItemData>('/withdraws', {
        method: 'POST',
        data: {
          amount: values.amount,
          customer: currentRow?._id,
        },
      });

      // 显示成功消息

      if (res.success) {
        message.success({ content: res.message, key: 'withdraw' });
        onClose();
      } else {
        alert(res.message);
      }

      // 刷新父组件表格
    } catch (error: any) {
      // 更详细的错误处理
      if (error.response) {
        message.error(error.response.data.message || 'Request failed');
      } else if (error.request) {
        message.error('Network error, please try again');
      } else {
        message.error('Request configuration error');
      }
    }
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'withdraw.title', defaultMessage: '提现' })}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="amount"
          label={intl.formatMessage({ id: 'withdraw.amount', defaultMessage: '提现金额' })}
          rules={[
            { required: true },
            {
              validator: (_, value) => {
                if (value > usdtPlatform) {
                  return Promise.reject(new Error('不能超过USDT平台余额'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} placeholder={`Max amount: ${usdtPlatform}`} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Withdraw;
