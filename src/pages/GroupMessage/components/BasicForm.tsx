import { useIntl } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import { ProForm, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components';
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
  const [imageUrl, setImageUrl] = useState<string>(values?.image || '');

  useEffect(() => {
    if (values?.image) {
      setImageUrl(values.image);
    }
  }, [values?.image]);

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

  return (
    <ProForm
      initialValues={{
        ...values,
        bot: values?.bot?._id || values?.bot,
        groups: values?.groups?.map((g: any) => g?._id || g),
      }}
      onFinish={async (formValues) => {
        await onFinish({
          ...formValues,
          image: imageUrl, // Pass the image URL in form submission
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
              setImageUrl(signedUrl || url);
            }}
            accept=".jpg,.jpeg,.png,.gif"
            defaultFileList={defaultImageFileList}
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
