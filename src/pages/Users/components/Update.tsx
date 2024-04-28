import React from 'react';
import BasicForm from './BasicForm';
import { Modal } from 'antd';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    roles?: { id: number }[];
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  return (
    <Modal
      maskClosable={false}
      width="50%"
      destroyOnClose
      title="编辑用户"
      open={updateModalOpen}
      footer={false}
      onCancel={() => onCancel(false)}
    >
      <BasicForm values={values} onFinish={onSubmit} />
    </Modal>
  );
};

export default UpdateForm;
