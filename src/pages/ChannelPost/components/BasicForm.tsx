import { useIntl } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormGroup,
  EditableProTable,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { Form, Input, Popover, Button } from 'antd';
import { FormInstance } from 'antd/es/form';
import EmojiPicker from 'emoji-picker-react';
import { FormattedMessage } from '@umijs/max';

type menuItem = {
  _id: string;
  name: string;
  url: string;
};

interface Props {
  form?: FormInstance<any>;
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [title, setTitle] = useState(values?.title || '');
  const [content, setContent] = useState(values?.content || '');
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>(values?.menus || []);

  const handleEmojiClick = (emojiData: any) => {
    const newTitle = title + emojiData.emoji;
    setTitle(newTitle);
    // 同步更新表单字段值
    form.setFieldsValue({ title: newTitle });
    setEmojiVisible(false);
  };

  const handleContentEmojiClick = (emojiData: any) => {
    const newContent = content + emojiData.emoji;
    setContent(newContent);
    form.setFieldsValue({ content: newContent });
  };

  // 当组件初始化或values变化时，更新状态
  useEffect(() => {
    if (values?.title !== undefined) {
      setTitle(values.title);
    }
    if (values?.content !== undefined) {
      setContent(values.content);
    }
    if (values?.menus !== undefined) {
      setMenus(values.menus || []);
    }
  }, [values?.title, values?.content, values?.menus]);

  return (
    <ProForm
      form={form}
      initialValues={{
        ...values,
        proxy: values?.proxy?._id,
        bot: values?.bot?._id,
        isOnline: values?.isOnline ?? true,
        isClearLastPost: values?.isClearLastPost ?? false,
        interval: values?.interval ?? 60,
        weight: values?.weight ?? 0,
      }}
      submitter={{
        render: (props, dom) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {dom.map((button, index) => (
                <span key={index} style={{ marginLeft: 8 }}>
                  {button}
                </span>
              ))}
            </div>
          );
        },
      }}
      onFinish={async (values) => {
        // 确保使用当前的状态值
        await onFinish({
          ...values,
          title: title,
          content: content,
          menus: menus.map(({ name, url }) => ({ name, url })),
        });
      }}
    >
      <ProFormGroup>
        <ProFormText
          width="md"
          name="title"
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
          rules={[{ required: true, message: intl.formatMessage({ id: 'title.required' }) }]}
          fieldProps={{
            value: title,
            onChange: (e: any) => setTitle(e.target.value),
          }}
        />

        <ProFormText
          name="url"
          label={intl.formatMessage({ id: 'url' })}
          width="md"
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
          width="md"
          name="interval"
          label={intl.formatMessage({ id: 'interval', defaultMessage: '发送间隔(分钟)' })}
          min={1}
          tooltip="设置自动发送的时间间隔，单位为分钟"
        />

        <ProFormDigit
          width="md"
          name="weight"
          label={intl.formatMessage({ id: 'weight' })}
          min={0}
          tooltip="权重越小越靠前显示"
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

        {!newRecord && (
          <Form.Item name="_id" label={false}>
            <Input type="hidden" />
          </Form.Item>
        )}
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
    </ProForm>
  );
};

export default BasicForm;
