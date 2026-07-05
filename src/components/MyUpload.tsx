import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { UploadProps } from 'antd/lib/upload/interface';
import { useIntl } from '@umijs/max';
import { UploadFile } from 'antd/lib/upload/interface';

interface MyUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string; // 使accept属性可选
  url?: string;
  onRemove?: (file: UploadFile) => boolean; // Add onRemove to props
  multiple?: boolean;
  maxCount?: number;
  fileList?: UploadFile[];
}

const MyUpload: React.FC<MyUploadProps> = ({
  onFileUpload,
  accept,
  url = '/upload',
  onRemove,
  multiple,
  maxCount,
  fileList,
}) => {
  const intl = useIntl();
  // 定义默认的accept值
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

      console.log('response:-----------------------------', response);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response);
        }
        const httpUrl = response.data.file; // 假设返回的signedURL就在data字段中
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
    // beforeUpload: (file) => {
    //   const isLessThan2M = file.size / 1024 / 1024 < 6; // 检查文件大小是否小于2MB
    //   if (!isLessThan2M) {
    //     message.error('文件大小不能超过6MB!');
    //   }
    //   return isLessThan2M; // 如果文件大于2MB，不上传文件
    // },
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
      multiple={multiple ?? false}
      accept={accept || defaultAccept}
      maxCount={maxCount}
      fileList={fileList}
      style={{ width: '100%', maxWidth: 328 }}
      onRemove={onRemove}
      onChange={(info) => {
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
        if (props.onChange) {
          props.onChange(info);
        }
      }}
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
