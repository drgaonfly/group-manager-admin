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
} from '@ant-design/pro-components';
import { Form, Input, Popover, Button, message } from 'antd';
import EmojiPicker from 'emoji-picker-react';
import { addItem } from '@/services/ant-design-pro/api';
import { FormattedMessage } from '@umijs/max';

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

  const handleSubmit = async (values: any) => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      await addItem('/channel-posts', {
        ...values,
        title: title, // 使用状态中的 title
        content: content, // 使用状态中的 content
        bot: currentRow?._id, // 关联当前机器人
        menus: menus.map(({ name, url }) => ({ name, url })), // 菜单数据
      });
      hide();
      message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
      onSuccess();
      // 重置表单
      form.resetFields();
      setTitle('');
      setContent('');
      setMenus([]);
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="upload_failed" defaultMessage="Upload failed, please try again!" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_channel_post', defaultMessage: '添加频道推广' })}
      open={open}
      onOpenChange={onOpenChange}
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
      }}
    >
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

                // 支持多种格式：t.me链接、@用户名、频道ID
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
        <ProFormDigit
          name="interval"
          width="md"
          label={intl.formatMessage({ id: 'interval', defaultMessage: '发送间隔(分钟)' })}
          min={1}
          tooltip="设置自动发送的时间间隔，单位为分钟"
          fieldProps={{
            placeholder: '请输入发送间隔',
          }}
        />

        <ProFormDigit
          name="weight"
          width="md"
          label={intl.formatMessage({ id: 'weight' })}
          min={0}
          tooltip="权重越小越靠前显示"
          fieldProps={{
            placeholder: '请输入权重',
          }}
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
      </ProFormGroup>

      <ProFormGroup>
        <ProFormSwitch
          name="isOnline"
          label={intl.formatMessage({ id: 'status', defaultMessage: '启用状态' })}
          tooltip="是否启用自动发送"
        />

        <ProFormSwitch
          name="isClearLastPost"
          label={intl.formatMessage({ id: 'clearLastPost', defaultMessage: '清除上条消息' })}
          tooltip="开启后，发送新消息前会删除上一条消息"
        />
      </ProFormGroup>

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
