import { message, Form, Space } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';
import {
  ModalForm,
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

  console.log('data', data);

  try {
    if (data.sendType === 'scheduled') {
      await addItem('/group-messages', data);
    } else {
      await updateItem(`/bots/${data.bot.toString()}/send-group-message`, data);
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
  const [content, setContent] = useState('');
  const [medias, setMedias] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>(currentRow?.menus || []);

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();
      // 兼容旧数据
      if (Array.isArray(currentRow.medias)) {
        setMedias(currentRow.medias);
      } else if (currentRow.image) {
        setMedias([currentRow.image]);
      } else {
        setMedias([]);
      }
      setMenus(currentRow.menus || []);
      setContent('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow]);

  // Default file list for showing existing medias
  const defaultMediaFileList: UploadFile[] = medias
    ? medias.filter(Boolean).map((url, idx) => ({
        uid: `${idx + 1}`,
        name: `media${idx + 1}`,
        status: 'done' as UploadFile['status'],
        url,
      }))
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
        const telegramContent = convertToTelegramHtml(content);
        const data = {
          ...values,
          content: telegramContent,
          bot: currentRow?._id,
          intervalTime:
            values.sendType === 'immediate'
              ? 0
              : values.timeUnit === 'minutes'
              ? Number((values.intervalTime / 60).toFixed(2))
              : values.intervalTime,
          groups: values.groups || [],
          medias: medias, // 多媒体
          isRealtime: values.isRealtime,
          sendType: values.sendType,
          menus: menus.map(({ menuName, url }) => ({ menuName, url })),
          menus_per_row: values.menus_per_row,
        };

        const success = await handleAdd(data);
        if (success) {
          form.resetFields();
          setContent('');
          setMedias([]);
          setMenus([]);
          onCancel(false);
        }
        return success;
      }}
    >
      {/* 富文本编辑器 - 单独占满一行 */}
      <Form.Item
        label={intl.formatMessage({ id: 'content', defaultMessage: 'Message Content' })}
        required
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入消息内容..."
          height={200}
          variables="withUser"
        />
      </Form.Item>

      <ProFormGroup>
        <Form.Item label={intl.formatMessage({ id: 'media', defaultMessage: '媒体文件' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              // 支持多媒体上传
              setMedias((prev) => [...prev, signedUrl || url]);
            }}
            accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv,.webm"
            defaultFileList={defaultMediaFileList}
            multiple
            onRemove={(file: UploadFile) => {
              setMedias((prev) => prev.filter((media) => media !== file.url));
              return true;
            }}
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
        {/* 
        <ProFormCheckbox
          name="isRealtime"
          label={intl.formatMessage({ id: 'is_realtime', defaultMessage: 'Is Realtime' })}
          initialValue={false}
          hidden
        /> */}

        <ProFormDigit
          label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: 'Menus Per Row' })}
          name="menus_per_row"
          width="md"
          min={1}
          initialValue={1}
          fieldProps={{ style: { width: '100%' } }}
        />

        {/* <ProFormDigit
          name="weight"
          width="sm"
          label={intl.formatMessage({ id: 'weight', defaultMessage: '权重' })}
          min={0}
          initialValue={0}
          tooltip={'数字越大, 越靠后发送'}
        /> */}

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
