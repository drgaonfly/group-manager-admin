import { useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import BasicForm from './BasicForm';
import { Modal } from 'antd';
// import extractPathFromUrl from '@/utils/extractPathFromUrl';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    avatar?: {
      url?: string;
    };
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [imageUrl, setImageUrl] = useState<string | undefined>(values.avatar?.url || '');

  useEffect(() => {
    setImageUrl(values.avatar?.url);
  }, [values]);

  const handleSubmit = async (formValues: any) => {
    await onSubmit({
      ...formValues,
    });
  };

  return (
    <Modal
      maskClosable={false}
      width="70%"
      destroyOnClose
      title={intl.formatMessage({ id: 'modify' })}
      open={updateModalOpen}
      footer={false}
      onCancel={() => onCancel(false)}
    >
      <BasicForm
        values={values}
        onFinish={handleSubmit}
        setImageUrl={setImageUrl}
        imageUrl={imageUrl}
      />
    </Modal>
  );
};

export default UpdateForm;
