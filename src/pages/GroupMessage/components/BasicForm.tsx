import { useIntl } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ProForm,
  ProFormTextArea,
  ProFormDigit,
  ProFormCheckbox,
  ProFormText,
  ProFormList,
} from '@ant-design/pro-components';
import { Alert, Form, Input } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  // images: string[]
  const [images, setImages] = useState<string[]>(
    Array.isArray(values?.images) ? values.images : values?.image ? [values.image] : [],
  );

  useEffect(() => {
    if (Array.isArray(values?.images)) {
      setImages(values.images);
    } else if (values?.image) {
      setImages([values.image]);
    } else {
      setImages([]);
    }
  }, [values?.images, values?.image]);

  // Default file list for showing existing images
  const defaultImageFileList: UploadFile[] = images.map((img, idx) => ({
    uid: String(idx + 1),
    name: `image${idx + 1}`,
    status: 'done' as UploadFile['status'],
    url: img,
  }));

  return (
    <ProForm
      initialValues={{
        ...values,
        bot: values?.bot?._id || values?.bot,
        groups: values?.groups?.map((g: any) => g?._id || g),
        menus: values?.menus || [],
        images: images,
      }}
      onFinish={async (formValues) => {
        // 兼容后端 images 字段
        await onFinish({
          ...formValues,
          images: images,
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
      <ProForm.Group>
        <Alert
          message={
            '支持的 Telegram 标签：' +
            '<b>加粗</b>、' +
            '<i>斜体</i>、' +
            '<u>下划线</u>、' +
            '<s>删除线</s>、' +
            '<code>代码</code>、' +
            '<pre>预格式化</pre>、' +
            '<a>链接</a>'
          }
          type="warning"
          showIcon
        />

        <ProFormTextArea
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'content', defaultMessage: '消息内容' })}
          name="content"
          fieldProps={{
            autoSize: { minRows: 10 },
          }}
        />

        <Form.Item label={intl.formatMessage({ id: 'image', defaultMessage: '图片' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              // 支持多图
              setImages((prev) => [...prev, signedUrl || url]);
            }}
            accept=".jpg,.jpeg,.png,.gif"
            defaultFileList={defaultImageFileList}
            multiple
            onRemove={(file: UploadFile) => {
              setImages((prev) => prev.filter((img) => img !== file.url));
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

        <ProFormDigit
          name="weight"
          width="sm"
          label={intl.formatMessage({ id: 'weight', defaultMessage: '权重' })}
          min={0}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormCheckbox.Group
          name="groups"
          width="md"
          label={intl.formatMessage({ id: 'select_groups', defaultMessage: 'Select Groups' })}
          options={values.bot.groups.map((group: any) => ({
            label: group.title,
            value: group._id,
          }))}
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
