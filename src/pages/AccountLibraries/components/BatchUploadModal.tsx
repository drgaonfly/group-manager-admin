import { Form, message } from 'antd';
import { ModalForm } from '@ant-design/pro-components';
import { useState } from 'react';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { useIntl } from '@umijs/max';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const BatchUploadModal: React.FC<Props> = ({ open, onOpenChange, onFinish }) => {
  const [file, setFile] = useState<string>('');
  const intl = useIntl();

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'batch_upload_title',
        defaultMessage: 'Batch Upload Accounts',
      })}
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values: any) => {
        if (!file) {
          message.error(
            intl.formatMessage({
              id: 'ensure_file_uploaded',
              defaultMessage: 'Please ensure a table file has been uploaded',
            }),
          );
          return;
        }
        await onFinish({
          ...values,
          file,
        });
      }}
    >
      <Form.Item
        label={intl.formatMessage({ id: 'table_file', defaultMessage: 'Table File' })}
        name="file"
      >
        <div style={{ marginBottom: '30px' }}>
          <a
            href="https://backend.maomaozhaocai.com/api/static/AccountRepositoryTemplate.xlsx"
            download
          >
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
    </ModalForm>
  );
};

export default BatchUploadModal;
