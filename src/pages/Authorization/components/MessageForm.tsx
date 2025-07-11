import { Modal, Form, Input, message, Alert } from 'antd';
import { useIntl } from '@umijs/max';
import { request } from '@umijs/max';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { useState, useEffect } from 'react';

interface MessageFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
}

type menuItem = {
  _id: string;
  menuName: string;
  url: string;
};

const MessageForm: React.FC<MessageFormProps> = ({ open, onCancel, currentRow }) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const [menus, setMenus] = useState<menuItem[]>(currentRow?.menus || []);

  useEffect(() => {
    if (open && currentRow?._id) {
      setMenus(currentRow.menus || []);
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hide = message.loading(
        intl.formatMessage({ id: 'sending', defaultMessage: 'Sending...' }),
      );

      try {
        await request(`/bots/${currentRow?._id}/send-message`, {
          method: 'POST',
          data: {
            ...values,
            menus: menus.map(({ menuName, url }) => ({ menuName, url })),
            menus_per_row: values.menus_per_row || 1,
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
      } catch (error: any) {
        hide();
        message.error(
          error?.response?.data?.message ||
            intl.formatMessage({ id: 'send_failed', defaultMessage: 'Failed to send message' }),
        );
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const menuColumns: ProColumns<menuItem>[] = [
    {
      title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮' }),
      dataIndex: 'menuName',
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

  return (
    <Modal
      title={intl.formatMessage({ id: 'send_message', defaultMessage: 'Send Message' })}
      open={open}
      onOk={handleSubmit}
      onCancel={() => onCancel(false)}
      destroyOnClose
      width={800}
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
      <Form form={form} layout="vertical">
        <Form.Item
          name="message"
          label={intl.formatMessage({ id: 'message_content', defaultMessage: 'Message Content' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_input_message',
                defaultMessage: 'Please input message content',
              }),
            },
          ]}
        >
          <Input.TextArea
            rows={8}
            placeholder={intl.formatMessage({
              id: 'message_placeholder',
              defaultMessage: 'Please input message content',
            })}
          />
        </Form.Item>

        <Form.Item
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
        >
          <Input type="number" placeholder="默认每行 1 个按钮" />
        </Form.Item>
        <EditableProTable<menuItem>
          rowKey="_id"
          headerTitle={intl.formatMessage({
            id: 'inline_menu_config',
            defaultMessage: '内联菜单配置',
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
              menuName: '',
              url: '',
            }),
          }}
        />
      </Form>
    </Modal>
  );
};

export default MessageForm;
