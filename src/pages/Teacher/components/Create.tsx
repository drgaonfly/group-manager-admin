import { useIntl } from '@umijs/max';
import { Modal, message } from 'antd';
import BasicForm from './BasicForm';
import { useState } from 'react';
// import extractPathFromUrl from '@/utils/extractPathFromUrl';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish } = props;
  const [imageUrl, setImageUrl] = useState<string | undefined>('');

  const handleFormFinish = async (values: any) => {
    if (!imageUrl) {
      message.error(intl.formatMessage({ id: 'message.error.imageUpload' }));
      return;
    }

    await onFinish({
      ...values,
    });
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'add_new' })}
      width="45%"
      open={open}
      onCancel={() => onOpenChange(false)}
      destroyOnClose={true}
      maskClosable={false}
      footer={null}
    >
      <BasicForm
        newRecord
        onFinish={handleFormFinish}
        setImageUrl={setImageUrl}
        imageUrl={imageUrl}
      />
    </Modal>
  );
};

export default Create;
