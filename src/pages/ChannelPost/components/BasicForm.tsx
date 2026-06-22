import { useIntl } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormGroup,
  EditableProTable,
  ProFormSwitch,
  ProFormSelect,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Form, Input, Space } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { FormattedMessage } from '@umijs/max';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml, toQuillHtml } from '@/components/RichTextEditor';
import { minutesToTimeUnit, timeUnitToMinutes, TimeUnit } from '@/utils/intervalUtils';
import { toDayjs, toISOString } from '@/utils/dateUtils';

type menuItem = {
  _id: string;
  name: string;
  url: string;
  row: number;
};

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  /** 隐藏定时发送相关字段（间隔、开始/结束时间），用于复制创建等即时场景 */
  hideScheduleOptions?: boolean;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values, hideScheduleOptions }) => {
  const intl = useIntl();
  const [content, setContent] = useState(toQuillHtml(values?.content || ''));
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>(
    (values?.menus || []).map((m: any, idx: number) => ({
      _id: m._id || `menu-${idx}`,
      name: m.name,
      url: m.url,
      row: m.row ?? 0,
    })),
  );
  const [medias, setMedias] = useState<string[]>(
    Array.isArray(values?.medias) ? values.medias : [],
  );

  const { timeUnit: initialTimeUnit, value: initialInterval } = minutesToTimeUnit(values?.interval);

  useEffect(() => {
    if (values?.content !== undefined) {
      setContent(toQuillHtml(values.content));
    }
    if (values?.menus !== undefined) {
      setMenus(
        (values.menus || []).map((m: any, idx: number) => ({
          _id: m._id || `menu-${idx}`,
          name: m.name,
          url: m.url,
          row: m.row ?? 0,
        })),
      );
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
        channel: values?.channel?._id || values?.channel || undefined,
        isOnline: values?.isOnline ?? true,
        isClearLastPost: values?.isClearLastPost ?? false,
        interval: initialInterval,
        weight: values?.weight ?? 0,
        timeUnit: initialTimeUnit,
        startAt: values?.startAt ? toDayjs(values.startAt) : undefined,
        endAt: values?.endAt ? toDayjs(values.endAt) : undefined,
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
        const interval = timeUnitToMinutes(
          formValues.interval || 1,
          formValues.timeUnit as TimeUnit,
        );
        await onFinish({
          ...formValues,
          content: telegramContent,
          menus: menus.map(({ name, url, row }) => ({ name, url, row: row ?? 0 })),
          medias: medias,
          interval,
          startAt: toISOString(formValues.startAt),
          endAt: toISOString(formValues.endAt),
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
        {values?.bot?.groups?.length > 0 ? (
          <ProFormSelect
            name="channel"
            width="md"
            label={intl.formatMessage({ id: 'select_channel', defaultMessage: '选择频道' })}
            rules={[{ required: true, message: '请选择频道' }]}
            options={values.bot.groups
              .filter((group: any) => group.type === 'channel')
              .map((channel: any) => ({
                label: channel.title,
                value: channel._id,
              }))}
          />
        ) : (
          <ProFormSelect
            name="channel"
            width="md"
            label={intl.formatMessage({ id: 'select_channel', defaultMessage: '选择频道' })}
            disabled
            placeholder={intl.formatMessage({
              id: 'no_channels_joined',
              defaultMessage: '暂无频道',
            })}
            options={[]}
          />
        )}
      </ProFormGroup>

      {!hideScheduleOptions && (
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
              <ProFormDigit name="interval" width="xs" min={1} noStyle />
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
        </>
      )}

      <ProFormGroup>
        <ProFormDigit
          width="md"
          name="weight"
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
          label={intl.formatMessage({ id: 'clearLastPost', defaultMessage: '清除上条消息' })}
          tooltip="开启后，发送新消息前会删除上一条消息"
        />
      </ProFormGroup>

      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'inline_menu_config',
          defaultMessage: '内联菜单配置',
        })}
        columns={[
          {
            title: intl.formatMessage({ id: 'name', defaultMessage: '按钮名称' }),
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
            title: '行号',
            dataIndex: 'row',
            valueType: 'digit',
            width: 80,
            formItemProps: {
              rules: [{ required: true, message: '请输入行号' }],
            },
            fieldProps: {
              min: 0,
              precision: 0,
              placeholder: '0',
            },
            tooltip: '相同行号的按钮会显示在同一行',
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
            row: 0,
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
