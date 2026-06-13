import { message, Form, Space } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';
import { timeUnitToMinutes, TimeUnit } from '@/utils/intervalUtils';
import { toISOString } from '@/utils/dateUtils';
import {
  ModalForm,
  ProFormGroup,
  ProFormDigit,
  ProFormSelect,
  ProFormRadio,
  ProFormSwitch,
  ProFormDependency,
  ProColumns,
  EditableProTable,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import GroupMessageGroupSelect from './GroupMessageGroupSelect';

type menuItem = {
  _id: string;
  name: string;
  url: string;
};

const handleAdd = async (data: any) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  console.log('data', data);

  try {
    if (data.sendType === 'scheduled') {
      await addItem('/group-messages', data);
    } else {
      await updateItem(`/bots/${data.bot?.toString()}/send-group-message`, data);
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
  onSuccess?: () => void;
  /** 从外层直接传入群组 ID，跳过 GroupSelect */
  fixedGroupId?: string;
}

const GroupMessageForm: React.FC<GroupMessageFormProps> = ({
  open,
  onCancel,
  currentRow,
  onSuccess,
  fixedGroupId,
}) => {
  const intl = useIntl();
  const [content, setContent] = useState('');
  const [medias, setMedias] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>(currentRow?.menus || []);

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();
      setMedias(Array.isArray(currentRow.medias) ? currentRow.medias : []);
      setMenus(currentRow.menus || []);
      setContent('');
      // 外层传入固定群组时预填
      if (fixedGroupId) {
        form.setFieldsValue({ group: fixedGroupId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow, fixedGroupId]);

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
              : timeUnitToMinutes(values.intervalTime || 0, values.timeUnit as TimeUnit),
          groups: values.group ? [values.group] : [],
          group: values.group,
          medias: medias,
          isRealtime: values.isRealtime,
          sendType: values.sendType,
          menus: menus.map(({ name, url }) => ({ name, url })),
          menus_per_row: values.menus_per_row,
          startAt: toISOString(values.startAt),
          endAt: toISOString(values.endAt),
        };

        const success = await handleAdd(data);
        if (success) {
          form.resetFields();
          setContent('');
          setMedias([]);
          setMenus([]);
          onCancel(false);
          onSuccess?.();
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
          variables="all"
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

      {fixedGroupId ? (
        // 群组已由外层固定，隐藏字段保值，不展示 Select
        <Form.Item name="group" hidden initialValue={fixedGroupId}>
          <input type="hidden" />
        </Form.Item>
      ) : (
        <GroupMessageGroupSelect botId={currentRow?._id} />
      )}

      <ProFormGroup>
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
            <>
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
                      {
                        label: intl.formatMessage({ id: 'weeks', defaultMessage: 'Weeks' }),
                        value: 'weeks',
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

              <ProFormGroup>
                <ProFormDateTimePicker
                  width="md"
                  name="startAt"
                  label="发送开始时间"
                  fieldProps={{ format: 'YYYY-MM-DD HH:mm', showTime: { format: 'HH:mm' } }}
                  tooltip="允许发送消息的开始时间"
                />
                <ProFormDateTimePicker
                  width="md"
                  name="endAt"
                  label="发送结束时间"
                  fieldProps={{ format: 'YYYY-MM-DD HH:mm', showTime: { format: 'HH:mm' } }}
                  tooltip="允许发送消息的结束时间"
                />
              </ProFormGroup>

              <ProFormGroup>
                <ProFormSwitch
                  name="autoDeletePrevious"
                  label={intl.formatMessage({
                    id: 'auto_delete_previous',
                    defaultMessage: '自动删除上一条',
                  })}
                  initialValue={false}
                  tooltip="发送新消息前，自动删除该群组上一条已发送的消息"
                />
              </ProFormGroup>
            </>
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
            name: '',
            url: '',
          }),
        }}
      />
    </ModalForm>
  );
};

export default GroupMessageForm;
