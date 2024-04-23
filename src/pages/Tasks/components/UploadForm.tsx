import React, { useState } from 'react';
import { ModalForm } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    roles?: { id: number }[];
  } & Partial<API.ItemData>;
};

const UploadForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [file, setFile] = useState<string>('');
  return (
    <ModalForm
      title="上传账单"
      width="40%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (values: any) => {
        if (!file) {
          message.error('请上传账单文件');
          return;
        }

        await onSubmit({
          ...values,
          billFile: file,
        });
      }}
      initialValues={{ ...values }}
    >
      <Form.Item required label="账单文件" name="billFile">
        <div style={{ marginBottom: '30px' }}>
          <a href="https://ordersystem-new.2024fc.xyz/api/static/账单模板.xlsx" download>
            下载模板
          </a>
        </div>
        <AliyunOSSUpload
          onFileUpload={(url: string) => {
            console.log('Uploaded file URL:', url);
            setFile!(url);
          }}
          accept=".xls,.xlsx"
        />
      </Form.Item>
      <Form.Item name="_id" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default UploadForm;
