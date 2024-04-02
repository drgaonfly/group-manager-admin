import { ModalForm } from '@ant-design/pro-components';
import BasicForm from './BasicForm';
import { useState } from 'react';
import { message } from 'antd';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const Create: React.FC<Props> = (props) => {
  const { open, onOpenChange, onFinish } = props;
  const [file, setFile] = useState<string | undefined>('');
  const [reviewFile, setReviewFile] = useState<string | undefined>('');
  return (
    <ModalForm
      title="新增"
      width="50%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values) => {
        if (!file) {
          message.error('请上传文件');
          return;
        }
        await onFinish({
          ...values,
          file,
          uploadedFile: reviewFile,
        });
      }}
    >
      <BasicForm
        reviewFile={reviewFile}
        setReviewFile={setReviewFile}
        setFile={setFile}
        file={file}
        newRecord
      />
    </ModalForm>
  );
};

export default Create;
