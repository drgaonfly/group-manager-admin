import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import {
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  EditableProTable,
  ProFormSwitch,
  ProFormRadio,
  ProFormDependency,
  ProFormSelect,
  ProFormCheckbox,
  ProFormDateTimePicker,
  ProColumns,
} from '@ant-design/pro-components';
import { Form, Input, message, Space } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import { FormattedMessage } from '@umijs/max';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';
import { timeUnitToMinutes, TimeUnit } from '@/utils/intervalUtils';
import { toISOString } from '@/utils/dateUtils';

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
  const [content, setContent] = useState('');
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [medias, setMedias] = useState<string[]>([]);

  // Default file list for showing existing medias
  const defaultMediaFileList: UploadFile[] = medias
    ? medias.filter(Boolean).map((media, idx) => ({
        uid: String(idx + 1),
        name: `media${idx + 1}`,
        status: 'done' as UploadFile['status'],
        url: media.startsWith('http') ? media : `/api/static/${media}`,
      }))
    : [];

  const menuColumns: ProColumns<menuItem>[] = [
    {
      title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮名称' }),
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
      title: intl.formatMessage({ id: 'url', defaultMessage: '链接地址' }),
      dataIndex: 'url',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({ id: 'url_required', defaultMessage: '请输入链接地址' }),
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
  ];

  const handleSubmit = async (values: any) => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      const sendType = values.sendType || 'scheduled';
      const telegramContent = convertToTelegramHtml(content);
      const formData = {
        ...values,
        content: telegramContent,
        bot: currentRow?._id,
        menus: menus.map(({ name, url }) => ({ name, url })),
        medias: medias,
        menus_per_row: values.menus_per_row || 1,
      };

      if (sendType === 'immediate') {
        await updateItem(`/bots/${currentRow?._id}/send-channel-post`, formData);
      } else {
        const interval = timeUnitToMinutes(values.interval || 1, values.timeUnit as TimeUnit);
        await addItem('/channel-posts', {
          ...formData,
          interval,
          startAt: toISOString(values.startAt),
          endAt: toISOString(values.endAt),
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
      form.resetFields();
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
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onOpenChange(false),
      }}
      onOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
          setContent('');
          setMenus([]);
          setMedias([]);
        }
        onOpenChange(visible);
      }}
      onFinish={handleSubmit}
      initialValues={{
        interval: 1,
        weight: 0,
        isOnline: true,
        isClearLastPost: false,
        sendType: 'immediate',
        timeUnit: 'hours',
        menus_per_row: 1,
      }}
    >
      {/* 富文本编辑器 */}
      <Form.Item
        label={intl.formatMessage({ id: 'content', defaultMessage: '推广内容' })}
        required
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入频道推广内容..."
          height={200}
          variables="groupOnly"
        />
      </Form.Item>

      <ProFormGroup>
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
        {currentRow?.groups?.length > 0 ? (
          <ProFormCheckbox.Group
            name="channels"
            width="md"
            label={intl.formatMessage({ id: 'select_channels', defaultMessage: '选择频道' })}
            rules={[{ required: true, message: '请选择至少一个频道' }]}
            options={currentRow.groups
              .filter((group: any) => group.type === 'channel')
              .map((channel: any) => ({
                label: channel.title,
                value: channel._id,
              }))}
          />
        ) : (
          <ProFormCheckbox
            width="md"
            label={intl.formatMessage({
              id: 'no_channels_joined',
              defaultMessage: '暂无频道',
            })}
            disabled
          />
        )}

        <ProFormDigit
          label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: '每行菜单数' })}
          name="menus_per_row"
          width="md"
          min={1}
          fieldProps={{ style: { width: '100%' } }}
        />

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
      </ProFormGroup>

      <ProFormDependency name={['sendType']}>
        {({ sendType }) =>
          sendType === 'scheduled' && (
            <>
              <ProFormGroup
                label={intl.formatMessage({ id: 'interval_time', defaultMessage: '发送间隔' })}
                style={{ marginBottom: 32 }}
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
                    name="interval"
                    width="xs"
                    min={1}
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
                <ProFormDigit
                  name="weight"
                  width="md"
                  label={intl.formatMessage({ id: 'weight', defaultMessage: '权重' })}
                  min={0}
                  tooltip="权重越小越靠前发送"
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

      <Form.Item name="bot" hidden>
        <Input value={currentRow?._id} />
      </Form.Item>
    </ModalForm>
  );
};

export default ChannelPostCreateForm;
