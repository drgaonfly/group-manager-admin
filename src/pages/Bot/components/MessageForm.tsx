import { Modal, Form, Input, message, Alert } from 'antd';
import { useIntl } from '@umijs/max';
import { request } from '@umijs/max';

interface MessageFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
}

const MessageForm: React.FC<MessageFormProps> = ({ open, onCancel, currentRow }) => {
  const [form] = Form.useForm();
  const intl = useIntl();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hide = message.loading(
        intl.formatMessage({ id: 'sending', defaultMessage: 'Sending...' }),
      );

      try {
        await request(`/bots/${currentRow?._id}/send-message`, {
          method: 'POST',
          data: values,
        });

        hide();
        message.success(
          intl.formatMessage({
            id: 'send_successful',
            defaultMessage: 'Message sent successfully',
          }),
        );
        form.resetFields();
        onCancel(false);
      } catch (error: any) {
        hide();
        message.error(
          error?.response?.data?.message ||
            intl.formatMessage({ id: 'send_failed', defaultMessage: 'Failed to send message' }),
        );
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'send_message', defaultMessage: 'Send Message' })}
      open={open}
      onOk={handleSubmit}
      onCancel={() => onCancel(false)}
      destroyOnClose
    >
      <Alert
        message={intl.formatMessage({
          id: 'telegram_bot_warning',
          defaultMessage:
            'Note: Messages can only be sent to users who have previously interacted with the bot (e.g., sent a message or clicked Start).',
        })}
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="vertical">
        <Form.Item
          name="message"
          label={intl.formatMessage({ id: 'message_content', defaultMessage: 'Message Content' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_input_message',
                defaultMessage: 'Please input message content',
              }),
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={intl.formatMessage({
              id: 'message_placeholder',
              defaultMessage: 'Please input message content',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MessageForm;
