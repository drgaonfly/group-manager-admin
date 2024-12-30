import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import AnswerSelect from '@/components/AnswerSelect';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  setvideo1: (url: string) => void;
  video1?: string | undefined;
  video2?: string | undefined;
  setvideo2: (url: string) => void;
}

const BasicForm: React.FC<Props> = ({
  newRecord,
  onFinish,
  values,
  setvideo1,
  video1,
  setvideo2,
  video2,
}) => {
  const intl = useIntl();

  const defaultFileList = video1
    ? [
        {
          uid: '-1',
          name: 'video1.mp4',
          status: 'done',
          url: video1,
          type: 'video/mp4',
        },
      ]
    : undefined;

  const defaultFileList2 = video2
    ? [
        {
          uid: '-1',
          name: 'video2.mp4',
          status: 'done',
          url: video2,
          type: 'video/mp4',
        },
      ]
    : undefined;

  return (
    <ProForm
      initialValues={{
        ...values,
        answer: values?.answer?._id,
        video1: video1,
        video2: video2,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          video1: video1,
          video2: video2,
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
        <AnswerSelect />

        <ProFormText
          name="answerCount"
          label={intl.formatMessage({ id: 'quantity' })}
          rules={[{ required: true }]}
          initialValue={1}
        />
      </ProForm.Group>

      <ProForm.Group>
        <Form.Item required label={intl.formatMessage({ id: 'video1' })}>
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setvideo1(url);
            }}
            accept=".mp4,.avi,.mov,.flv,.wmv"
            defaultFileList={defaultFileList}
          />
        </Form.Item>

        <Form.Item required label={intl.formatMessage({ id: 'video2' })}>
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              setvideo2(url);
            }}
            accept=".mp4,.avi,.mov,.flv,.wmv"
            defaultFileList={defaultFileList2}
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
