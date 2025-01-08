import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import Upload from '@/components/Upload';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  setImageUrl: (url: string) => void;
  packgeImageUrl?: string;
  defaultFileList?: UploadFile[];
}

const BasicForm: React.FC<Props> = ({
  newRecord,
  onFinish,
  values,
  setImageUrl = () => {},
  packgeImageUrl,
}) => {
  const intl = useIntl();
  const [formRef] = ProForm.useForm();

  const defaultFileList = packgeImageUrl
    ? [
        {
          uid: '1',
          name: 'packageImage',
          status: 'done' as UploadFile['status'],
          url: packgeImageUrl,
        },
      ]
    : [];

  const handleFormFinish = async (formData: any) => {
    try {
      if (!packgeImageUrl) {
        message.error(intl.formatMessage({ id: 'image.required' }));
        return;
      }
      // 构建提交数据
      const submitData = {
        ...formData,
        image: packgeImageUrl,
      };

      await onFinish(submitData);
    } catch (error) {}
  };

  return (
    <ProForm
      form={formRef}
      initialValues={{
        ...values,
        image: packgeImageUrl,
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item required label={intl.formatMessage({ id: 'image' })}>
        <Upload
          onFileUpload={(url: string) => {
            console.log('Uploaded file URL:', url);
            setImageUrl(url);
          }}
          accept=".jpg,.jpeg,.png,.pdf"
          defaultFileList={defaultFileList}
        />
      </Form.Item>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
