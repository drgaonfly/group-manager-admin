import { useIntl } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormCheckbox,
  ProFormText,
  ProFormList,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [content, setContent] = useState(values?.content || '');

  // medias: string[]
  const [medias, setMedias] = useState<string[]>(
    Array.isArray(values?.medias) ? values.medias : values?.image ? [values.image] : [],
  );

  useEffect(() => {
    if (values?.content !== undefined) {
      setContent(values.content);
    }
    if (Array.isArray(values?.medias)) {
      setMedias(values.medias);
    } else if (values?.image) {
      setMedias([values.image]);
    } else {
      setMedias([]);
    }
  }, [values?.content, values?.medias, values?.image]);

  // Default file list for showing existing medias
  const defaultMediaFileList: UploadFile[] = medias.map((media, idx) => ({
    uid: String(idx + 1),
    name: `media${idx + 1}`,
    status: 'done' as UploadFile['status'],
    url: media,
  }));

  return (
    <ProForm
      initialValues={{
        ...values,
        bot: values?.bot?._id || values?.bot,
        groups:
          values?.groups && Array.isArray(values.groups)
            ? values.groups.map((g: any) => g?._id || g)
            : [],
        menus: values?.menus || [],
        medias: medias,
      }}
      onFinish={async (formValues) => {
        // 转换为 Telegram HTML 格式
        const telegramContent = convertToTelegramHtml(content);
        await onFinish({
          ...formValues,
          content: telegramContent,
          medias: medias,
        });
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
    >
      {/* 富文本编辑器 - 单独占满一行 */}
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
              // 支持多媒体
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
        <ProFormDigit
          width="md"
          label={intl.formatMessage({ id: 'interval_time_hour', defaultMessage: '间隔时间(小时)' })}
          name="intervalTime"
          min={0}
        />

        <ProFormDigit
          width="md"
          label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: '每行菜单数' })}
          name="menus_per_row"
          min={1}
        />
        {/* 
        <ProFormDigit
          name="weight"
          width="sm"
          label={intl.formatMessage({ id: 'weight', defaultMessage: '权重' })}
          min={0}
        /> */}
      </ProForm.Group>

      <ProForm.Group>
        <ProFormCheckbox.Group
          name="groups"
          width="md"
          label={intl.formatMessage({ id: 'select_groups', defaultMessage: 'Select Groups' })}
          options={
            values?.bot?.groups && Array.isArray(values.bot.groups)
              ? values.bot.groups.map((group: any) => ({
                  label: group.title,
                  value: group._id,
                }))
              : []
          }
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormList
          name="menus"
          label={intl.formatMessage({ id: 'menu', defaultMessage: '内联菜单' })}
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '添加菜单',
          }}
          itemRender={({ listDom, action }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>{listDom}</div>
              {action}
            </div>
          )}
        >
          <ProForm.Group compact>
            <ProFormText
              name="menuName"
              label="菜单名"
              placeholder={intl.formatMessage({ id: 'menu_name', defaultMessage: '菜单名称' })}
              rules={[{ required: true, message: '请输入菜单名称' }]}
              width="md"
            />
            <ProFormText
              name="url"
              label={intl.formatMessage({ id: 'menu_url', defaultMessage: '菜单链接' })}
              placeholder="请输入 URL，例如 https://example.com"
              rules={[
                { required: true, message: '请输入链接地址' },
                {
                  type: 'url',
                  message: '请输入合法的 URL（必须以 http 或 https 开头）',
                  validateTrigger: 'onBlur',
                },
              ]}
              width="xl"
            />
          </ProForm.Group>
        </ProFormList>
      </ProForm.Group>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
