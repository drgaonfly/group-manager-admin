import { useIntl } from '@umijs/max';
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
  const intl = useIntl();
  const { open, onOpenChange, onFinish } = props;
  const [imageUrl, setImageUrl] = useState<string | undefined>('');

  const handleFormFinish = async (values: any): Promise<void> => {
    if (!imageUrl) {
      message.error(intl.formatMessage({ id: 'message.error.imageUpload' }));
      return;
    }
    await onFinish({
      ...values,
      logoUrl: imageUrl,
    });
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_new' })}
      width="45%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        footer: null,
      }}
      submitter={false}
      onFinish={async (values) => {
        await handleFormFinish(values);
        return true;
      }}
    >
      <BasicForm newRecord setImageUrl={setImageUrl} onFinish={handleFormFinish} />
    </ModalForm>
  );
};

export default Create;
