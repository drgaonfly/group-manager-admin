import React, { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { FormattedMessage, request } from '@umijs/max';

interface S3DataType {
  url: string;
  key: string;
  host: string;
  expire: string;
}

interface S3UploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  accept?: string;
  onFileUpload: (url: string) => void;
  defaultFileList?: any;
}

const defaultAccept = '*';

const S3Upload = ({ value, onChange, accept, defaultFileList, onFileUpload }: S3UploadProps) => {
  const [S3Data, setS3Data] = useState<S3DataType>();

  // Fetch S3 Data from Backend API
  const fetchS3Data = async (fileName: string, contentType: string) => {
    try {
      const data = await request('/upload/get-credentials', {
        method: 'POST',
        data: { fileName, contentType },
      });
      setS3Data(data);
    } catch (error: any) {
      message.error(`Failed to get S3 data: ${error.message}`);
    }
  };

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    console.log('S3:', fileList);
    if (fileList?.length > 0) {
      const lastFile = fileList[fileList.length - 1]; // Get the last file object
      const lastFileUrl = lastFile.url;
      onFileUpload(lastFileUrl!);
    }
    onChange?.([...fileList]);
  };

  const onRemove = (file: UploadFile) => {
    const files = (value || []).filter((v) => v.url !== file.url);
    console.log(files);
    onChange?.(files);
  };

  const beforeUpload: UploadProps['beforeUpload'] = async (file: any) => {
    if (!S3Data) return false;

    const expire = Number(S3Data.expire);
    if (expire < Date.now()) {
      await fetchS3Data(file.name, file.type);
    }

    // Use pre-signed URL to upload to S3
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', S3Data.key);
    formData.append('x-amz-signature', S3Data.url.split('?')[1]); // Use the URL's signature part for authentication

    // Upload the file directly to S3 using the pre-signed URL
    await fetch(S3Data.url, {
      method: 'PUT',
      body: formData,
    });

    // Construct the final URL of the uploaded file
    file.url = `${S3Data.host}/${S3Data.key}`;

    return file;
  };

  const uploadProps: UploadProps = {
    name: 'file',
    fileList: value,
    action: S3Data?.url,
    onChange: handleChange,
    onRemove,
    accept: accept || defaultAccept,
    beforeUpload,
  };

  return (
    <Upload.Dragger
      {...uploadProps}
      listType="picture"
      showUploadList={{ showRemoveIcon: true }}
      maxCount={1}
      style={{ width: 328 }}
      defaultFileList={defaultFileList}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        <FormattedMessage
          id="upload_text"
          defaultMessage="Click or drag file to this area to upload"
        />
      </p>
    </Upload.Dragger>
  );
};

export default S3Upload;
