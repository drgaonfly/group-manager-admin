import React, { useEffect, useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { FormattedMessage, request } from '@umijs/max';

interface OSSDataType {
  dir: string;
  expire: string;
  host: string;
  accessId: string;
  policy: string;
  signature: string;
}

interface AliyunOSSUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  accept?: string;
  onFileUpload: (url: string) => void;
  defaultFileList?: any;
}

const defaultAccept = '*';

const AliyunOSSUpload = ({
  value,
  onChange,
  accept,
  defaultFileList,
  onFileUpload,
}: AliyunOSSUploadProps) => {
  const [OSSData, setOSSData] = useState<OSSDataType>();

  // Fetch OSS Data from Backend API
  const fetchOSSData = async () => {
    try {
      const data = await request('/upload/get-credentials'); // Adjust the endpoint as necessary
      setOSSData(data);
    } catch (error: any) {
      message.error(`Failed to get OSS data: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchOSSData();
  }, []);

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    console.log('Aliyun OSS:', fileList[0]);
    if (fileList?.length > 0) {
      const lastFile = fileList[fileList.length - 1]; // 获取最后一个文件对象
      const lastFileUrl = lastFile.url;
      onFileUpload(lastFileUrl!);
    }
    onChange?.([...fileList]);
  };

  const onRemove = (file: UploadFile) => {
    const files = (value || []).filter((v) => v.url !== file.url);
    // console.log(files);
    onChange?.(files);
  };

  const getExtraData: UploadProps['data'] = (file) => ({
    key: file.url,
    OSSAccessKeyId: OSSData?.accessId,
    policy: OSSData?.policy,
    Signature: OSSData?.signature,
  });

  const beforeUpload: UploadProps['beforeUpload'] = async (file: any) => {
    if (!OSSData) return false;

    const expire = Number(OSSData.expire) * 1000;
    if (expire < Date.now()) {
      await fetchOSSData();
    }

    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    const filename = Date.now() + suffix;
    file.url = OSSData?.dir + filename; // Update file url to include the directory

    return file;
  };

  const uploadProps: UploadProps = {
    name: 'file',
    fileList: value,
    action: OSSData?.host,
    onChange: handleChange,
    onRemove,
    accept: accept || defaultAccept,
    data: getExtraData,
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

export default AliyunOSSUpload;
