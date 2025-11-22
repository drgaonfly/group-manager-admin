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
    // 检查配置ID是否存在
    if (!currentRow?._id) {
      message.error({
        content: <FormattedMessage id="config.not.found" />,
      });
      return false;
    }

    // 检查是否绑定了机器人（后端会通过 populate 获取，这里只做前端提示）
    if (!currentRow?.bot?._id && !currentRow?.bot) {
      message.error({
        content: <FormattedMessage id="bot.not.found" />,
      });
      return false;
    }

    const hide = message.loading({
      content: <FormattedMessage id="sending" />,
      key: 'sendMessage',
    });

    try {
      // 后端会通过 BotUserConfig 的 id 自动获取绑定的机器人信息，不需要前端传递
      await addItem(`/bot-user-configs/${currentRow._id}/send-message`, {
        message: values.message,
        parseMode: useHtml ? 'HTML' : undefined,
      });

      hide();
      message.success({
        content: <FormattedMessage id="send_successful" />,
        key: 'sendMessage',
      });
      setMessageText('');
      setUseHtml(false);
      return true;
    } catch (error: any) {
      hide();
      message.error({
        content: error?.response?.data?.message ?? <FormattedMessage id="send_failed" />,
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
      title={<FormattedMessage id="send_message" />}
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
          <FormattedMessage id="bot" />:{' '}
        </strong>
        <span style={{ color: currentRow?.bot?.botName ? 'inherit' : '#ff4d4f' }}>
          {currentRow?.bot?.botName || <FormattedMessage id="bot.not.bound" />}
        </span>
      </div>
      <ProFormSwitch
        name="useHtml"
        label={<FormattedMessage id="use_html" />}
        fieldProps={{
          checked: useHtml,
          onChange: (checked) => setUseHtml(checked),
        }}
        extra={<FormattedMessage id="use_html_description" />}
      />

      <ProFormTextArea
        name="message"
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>
              <FormattedMessage id="message_content" />
            </span>
            <Popover
              content={emojiPicker}
              title={<FormattedMessage id="select_emoji" />}
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
        placeholder={intl.formatMessage({ id: 'enter_message' })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'message_required' }),
          },
        ]}
      />
    </ModalForm>
  );
};

export default SendMessageModal;
