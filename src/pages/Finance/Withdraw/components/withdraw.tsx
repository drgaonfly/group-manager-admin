import { useIntl } from '@umijs/max';
import { Modal, Form, Input } from 'antd';
import React from 'react';

interface Props {
  open: boolean;
  onCancel: (visible: boolean) => void;
  onSubmit: (values: { _id: string; status: string; reason: string }) => Promise<void>;
  values: {
    _id: string;
  };
}

const Reject: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onCancel, onSubmit, values } = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const formValues = await form.validateFields();
      await onSubmit({
        _id: values._id,
        status: 'rejected',
        reason: formValues.rejectReason,
      });
      form.resetFields();
      onCancel(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'pages.reject', defaultMessage: '拒绝提现' })}
      open={open}
      onOk={handleOk}
      onCancel={() => onCancel(false)}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="rejectReason"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={intl.formatMessage({
              id: 'pages.rejectReason.placeholder',
              defaultMessage: '请输入拒绝原因',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Reject;
