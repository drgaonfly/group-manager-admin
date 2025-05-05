import React from 'react';
import { Modal, Input, message } from 'antd';
import { FormattedMessage } from '@umijs/max';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  currentRow: any;
  onSendMessage: (botUserId: string, messageContent: string) => Promise<boolean>;
  messageText: string;
  setMessageText: (text: string) => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  open,
  onClose,
  currentRow,
  onSendMessage,
  messageText,
  setMessageText,
}) => {
  const handleOk = async () => {
    if (!messageText.trim()) {
      message.error({
        content: <FormattedMessage id="message.empty" defaultMessage="消息内容不能为空" />,
      });
      return;
    }

    if (!currentRow?._id) {
      message.error({
        content: (
          <FormattedMessage id="user.not.selected" defaultMessage="请选择要发送消息的用户" />
        ),
      });
      return;
    }

    const success = await onSendMessage(currentRow._id, messageText);
    if (success) {
      onClose();
    }
  };

  const placeholderText = '请输入要发送的消息';

  return (
    <Modal
      title={<FormattedMessage id="send.message" defaultMessage="发送消息" />}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
    >
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
