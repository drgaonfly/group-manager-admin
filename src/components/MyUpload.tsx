import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { UploadProps } from 'antd/lib/upload/interface';

interface MyUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string; // 使accept属性可选
}

const MyUpload: React.FC<MyUploadProps> = ({ onFileUpload, accept }) => {
  // 定义默认的accept值
  const defaultAccept = '*';

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as Blob);

    try {
      const response = await request<{ success: boolean; data: any }>('/upload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });

      console.log('response:', response);

      if (response.success) {
        message.success('上传成功');
        if (onSuccess) {
          onSuccess(response);
        }
        const httpUrl = response.data.file; // 假设返回的signedURL就在data字段中
        onFileUpload(httpUrl);
      } else {
        message.error('上传失败');
        if (onError) {
          onError(new Error('上传失败'));
        }
      }
    } catch (error) {
      message.error('上传异常');
      if (onError) {
        onError(new Error('上传异常'));
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
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
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
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
    </Upload.Dragger>
  );
};

export default MyUpload;
