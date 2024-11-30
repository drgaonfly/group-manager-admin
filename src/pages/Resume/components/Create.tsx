import { useIntl } from '@umijs/max';
import { ModalForm } from '@ant-design/pro-components';
import BasicForm from './BasicForm';

interface CreateFormProps {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (values: any) => Promise<boolean | void>;
}

const Create: React.FC<CreateFormProps> = ({ open, onOpenChange, onFinish }) => {
  const intl = useIntl();

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'create' })}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={onFinish}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
    >
      <BasicForm />
    </ModalForm>
  );
};

export default Create;
