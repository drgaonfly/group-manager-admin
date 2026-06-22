import { useIntl, FormattedMessage } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormCheckbox,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormSwitch,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Form, Input, Space } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
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
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [content, setContent] = useState(toQuillHtml(values?.content || ''));
  const [menus, setMenus] = useState<menuItem[]>(
    (values?.menus || []).map((m: any, idx: number) => ({
      _id: m._id || `menu-${idx}`,
      name: m.name,
      url: m.url,
      row: m.row ?? 0,
    })),
  );
  const [medias, setMedias] = useState<string[]>(
    Array.isArray(values?.medias) ? values.medias : values?.image ? [values.image] : [],
  );

  const { timeUnit: initialTimeUnit, value: initialIntervalTime } = minutesToTimeUnit(
    values?.intervalTime,
  );

  useEffect(() => {
    if (values?.content !== undefined) {
      setContent(toQuillHtml(values.content));
    }
    if (Array.isArray(values?.medias)) {
      setMedias(values.medias);
    } else if (values?.image) {
      setMedias([values.image]);
    } else {
      setMedias([]);
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
  }, [values?.content, values?.medias, values?.image, values?.menus]);

  const defaultMediaFileList: UploadFile[] = medias.map((media, idx) => ({
    uid: String(idx + 1),
    name: `media${idx + 1}`,
    status: 'done' as UploadFile['status'],
    url: media,
  }));

  const menuColumns: ProColumns<menuItem>[] = [
    {
      title: intl.formatMessage({ id: 'name', defaultMessage: '按钮名称' }),
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
  ];

  return (
    <ProForm
      initialValues={{
        ...values,
        bot: values?.bot?._id || values?.bot,
        groups:
          values?.groups && Array.isArray(values.groups)
            ? values.groups.map((g: any) => g?._id || g)
            : [],
        medias: medias,
        startAt: toDayjs(values?.startAt),
        endAt: toDayjs(values?.endAt),
        timeUnit: initialTimeUnit,
        intervalTime: initialIntervalTime,
      }}
      onFinish={async (formValues) => {
        const telegramContent = convertToTelegramHtml(content);
        const intervalTime = timeUnitToMinutes(
          formValues.intervalTime || 0,
          formValues.timeUnit as TimeUnit,
        );
        await onFinish({
          ...formValues,
          content: telegramContent,
          medias: medias,
          menus: menus.map(({ name, url, row }) => ({ name, url, row: row ?? 0 })),
          intervalTime,
          startAt: toISOString(formValues.startAt),
          endAt: toISOString(formValues.endAt),
        });
      }}
      submitter={{
        render: (_, dom) => {
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
    >
      {/* 富文本编辑器 */}
      <Form.Item
        label={intl.formatMessage({ id: 'content', defaultMessage: '消息内容' })}
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

      <ProForm.Group>
        <Form.Item label={intl.formatMessage({ id: 'media', defaultMessage: '媒体文件' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
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
      </ProForm.Group>

      <ProForm.Group>
        {values?.bot?.groups?.length > 0 ? (
          <ProFormCheckbox.Group
            name="groups"
            width="md"
            label={intl.formatMessage({ id: 'select_groups', defaultMessage: '选择群组' })}
            options={values.bot.groups
              .filter((group: any) => group.type !== 'channel')
              .map((group: any) => ({
                label: group.title,
                value: group._id,
              }))}
          />
        ) : (
          <ProFormCheckbox
            width="md"
            label={intl.formatMessage({
              id: 'no_groups_joined',
              defaultMessage: '暂无群组',
            })}
            disabled
          />
        )}
      </ProForm.Group>

      <ProForm.Group
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
          <ProFormDigit name="intervalTime" width="xs" min={0} noStyle />
        </Space>
      </ProForm.Group>

      <ProForm.Group>
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
      </ProForm.Group>

      <ProForm.Group>
        <ProFormSwitch
          name="autoDeletePrevious"
          label={intl.formatMessage({
            id: 'auto_delete_previous',
            defaultMessage: '自动删除上一条',
          })}
          tooltip="发送新消息前，自动删除该群组上一条已发送的消息"
        />
      </ProForm.Group>

      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'inline_menu_config',
          defaultMessage: '内联菜单配置',
        })}
        columns={menuColumns}
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
            row: 0,
          }),
        }}
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
