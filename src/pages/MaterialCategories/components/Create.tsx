import { useIntl } from '@umijs/max';
import { Modal } from 'antd';
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
  const [imageUrl, setImageUrl] = useState<string | undefined>('');

  // 修改 onFinish 方法
  const handleFinish = async (formData: any) => {
    formData.image = imageUrl; // 添加 imageUrl 到表单数据中，并命名为 image 以匹配后端代码
    await onFinish(formData);
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
      <BasicForm newRecord onFinish={handleFinish} setImageUrl={setImageUrl} />
    </Modal>
  );
};

export default Create;
