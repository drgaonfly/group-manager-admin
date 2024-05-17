import { useIntl } from '@umijs/max';
import { ProForm } from '@ant-design/pro-components';
import React from 'react';
import { Form } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  newRecord?: boolean;
  setImageUrl?: (url: string) => void;
  imageUrl?: string | undefined;
  values?: any;
}

const BasicForm: React.FC<Props> = (props) => {
  const { setImageUrl, imageUrl } = props;
  const intl = useIntl();

  const defaultFileList = imageUrl
    ? [
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: imageUrl,
        },
      ]
    : [];
  return (
    <>
      <ProForm.Group>
        <Form.Item
          required
          label={intl.formatMessage({ id: 'image', defaultMessage: 'Image' })}
          name="image"
        >
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setImageUrl!(url);
            }}
            accept=".jpg,.jpeg,.png,.pdf"
            defaultFileList={defaultFileList}
          />
        </Form.Item>
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
