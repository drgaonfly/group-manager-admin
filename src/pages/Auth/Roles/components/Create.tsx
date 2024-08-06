import { useIntl } from '@umijs/max';
import { FormInstance, Modal } from 'antd';
import BasicForm from './BasicForm';
import { values } from 'lodash';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

interface Props {
  form?: FormInstance<any>;
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish } = props;
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
      <BasicForm values={values} newRecord onFinish={onFinish} />
    </Modal>
  );
};

export default Create;
