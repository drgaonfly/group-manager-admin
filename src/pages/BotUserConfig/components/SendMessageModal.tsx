import React, { useState } from 'react';
import { Modal, Input, message, Alert } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { addItem } from '@/services/ant-design-pro/api';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  currentRow: any; // BotUserConfig record with bot field
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ open, onClose, currentRow }) => {
  const [messageText, setMessageText] = useState('');
  const intl = useIntl();

  const handleOk = async () => {
    if (!messageText.trim()) {
      message.error({
        content: <FormattedMessage id="message.empty" defaultMessage="消息内容不能为空" />,
      });
      return;
    }

    if (!currentRow?.bot?._id) {
      message.error({
        content: (
          <FormattedMessage id="bot.not.found" defaultMessage="该配置未绑定机器人，无法发送消息" />
        ),
      });
      return;
    }

    const hide = message.loading({
      content: <FormattedMessage id="sending" defaultMessage="发送中..." />,
      key: 'sendMessage',
    });

    try {
      await addItem(`/bots/${currentRow.bot._id}/send-message`, {
        message: messageText,
      });

      hide();
      message.success({
        content: <FormattedMessage id="send_successful" defaultMessage="发送成功" />,
        key: 'sendMessage',
      });
      setMessageText('');
      onClose();
    } catch (error: any) {
      hide();
      message.error({
        content: error?.response?.data?.message ?? (
          <FormattedMessage id="send_failed" defaultMessage="发送失败，请重试！" />
        ),
        key: 'sendMessage',
      });
    }
  };

  const placeholderText = intl.formatMessage({
    id: 'message_placeholder',
    defaultMessage: '请输入要发送的消息',
  });

  return (
    <Modal
      title={<FormattedMessage id="send_message" defaultMessage="发送消息" />}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        setMessageText('');
        onClose();
      }}
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
      <div style={{ marginBottom: 16 }}>
        <strong>
          <FormattedMessage id="bot" defaultMessage="机器人" />:{' '}
        </strong>
        {currentRow?.bot?.botName || '-'}
      </div>
      <Input.TextArea
        rows={4}
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder={placeholderText}
      />
    </Modal>
  );
};

export default SendMessageModal;
