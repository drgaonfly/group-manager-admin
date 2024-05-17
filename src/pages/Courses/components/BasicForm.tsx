import { useIntl } from '@umijs/max';
import { ProForm, ProFormText, ProFormDigit } from '@ant-design/pro-components';
import React from 'react';
import { Form } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  newRecord?: boolean;
  setVideoUrl: (url: string) => void;
  videoUrl?: string | undefined;
  values?: any;
}

const BasicForm: React.FC<Props> = (props) => {
  const { setVideoUrl, videoUrl } = props;
  const intl = useIntl();

  const defaultFileList = videoUrl
    ? [
        {
          uid: '-1',
          name: 'video.mp4',
          status: 'done',
          url: videoUrl,
        },
      ]
    : [];
  return (
    <>
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_title' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'title' })}
          name="title"
          placeholder={intl.formatMessage({ id: 'enter_title' })}
        />
        <Form.Item required label={intl.formatMessage({ id: 'video_url' })} name="videoUrl">
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setVideoUrl(url);
            }}
            accept=".mp4,.avi,.mov,.flv,.wmv"
            defaultFileList={defaultFileList}
          />
        </Form.Item>

        <ProFormDigit
          label={intl.formatMessage({ id: 'duration' })}
          name="duration"
          width="md"
          min={0}
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_duration' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_duration' })}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'weight' })}
          name="weight"
          width="md"
          min={0}
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_weight' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_weight' })}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
