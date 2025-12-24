import React, { useState } from 'react';
import { FormattedMessage, useIntl } from '@umijs/max';
import { ModalForm, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-components';
import { Button, Popover, message, Form } from 'antd';
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
  const [form] = Form.useForm();
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [text, setText] = useState('');

  const handleEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
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
        message: text,
        parseMode: values.useHtml ? 'HTML' : undefined,
      });

      hide();
      message.success({
        content: <FormattedMessage id="send_successful" />,
        key: 'sendMessage',
      });
      form.resetFields();
      setText('');
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

  return (
    <ModalForm
      form={form}
      title={<FormattedMessage id="send_message" />}
      open={open}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          onClose();
          setEmojiVisible(false);
          setText('');
        },
      }}
      onFinish={handleFinish}
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
        extra={<FormattedMessage id="use_html_description" />}
      />

      <ProFormTextArea
        name="message"
        label={
          <span>
            <FormattedMessage id="message_content" />
            <Popover
              content={<EmojiPicker onEmojiClick={handleEmojiClick} />}
              title={<FormattedMessage id="select_emoji" />}
              trigger="click"
              open={emojiVisible}
              onOpenChange={setEmojiVisible}
              placement="top"
            >
              <Button type="text" icon={<SmileOutlined />} style={{ marginLeft: 8 }} />
            </Popover>
          </span>
        }
        fieldProps={{
          rows: 6,
          value: text,
          onChange: (e) => setText(e.target.value),
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
