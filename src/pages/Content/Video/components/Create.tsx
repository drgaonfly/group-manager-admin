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
  const [videoUrl, setVideoUrl] = useState<string | undefined>('');

  const handleFormFinish = async (values: any): Promise<void> => {
    await onFinish({
      ...values,
      videoUrl: videoUrl,
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
      <BasicForm newRecord setUrl={setVideoUrl} url={videoUrl} onFinish={handleFormFinish} />
    </ModalForm>
  );
};

export default Create;
