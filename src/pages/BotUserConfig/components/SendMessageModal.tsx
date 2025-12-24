import React, { useState } from 'react';
import { FormattedMessage, useIntl } from '@umijs/max';
import { ModalForm, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-components';
import { Button, Popover, message, Form } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import EmojiPicker from 'emoji-picker-react';
import { addItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';

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
  const [medias, setMedias] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);

  const handleEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
    setEmojiVisible(false);
  };

  const defaultMediaFileList: UploadFile[] = medias.map((media, idx) => ({
    uid: String(idx + 1),
    name: `media${idx + 1}`,
    status: 'done' as UploadFile['status'],
    url: media.startsWith('http') ? media : `/api/static/${media}`,
  }));

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
        medias: medias,
      });

      hide();
      message.success({
        content: <FormattedMessage id="send_successful" />,
        key: 'sendMessage',
      });
      form.resetFields();
      setText('');
      setMedias([]);
      setUploadKey((prev) => prev + 1); // 强制 Upload 组件重新渲染
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
          setMedias([]);
          setUploadKey((prev) => prev + 1);
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

      <Form.Item label={intl.formatMessage({ id: 'media', defaultMessage: '媒体文件' })}>
        <Upload
          key={uploadKey}
          onFileUpload={(url: string) => {
            setMedias((prev) => {
              // 去重，避免重复添加
              if (prev.includes(url)) {
                return prev;
              }
              return [...prev, url];
            });
          }}
          accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv,.webm"
          defaultFileList={defaultMediaFileList}
          multiple
          onRemove={(file: UploadFile) => {
            const fileUrl = file.url || '';
            const fileName = fileUrl.includes('/api/static/')
              ? fileUrl.replace('/api/static/', '')
              : fileUrl;
            setMedias((prev) => prev.filter((media) => media !== fileName && media !== fileUrl));
            return true;
          }}
        />
      </Form.Item>
    </ModalForm>
  );
};

export default SendMessageModal;
