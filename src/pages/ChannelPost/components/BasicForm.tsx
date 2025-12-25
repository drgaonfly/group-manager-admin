import { useIntl } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormGroup,
  EditableProTable,
  ProFormSwitch,
  ProFormRadio,
  ProFormDependency,
  ProFormSelect,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { Form, Input, Space } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { FormattedMessage } from '@umijs/max';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';

type menuItem = {
  _id: string;
  name: string;
  url: string;
};

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  hideScheduleOptions?: boolean;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values, hideScheduleOptions }) => {
  const intl = useIntl();
  const [content, setContent] = useState(values?.content || '');
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>(values?.menus || []);
  const [medias, setMedias] = useState<string[]>(
    Array.isArray(values?.medias) ? values.medias : [],
  );

  useEffect(() => {
    if (values?.content !== undefined) {
      setContent(values.content);
    }
    if (values?.menus !== undefined) {
      setMenus(values.menus || []);
    }
    if (Array.isArray(values?.medias)) {
      setMedias(values.medias);
    }
  }, [values?.content, values?.menus, values?.medias]);

  const defaultMediaFileList: UploadFile[] = medias.map((media, idx) => ({
    uid: String(idx + 1),
    name: `media${idx + 1}`,
    status: 'done' as UploadFile['status'],
    url: media.startsWith('http') ? media : `/api/static/${media}`,
  }));

  return (
    <ProForm
      form={form}
      initialValues={{
        ...values,
        proxy: values?.proxy?._id,
        bot: values?.bot?._id,
        channels: values?.channels?.map((c: any) => c._id || c) || [],
        isOnline: values?.isOnline ?? true,
        isClearLastPost: values?.isClearLastPost ?? false,
        interval: values?.interval ?? 60,
        weight: values?.weight ?? 0,
        sendType: 'scheduled',
        timeUnit: 'minutes',
        menus_per_row: values?.menus_per_row ?? 1,
      }}
      submitter={{
        render: (_, dom) => (
          <div style={{ textAlign: 'right' }}>
            {dom.map((button, index) => (
              <span key={index} style={{ marginLeft: 8 }}>
                {button}
              </span>
            ))}
          </div>
        ),
      }}
      onFinish={async (formValues) => {
        const telegramContent = convertToTelegramHtml(content);
        await onFinish({
          ...formValues,
          content: telegramContent,
          menus: menus.map(({ name, url }) => ({ name, url })),
          medias: medias,
        });
      }}
    >
      {/* 富文本编辑器 - 单独占满一行 */}
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
        <ProFormCheckbox.Group
          name="channels"
          width="lg"
          label={intl.formatMessage({ id: 'select_channels', defaultMessage: '选择频道' })}
          rules={[{ required: true, message: '请选择至少一个频道' }]}
          options={
            values?.bot?.groups && Array.isArray(values.bot.groups)
              ? values.bot.groups
                  .filter((group: any) => group.type === 'channel')
                  .map((channel: any) => ({
                    label: channel.title,
                    value: channel._id,
                  }))
              : []
          }
        />
      </ProFormGroup>

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

      {!hideScheduleOptions && (
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
      )}

      {hideScheduleOptions && (
        <ProFormGroup>
          <ProFormDigit
            width="md"
            name="menus_per_row"
            label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: '每行菜单数' })}
            min={1}
            tooltip="设置内联菜单每行显示的按钮数量"
          />
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
      )}

      {!hideScheduleOptions && (
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
                    width="md"
                    name="weight"
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
      )}

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
              rules: [{ required: true, message: '请输入按钮名称' }],
            },
          },
          {
            title: intl.formatMessage({ id: 'url', defaultMessage: '链接地址' }),
            dataIndex: 'url',
            formItemProps: {
              rules: [{ required: true, message: '请输入链接地址' }],
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
        editable={{ type: 'multiple' }}
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

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
