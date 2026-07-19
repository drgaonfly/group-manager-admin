import { Form, message, Alert, Space, Popover, Button } from 'antd';
import { useIntl } from '@umijs/max';
import { request } from '@umijs/max';
import {
  ModalForm,
  EditableProTable,
  ProColumns,
  ProFormDigit,
  ProFormDependency,
  ProFormGroup,
  ProFormSelect,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';

interface MessageFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
}

type menuItem = {
  _id: string;
  name: string;
  url: string;
};

const MessageForm: React.FC<MessageFormProps> = ({ open, onCancel, currentRow }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const [menus, setMenus] = useState<menuItem[]>(currentRow?.menus || []);
  const [images, setImages] = useState<string[]>([]);

  const handleEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handlePopoverVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  useEffect(() => {
    if (open && currentRow?._id) {
      setMenus(currentRow.menus || []);
      form.resetFields();
      // 兼容旧数据，currentRow.image 可能为单图
      if (Array.isArray(currentRow.images)) {
        setImages(currentRow.images);
      } else if (currentRow.image) {
        setImages([currentRow.image]);
      } else {
        setImages([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow]);

  const handleSubmit = async (values: any) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'sending', defaultMessage: 'Sending...' }),
    );
    try {
      await request(`/bots/${currentRow?._id.toString()}/send-message`, {
        method: 'POST',
        data: {
          ...values,
          images: images, // 多图
          menus: menus.map(({ name, url }) => ({ name, url })),
          menus_per_row: values.menus_per_row || 1,
          intervalTime:
            values.timeUnit === 'minutes'
              ? Number((values.intervalTime / 60).toFixed(2))
              : values.intervalTime,
          send_type: values.sendType,
        },
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
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ||
          intl.formatMessage({ id: 'send_failed', defaultMessage: 'Failed to send message' }),
      );
      return false;
    }
  };

  const menuColumns: ProColumns<menuItem>[] = [
    {
      title: intl.formatMessage({ id: 'name', defaultMessage: '按钮' }),
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'menu_name_required',
              defaultMessage: '请输入按钮名称',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({ id: 'url', defaultMessage: '菜单链接' }),
      dataIndex: 'url',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({ id: 'url_required', defaultMessage: '请输入菜单链接' }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({ id: 'option', defaultMessage: '操作' }),
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(`${record._id}`);
          }}
        >
          {intl.formatMessage({ id: 'edit' })}
        </a>,
      ],
    },
  ];

  // Default file list for showing existing images
  const defaultImageFileList: UploadFile[] = images
    ? images.filter(Boolean).map((url, idx) => ({
        uid: `${idx + 1}`,
        name: `image${idx + 1}`,
        status: 'done' as UploadFile['status'],
        url,
      }))
    : [];

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'send_message', defaultMessage: 'Send Message' })}
      open={open}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
      }}
      onFinish={handleSubmit}
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
      <ProFormGroup>
        <ProFormTextArea
          name="message"
          label={
            <span>
              {intl.formatMessage({ id: 'content', defaultMessage: 'Message Content' })}
              <Popover
                content={<EmojiPicker onEmojiClick={handleEmojiClick} />}
                title="Pick an Emoji"
                trigger="click"
                visible={visible}
                onVisibleChange={handlePopoverVisibleChange}
              >
                <Button size="small" style={{ marginLeft: 8 }}>
                  😊
                </Button>
              </Popover>
            </span>
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_input_message',
                defaultMessage: 'Please input message content',
              }),
            },
          ]}
          width="md"
          fieldProps={{
            autoSize: { minRows: 8 },
            value: text,
            onChange: (e: any) => setText(e.target.value),
          }}
        />
        <Form.Item label={intl.formatMessage({ id: 'image', defaultMessage: 'Image' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              setImages((prev) => [...prev, signedUrl || url]);
            }}
            accept=".jpg,.jpeg,.png,.gif"
            defaultFileList={defaultImageFileList}
            multiple
            onRemove={(file: UploadFile) => {
              setImages((prev) => prev.filter((img) => img !== file.url));
              return true;
            }}
          />
        </Form.Item>
      </ProFormGroup>

      <ProFormGroup>
        <ProFormDigit
          name="menus_per_row"
          label={intl.formatMessage({
            id: 'menus_per_row',
            defaultMessage: '每行菜单按钮数量',
          })}
          rules={[
            {
              required: false,
            },
          ]}
          placeholder="默认每行 1 个按钮"
        />
        <ProFormRadio.Group
          name="sendType"
          width="md"
          label={intl.formatMessage({ id: 'send_type', defaultMessage: 'Send Type' })}
          initialValue="immediate"
          options={[
            {
              label: intl.formatMessage({ id: 'immediate_send', defaultMessage: '立即发送' }),
              value: 'immediate',
            },
            {
              label: intl.formatMessage({ id: 'scheduled_send', defaultMessage: '定时发送' }),
              value: 'scheduled',
            },
          ]}
        />
        <ProFormDigit
          name="weight"
          width="md"
          label={intl.formatMessage({ id: 'weight', defaultMessage: '权重' })}
          min={0}
          initialValue={0}
          tooltip={'数字越大, 越靠后发送'}
        />
      </ProFormGroup>
      <ProFormDependency name={['sendType']}>
        {({ sendType }) =>
          sendType === 'scheduled' && (
            <ProFormGroup
              label={intl.formatMessage({ id: 'interval_time', defaultMessage: 'Interval Time' })}
              style={{
                marginBottom: 32,
              }}
            >
              <Space>
                <ProFormSelect
                  name="timeUnit"
                  width="xs"
                  initialValue="hours"
                  options={[
                    {
                      label: intl.formatMessage({ id: 'minutes', defaultMessage: 'Minutes' }),
                      value: 'minutes',
                    },
                    {
                      label: intl.formatMessage({ id: 'hours', defaultMessage: 'Hours' }),
                      value: 'hours',
                    },
                  ]}
                  noStyle
                />
                <ProFormDigit
                  name="intervalTime"
                  width="xs"
                  min={0}
                  fieldProps={{ style: { width: '100%' } }}
                  noStyle
                />
              </Space>
            </ProFormGroup>
          )
        }
      </ProFormDependency>
      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'inline_menu_config',
          defaultMessage: '按钮设置',
        })}
        columns={menuColumns}
        value={menus}
        name="menus"
        onChange={(value: readonly menuItem[]) => setMenus([...value])}
        editable={{
          type: 'multiple',
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString(),
            name: '',
            url: '',
          }),
        }}
      />
    </ModalForm>
  );
};

export default MessageForm;
