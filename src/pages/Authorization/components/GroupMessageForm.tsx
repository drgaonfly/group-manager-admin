import { message, Form, Space } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';
import {
  ModalForm,
  ProFormTextArea,
  ProFormGroup,
  ProFormDigit,
  ProFormCheckbox,
  ProFormSelect,
  ProFormRadio,
  ProFormDependency,
  ProColumns,
  EditableProTable,
} from '@ant-design/pro-components';

type menuItem = {
  _id: string;
  menuName: string;
  url: string;
};

const handleAdd = async (data: any) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    if (data.sendType === 'scheduled') {
      await addItem('/group-messages', data);
    } else {
      await updateItem(`/bots/${data.bot}/send-group-message`, data);
    }
    hide();
    message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="add_failed" defaultMessage="Add failed, please try again" />
      ),
    );
    return false;
  }
};

interface GroupMessageFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
}

const GroupMessageForm: React.FC<GroupMessageFormProps> = ({ open, onCancel, currentRow }) => {
  const intl = useIntl();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>(currentRow?.menus || []);

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();
      setImageUrl('');
      setMenus(currentRow.menus || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow]);

  // Default file list for showing existing image
  const defaultImageFileList = imageUrl
    ? [
        {
          uid: '1',
          name: 'image',
          status: 'done' as UploadFile['status'],
          url: imageUrl,
        },
      ]
    : [];

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
  ];

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_group_message', defaultMessage: 'Add Group Message' })}
      open={open}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
      }}
      onFinish={async (values: any) => {
        const data = {
          content: values.message,
          bot: currentRow?._id,
          intervalTime:
            values.sendType === 'immediate'
              ? 0
              : values.timeUnit === 'minutes'
              ? Number((values.intervalTime / 60).toFixed(2))
              : values.intervalTime,
          groups: values.groups || [],
          image: imageUrl,
          isRealtime: values.isRealtime,
          sendType: values.sendType,
          menus: menus.map(({ menuName, url }) => ({ menuName, url })),
          menus_per_row: values.menus_per_row,
        };

        const success = await handleAdd(data);
        if (success) {
          form.resetFields();
          setImageUrl('');
          onCancel(false);
        }
        return success;
      }}
    >
      <ProFormGroup>
        <ProFormTextArea
          name="message"
          label={intl.formatMessage({ id: 'content', defaultMessage: 'Message Content' })}
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
          }}
        />

        <Form.Item label={intl.formatMessage({ id: 'image' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              setImageUrl(signedUrl || url);
            }}
            accept=".jpg,.jpeg,.png,.gif"
            defaultFileList={defaultImageFileList}
          />
        </Form.Item>
      </ProFormGroup>

      <ProFormGroup>
        {currentRow?.groups?.length > 0 ? (
          <ProFormCheckbox.Group
            name="groups"
            width="md"
            label={intl.formatMessage({ id: 'select_groups', defaultMessage: 'Select Groups' })}
            options={currentRow.groups.map((group: any) => ({
              label: group.title,
              value: group._id,
            }))}
          />
        ) : (
          <ProFormCheckbox
            width="md"
            label={intl.formatMessage({
              id: 'no_groups_joined',
              defaultMessage: 'No groups joined',
            })}
            disabled
          />
        )}

        <ProFormCheckbox
          name="isRealtime"
          label={intl.formatMessage({ id: 'is_realtime', defaultMessage: 'Is Realtime' })}
          initialValue={false}
          hidden
        />

        <ProFormDigit
          label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: 'Menus Per Row' })}
          name="menus_per_row"
          width="md"
          min={1}
          fieldProps={{ style: { width: '100%' } }}
        />

        <ProFormRadio.Group
          name="sendType"
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
    </ModalForm>
  );
};

export default GroupMessageForm;
