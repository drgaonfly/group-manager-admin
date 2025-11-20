import React, { useState } from 'react';
import { FormattedMessage, useIntl } from '@umijs/max';
import { ModalForm, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-components';
import { Button, Popover, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import { addItem } from '@/services/ant-design-pro/api';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  currentRow: any; // BotUserConfig record with bot field
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ open, onClose, currentRow }) => {
  const intl = useIntl();
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [useHtml, setUseHtml] = useState(false);
  const [messageText, setMessageText] = useState('');

  const handleEmojiClick = (emojiData: any) => {
    const currentValue = messageText || '';
    const newText = currentValue + emojiData.emoji;
    setMessageText(newText);
    setEmojiVisible(false);
  };

  const handleFinish = async (values: any) => {
    if (!currentRow?.bot?._id) {
      message.error({
        content: (
          <FormattedMessage id="bot.not.found" defaultMessage="该配置未绑定机器人，无法发送消息" />
        ),
      });
      return false;
    }

    const hide = message.loading({
      content: <FormattedMessage id="sending" defaultMessage="发送中..." />,
      key: 'sendMessage',
    });

    try {
      await addItem(`/bot-user-configs/${currentRow._id}/send-message`, {
        message: values.message,
        parseMode: useHtml ? 'HTML' : undefined,
      });

      hide();
      message.success({
        content: <FormattedMessage id="send_successful" defaultMessage="发送成功" />,
        key: 'sendMessage',
      });
      setMessageText('');
      setUseHtml(false);
      return true;
    } catch (error: any) {
      hide();
      message.error({
        content: error?.response?.data?.message ?? (
          <FormattedMessage id="send_failed" defaultMessage="发送失败，请重试！" />
        ),
        key: 'sendMessage',
      });
      return false;
    }
  };

  const emojiPicker = (
    <div style={{ width: 350, height: 400 }}>
      <EmojiPicker onEmojiClick={handleEmojiClick} />
    </div>
  );

  return (
    <ModalForm
      title={<FormattedMessage id="send_message" defaultMessage="Send Message" />}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          onClose();
          setEmojiVisible(false);
          setUseHtml(false);
          setMessageText('');
        }
      }}
      onFinish={handleFinish}
      initialValues={{
        message: messageText,
        useHtml: false,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <strong>
          <FormattedMessage id="bot" defaultMessage="机器人" />:{' '}
        </strong>
        {currentRow?.bot?.botName || '-'}
      </div>
      <ProFormSwitch
        name="useHtml"
        label={<FormattedMessage id="use_html" defaultMessage="Use HTML Format" />}
        fieldProps={{
          checked: useHtml,
          onChange: (checked) => setUseHtml(checked),
        }}
        extra={
          <FormattedMessage
            id="use_html_description"
            defaultMessage="When enabled, HTML tags can be used to format messages (e.g., <b>bold</b>, <i>italic</i>, etc.)"
          />
        }
      />

      <ProFormTextArea
        name="message"
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>
              <FormattedMessage id="message_content" defaultMessage="Message Content" />
            </span>
            <Popover
              content={emojiPicker}
              title={<FormattedMessage id="select_emoji" defaultMessage="Select Emoji" />}
              trigger="click"
              open={emojiVisible}
              onOpenChange={setEmojiVisible}
              placement="top"
            >
              <Button
                type="text"
                icon={<SmileOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  setEmojiVisible(!emojiVisible);
                }}
              />
            </Popover>
          </div>
        }
        fieldProps={{
          rows: 6,
          onChange: (e) => setMessageText(e.target.value),
          value: messageText,
        }}
        placeholder={intl.formatMessage({
          id: 'enter_message',
          defaultMessage: 'Please enter the message to send (HTML format supported)',
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'message_required',
              defaultMessage: 'Please enter message content',
            }),
          },
        ]}
      />
    </ModalForm>
  );
};

export default SendMessageModal;
