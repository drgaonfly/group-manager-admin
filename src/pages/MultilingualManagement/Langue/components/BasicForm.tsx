import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import Upload from '@/components/AliyunOSSUpload';

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
        message.error(intl.formatMessage({ id: 'answers.image.required' }));
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

      <ProForm.Group>
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'answers.code' })}
          name="code"
        />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'answers.name' })}
          name="name"
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'answers.title' })}
          name="title"
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormSwitch label={intl.formatMessage({ id: 'answers.isDefault' })} name="isDefault" />

        <ProFormSwitch
          label={intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' })}
          name="isOnline"
          initialValue={false}
          checkedChildren={intl.formatMessage({ id: 'platform.online' })}
          unCheckedChildren={intl.formatMessage({ id: 'platform.offline' })}
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
