import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import Upload from '@/components/Upload';
import TopicSelect from '@/components/topicSelect';

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
        <TopicSelect />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'rowNumber' })}
          name="rowNumber"
          initialValue={1}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'brandName' })}
          name="brandName"
        />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'answers.skuName' })}
          name="skuName"
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'answers.sn' })}
          name="sn"
        />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'answers.spec' })}
          name="spec"
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
