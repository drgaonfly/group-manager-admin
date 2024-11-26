import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import { useIntl } from '@umijs/max';

interface MyUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string;
  url?: string;
  defaultFileList?: UploadFile[];
}

const MyUpload: React.FC<MyUploadProps> = ({
  onFileUpload,
  accept,
  url = '/upload',
  defaultFileList = [],
}) => {
  const intl = useIntl();
  const defaultAccept = '*';

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as Blob);

    try {
      const response = await request<{ success: boolean; data: any }>(url, {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });

      console.log('response:', response);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response);
        }
        // const httpUrl = response.data.file;
        // onFileUpload(httpUrl);
        const httpUrl = response.data.signedURL;
        onFileUpload(httpUrl);
      } else {
        message.error(intl.formatMessage({ id: 'upload_failed', defaultMessage: 'Upload failed' }));
        if (onError) {
          onError(
            new Error(intl.formatMessage({ id: 'upload_failed', defaultMessage: 'Upload failed' })),
          );
        }
      }
    } catch (error) {
      message.error(
        intl.formatMessage({ id: 'upload_exception', defaultMessage: 'Upload exception' }),
      );
      if (onError) {
        onError(
          new Error(
            intl.formatMessage({ id: 'upload_exception', defaultMessage: 'Upload exception' }),
          ),
        );
      }
    }
  };

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    customRequest,
    showUploadList: true,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(
          intl.formatMessage(
            { id: 'file_upload_success', defaultMessage: '{name} file uploaded successfully' },
            { name: info.file.name },
          ),
        );
      } else if (info.file.status === 'error') {
        message.error(
          intl.formatMessage(
            { id: 'file_upload_failure', defaultMessage: '{name} file upload failed' },
            { name: info.file.name },
          ),
        );
      }
    },
  };

  return (
    <Upload.Dragger
      {...props}
      listType="picture"
      showUploadList={{ showRemoveIcon: true }}
      multiple={false}
      accept={accept || defaultAccept}
      maxCount={1}
      style={{ width: 328 }}
      defaultFileList={defaultFileList}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        {intl.formatMessage({
          id: 'upload_text',
          defaultMessage: 'Click or drag file to this area to upload',
        })}
      </p>
    </Upload.Dragger>
  );
};

export default MyUpload;
