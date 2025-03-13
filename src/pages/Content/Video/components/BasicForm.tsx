import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import AliyunS3Upload from '@/components/Upload';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  url?: string;
  setUrl: (url: string) => void;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values, setUrl, url }) => {
  const intl = useIntl();
  const [formRef] = ProForm.useForm();

  const defaultFilevideoList = url
    ? [
        {
          uid: '-1',
          name: 'video.mp4',
          status: 'done',
          url: url,
          type: 'video/mp4',
        },
      ]
    : undefined;

  const handleFormFinish = async (formData: any) => {
    try {
      // 构建提交数据
      const submitData = {
        ...formData,
        url: url,
      };

      await onFinish(submitData);
    } catch (error) {
      console.error('表单提交错误:', error);
      message.error('提交失败，请重试');
    }
  };

  return (
    <ProForm
      form={formRef}
      initialValues={{
        ...values,
        url: values?.url || '',
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
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />

        {/* 视频介绍字段 */}
        <Form.Item required label={intl.formatMessage({ id: 'video_url' })} name="url">
          <AliyunS3Upload
            onFileUpload={(url: string) => {
              setUrl(url);
            }}
            accept=".mp4,.avi,.mov,.flv,.wmv"
            defaultFileList={defaultFilevideoList}
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
