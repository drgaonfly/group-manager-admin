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
  const [, setImageUrl] = useState<string | undefined>('');
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'pages.searchTable.new' })}
      width="50%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={onFinish}
    >
      <BasicForm setImageUrl={setImageUrl} newRecord />
    </ModalForm>
  );
};

export default Create;
