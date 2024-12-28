import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import AnswerSelect from '@/components/AnswerSelect';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  setVideoUrl: (url: string) => void;
  videoUrl?: string | undefined;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values, setVideoUrl, videoUrl }) => {
  const intl = useIntl();

  const defaultFileList = videoUrl
    ? [
        {
          uid: '-1',
          name: 'video.mp4',
          status: 'done',
          url: videoUrl,
          type: 'video/mp4',
        },
      ]
    : undefined;

  return (
    <ProForm
      initialValues={{
        ...values,
        answer: values?.answer?.map((answer: any) => answer._id),
        videoUrl: videoUrl,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          videoUrl: videoUrl,
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

        <ProFormSelect
          name="issue"
          label={intl.formatMessage({ id: 'issue' })}
          valueEnum={{
            normal: { text: intl.formatMessage({ id: 'issue.normal', defaultMessage: 'Normal' }) },
            unfriendly: {
              text: intl.formatMessage({ id: 'issue.unfriendly', defaultMessage: 'Unfriendly' }),
            },
            recogError: {
              text: intl.formatMessage({
                id: 'issue.recogError',
                defaultMessage: 'Recognition Error',
              }),
            },
            videoError: {
              text: intl.formatMessage({ id: 'issue.videoError', defaultMessage: 'Video Error' }),
            },
          }}
        />
      </ProForm.Group>

      <ProForm.Group>
        <Form.Item required label={intl.formatMessage({ id: 'video_url' })} name="video">
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setVideoUrl(url);
            }}
            accept=".mp4,.avi,.mov,.flv,.wmv"
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
