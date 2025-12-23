import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormGroup,
  EditableProTable,
  ProFormSwitch,
  ProFormRadio,
  ProFormDependency,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form, Input, Popover, Button, message, Space, Alert } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import EmojiPicker from 'emoji-picker-react';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import { FormattedMessage } from '@umijs/max';
import Upload from '@/components/Upload';

type menuItem = {
  _id: string;
  name: string;
  url: string;
};

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any;
  onSuccess: () => void;
}

const ChannelPostCreateForm: React.FC<Props> = ({ open, onOpenChange, currentRow, onSuccess }) => {
  const intl = useIntl();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [medias, setMedias] = useState<string[]>([]);

  const handleEmojiClick = (emojiData: any) => {
    const newTitle = title + emojiData.emoji;
    setTitle(newTitle);
    form.setFieldsValue({ title: newTitle });
    setEmojiVisible(false);
  };

  const handleContentEmojiClick = (emojiData: any) => {
    const newContent = content + emojiData.emoji;
    setContent(newContent);
    form.setFieldsValue({ content: newContent });
  };

  // Default file list for showing existing medias
  const defaultMediaFileList: UploadFile[] = medias.map((media, idx) => ({
    uid: String(idx + 1),
    name: `media${idx + 1}`,
    status: 'done' as UploadFile['status'],
    url: media.startsWith('http') ? media : `/api/static/${media}`,
  }));

  const handleSubmit = async (values: any) => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      const sendType = values.sendType || 'scheduled';
      const formData = {
        ...values,
        title: title,
        content: content,
        bot: currentRow?._id,
        menus: menus.map(({ name, url }) => ({ name, url })),
        medias: medias,
        menus_per_row: values.menus_per_row || 1,
      };

      if (sendType === 'immediate') {
        // 立即发送 - 使用 bot 的 send-channel-post 路由
        await updateItem(`/bots/${currentRow?._id}/send-channel-post`, formData);
      } else {
        // 定时发送 - 处理间隔时间
        const interval =
          values.timeUnit === 'hours' ? (values.interval || 1) * 60 : values.interval || 60;
        await addItem('/channel-posts', {
          ...formData,
          interval,
        });
      }

      hide();
      message.success(
        sendType === 'immediate' ? (
          <FormattedMessage id="send_successful" defaultMessage="发送成功" />
        ) : (
          <FormattedMessage id="add_successful" defaultMessage="添加成功" />
        ),
      );
      onSuccess();
      // 重置表单
      form.resetFields();
      setTitle('');
      setContent('');
      setMenus([]);
      setMedias([]);
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="operation_failed" defaultMessage="操作失败，请重试" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_channel_post', defaultMessage: '添加频道推广' })}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          // 关闭时重置状态
          form.resetFields();
          setTitle('');
          setContent('');
          setMenus([]);
          setMedias([]);
        }
        onOpenChange(visible);
      }}
      form={form}
      width={800}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={handleSubmit}
      initialValues={{
        interval: 60,
        weight: 0,
        isOnline: true,
        isClearLastPost: false,
        sendType: 'scheduled',
        timeUnit: 'minutes',
        menus_per_row: 1,
      }}
    >
      <Alert
        message={
          '支持的 Telegram 标签：' +
          '<b>加粗</b>、' +
          '<i>斜体</i>、' +
          '<u>下划线</u>、' +
          '<s>删除线</s>、' +
          '<code>代码</code>、' +
          '<pre>预格式化</pre>、' +
          '<a>链接</a>'
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <ProFormGroup>
        <ProFormText
          name="title"
          width="md"
          label={
            <span>
              {intl.formatMessage({ id: 'title' })}
              <Popover
                content={<EmojiPicker onEmojiClick={handleEmojiClick} />}
                title="选择表情"
                trigger="click"
                open={emojiVisible}
                onOpenChange={setEmojiVisible}
              >
                <Button size="small" style={{ marginLeft: 8 }}>
                  😊
                </Button>
              </Popover>
            </span>
          }
          rules={[{ required: true, message: '请输入频道标题' }]}
          fieldProps={{
            value: title,
            onChange: (e: any) => setTitle(e.target.value),
            placeholder: '请输入频道标题',
          }}
        />

        <ProFormText
          name="url"
          width="md"
          label={intl.formatMessage({ id: 'url' })}
          placeholder="https://t.me/alpha 或 @channelname 或 -1001234567890"
          rules={[
            { required: true, message: '请输入频道链接' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                const telegramPattern = /^https:\/\/t\.me\/[a-zA-Z0-9_]+$/;
                const usernamePattern = /^@[a-zA-Z0-9_]+$/;
                const channelIdPattern = /^-?\d+$/;

                if (
                  telegramPattern.test(value) ||
                  usernamePattern.test(value) ||
                  channelIdPattern.test(value)
                ) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error('频道链接格式错误，支持格式：https://t.me/用户名、@用户名 或 频道ID'),
                );
              },
            },
          ]}
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormTextArea
          name="content"
          width="md"
          label={
            <span>
              {intl.formatMessage({ id: 'content', defaultMessage: '推广内容' })}
              <Popover
                content={<EmojiPicker onEmojiClick={handleContentEmojiClick} />}
                title="选择表情"
                trigger="click"
              >
                <Button size="small" style={{ marginLeft: 8 }}>
                  😊
                </Button>
              </Popover>
            </span>
          }
          rules={[{ required: true, message: '请输入推广内容' }]}
          fieldProps={{
            autoSize: { minRows: 8 },
            value: content,
            onChange: (e: any) => setContent(e.target.value),
            placeholder: '请输入频道推广内容...',
          }}
        />

        <Form.Item label={intl.formatMessage({ id: 'media', defaultMessage: '媒体文件' })}>
          <Upload
            onFileUpload={(url: string) => {
              setMedias((prev) => [...prev, url]);
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
      </ProFormGroup>

      <ProFormGroup>
        <ProFormRadio.Group
          name="sendType"
          label={intl.formatMessage({ id: 'send_type', defaultMessage: '发送类型' })}
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
          width="md"
          name="menus_per_row"
          label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: '每行菜单数' })}
          min={1}
          tooltip="设置内联菜单每行显示的按钮数量"
        />
      </ProFormGroup>

      <ProFormDependency name={['sendType']}>
        {({ sendType }) =>
          sendType === 'scheduled' && (
            <>
              <ProFormGroup
                label={intl.formatMessage({ id: 'interval_time', defaultMessage: '发送间隔' })}
                style={{ marginBottom: 16 }}
              >
                <Space>
                  <ProFormSelect
                    name="timeUnit"
                    width="xs"
                    options={[
                      {
                        label: intl.formatMessage({ id: 'minutes', defaultMessage: '分钟' }),
                        value: 'minutes',
                      },
                      {
                        label: intl.formatMessage({ id: 'hours', defaultMessage: '小时' }),
                        value: 'hours',
                      },
                    ]}
                    noStyle
                  />
                  <ProFormDigit name="interval" width="xs" min={1} noStyle />
                </Space>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormDigit
                  name="weight"
                  width="md"
                  label={intl.formatMessage({ id: 'weight' })}
                  min={0}
                  tooltip="权重越小越靠前显示"
                />

                <ProFormSwitch
                  name="isOnline"
                  label={intl.formatMessage({ id: 'status', defaultMessage: '启用状态' })}
                  tooltip="是否启用自动发送"
                />

                <ProFormSwitch
                  name="isClearLastPost"
                  label={intl.formatMessage({
                    id: 'clearLastPost',
                    defaultMessage: '清除上条消息',
                  })}
                  tooltip="开启后，发送新消息前会删除上一条消息"
                />
              </ProFormGroup>
            </>
          )
        }
      </ProFormDependency>

      {/* 菜单配置 */}
      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'inline_menu_config',
          defaultMessage: '内联菜单配置',
        })}
        columns={[
          {
            title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮名称' }),
            dataIndex: 'name',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '请输入按钮名称',
                },
              ],
            },
          },
          {
            title: intl.formatMessage({ id: 'url', defaultMessage: '链接地址' }),
            dataIndex: 'url',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '请输入链接地址',
                },
              ],
            },
          },
          {
            title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
            valueType: 'option',
            width: 200,
            render: (_, record, __, action) => [
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
        ]}
        value={menus}
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
        size="small"
      />

      {/* 隐藏字段 */}
      <Form.Item name="bot" hidden>
        <Input value={currentRow?._id} />
      </Form.Item>
    </ModalForm>
  );
};

export default ChannelPostCreateForm;
