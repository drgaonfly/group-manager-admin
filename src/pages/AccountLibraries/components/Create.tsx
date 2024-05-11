import { useIntl } from '@umijs/max';
import { ModalForm } from '@ant-design/pro-components';
import BasicForm from './BasicForm';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish } = props;
  const [file, setFile] = useState<string | undefined>('');
  const [reviewFile, setReviewFile] = useState<string | undefined>('');
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_new' })}
      width="50%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          file: file,
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
