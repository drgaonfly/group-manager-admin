import { Form, message } from 'antd';
import { ModalForm } from '@ant-design/pro-components';
import { useState } from 'react';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { FormattedMessage } from '@umijs/max';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const BatchUploadPriceModal: React.FC<Props> = ({ open, onOpenChange, onFinish }) => {
  const [file, setFile] = useState<string>('');

  return (
    <ModalForm
      title={<FormattedMessage id="batch_upload_price" defaultMessage="Batch Upload Price" />}
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values: any) => {
        if (!file) {
          message.error(
            <FormattedMessage
              id="ensure_file_uploaded"
              defaultMessage="Please ensure a spreadsheet file has been uploaded"
            />,
          );
          return;
        }
        await onFinish({
          ...values,
          file,
        });
        onOpenChange(false);
      }}
    >
      <Form.Item
        label={<FormattedMessage id="spreadsheet_file" defaultMessage="Spreadsheet File" />}
        name="file"
      >
        <div style={{ marginBottom: '30px' }}>
          <a href="/api/static/UserPriceListTemplate.xlsx" download>
            <FormattedMessage id="download_template" defaultMessage="Download Template" />
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

export default BatchUploadPriceModal;
