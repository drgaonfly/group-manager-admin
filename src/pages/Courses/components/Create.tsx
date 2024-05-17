import { useIntl } from '@umijs/max';
import { ModalForm } from '@ant-design/pro-components';
import BasicForm from './BasicForm';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
  selectedRowsState: any;
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish } = props;
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'batch_setting' })}
      width="50%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={onFinish}
    >
      <BasicForm newRecord />
    </ModalForm>
  );
};

export default Create;
