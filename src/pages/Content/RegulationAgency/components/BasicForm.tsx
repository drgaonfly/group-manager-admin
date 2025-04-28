// Start of Selection
import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm } from '@ant-design/pro-components';
import { Form, Input, message, UploadFile } from 'antd';
import AliyunOSSUpload from '@/components/Upload';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  setlogoUrl: (url: string) => void;
  logoUrl?: string;
  defaultFileList?: UploadFile[];
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values, setlogoUrl, logoUrl }) => {
  const intl = useIntl();

  const defaultFileList: UploadFile[] = logoUrl
    ? [
        {
          uid: '-1',
          name: 'logoUrl.png',
          status: 'done' as const,
          url: logoUrl,
        },
      ]
    : [];

  const handleFormFinish = async (formData: any) => {
    try {
      // 构建提交数据
      const submitData = {
        ...formData,
        logoUrl: logoUrl,
      };

      await onFinish(submitData);
    } catch (error) {
      console.error('表单提交错误:', error);
      message.error('提交失败，请重试');
    }
  };

  return (
    <ProForm
      initialValues={{
        ...values,
        name: values?.name || '', // Ensure `name` is initialized
        website: values?.website || '', // Ensure `website` is initialized
        logoUrl: logoUrl,
      }}
      onFinish={handleFormFinish}
      submitter={{
        render: (props, dom) => (
          <div style={{ textAlign: 'right' }}>
            {dom.map((button, index) => (
              <span key={index} style={{ marginLeft: 8 }}>
                {button}
              </span>
            ))}
          </div>
        ),
      }}
    >
      <ProForm.Group>
        <Form.Item label={intl.formatMessage({ id: 'logoUrl' })} name="logoUrl">
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setlogoUrl!(url);
            }}
            accept=".jpg,.jpeg,.png,.pdf"
            defaultFileList={defaultFileList}
          />
        </Form.Item>
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
