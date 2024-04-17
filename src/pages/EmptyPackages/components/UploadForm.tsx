import React, { useState } from 'react';
import { ModalForm } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import MyUpload from '@/components/MyUpload';

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
        <MyUpload
          accept=".xls,.xlsx"
          onFileUpload={(data: any) => {
            console.log('Uploaded resource URL:', data);
            setFile(data); // Assuming 'data' is an array of objects with a 'title' property
          }}
        />
      </Form.Item>
      <Form.Item name="_id" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default UploadForm;
