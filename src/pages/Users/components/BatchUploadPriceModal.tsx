import { Form, message } from 'antd';
import { ModalForm } from '@ant-design/pro-components';
import { useState } from 'react';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const BatchUploadPriceModal: React.FC<Props> = ({ open, onOpenChange, onFinish }) => {
  const [file, setFile] = useState<string>('');

  return (
    <ModalForm
      title="批量上传价格"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values: any) => {
        // 确保在提交前已经上传了图片和资源
        if (!file) {
          message.error('请确保已上传表格文件');
          return;
        }
        // 将图片和资源URL添加到表单数据中
        await onFinish({
          ...values,
          file,
        });
        onOpenChange(false);
      }}
    >
      <Form.Item label="表格文件" name="file">
        <div style={{ marginBottom: '30px' }}>
          <a href="https://backend.maomaozhaocai.com/api/static/用户价格表模板.xlsx" download>
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
    </ModalForm>
  );
};

export default BatchUploadPriceModal;
