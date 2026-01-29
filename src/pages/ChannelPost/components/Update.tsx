import { useIntl } from '@umijs/max';
import React from 'react';
import BasicForm from './BasicForm';
import { Modal } from 'antd';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    _id?: string;
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;

  const handleSubmit = async (formValues: any) => {
    await onSubmit(formValues);
  };

  return (
    <Modal
      maskClosable={false}
      width="50%"
      destroyOnClose
      title={intl.formatMessage({ id: 'modify' })}
      open={updateModalOpen}
      footer={false}
      onCancel={() => onCancel(false)}
    >
      <BasicForm values={values} onFinish={handleSubmit} hideScheduleOptions />
    </Modal>
  );
};

export default UpdateForm;
