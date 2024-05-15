import React, { useState } from 'react';
import { ModalForm } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { useIntl } from '@umijs/max';

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
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [file, setFile] = useState<string>('');
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'upload_bill', defaultMessage: 'Upload Bill' })}
      width="40%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (values: any) => {
        if (!file) {
          message.error(
            intl.formatMessage({
              id: 'upload_bill_file_prompt',
              defaultMessage: 'Please upload the bill file',
            }),
          );
          return;
        }

        await onSubmit({
          ...values,
          billFile: file,
        });
      }}
      initialValues={{ ...values }}
    >
      <Form.Item
        required
        label={intl.formatMessage({ id: 'bill_file', defaultMessage: 'Bill File' })}
        name="billFile"
      >
        <div style={{ marginBottom: '30px' }}>
          <a href="https://backend.maomaozhaocai.com/api/static/BillTemplate.xlsx" download>
            {intl.formatMessage({ id: 'download_template', defaultMessage: 'Download Template' })}
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
