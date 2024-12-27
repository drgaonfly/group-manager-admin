import { useIntl } from '@umijs/max';
import { Modal } from 'antd';
import BasicForm from './BasicForm';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
  setVideoUrl: (url: string) => void;
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish, setVideoUrl } = props;
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
      <BasicForm newRecord setVideoUrl={setVideoUrl} onFinish={onFinish} />
    </Modal>
  );
};

export default Create;
