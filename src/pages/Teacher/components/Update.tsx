import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import BasicForm from './BasicForm';
import { ModalForm } from '@ant-design/pro-components';
import { Form } from 'antd';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [imageUrl, setImageUrl] = useState<string | undefined>(values.imageUrl);

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'modify' })}
      width="50%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (formValues: FormValueType) => {
        await onSubmit({
          ...values,
          ...formValues,
          imageUrl,
        });
        return true;
      }}
      initialValues={values}
    >
      <BasicForm
        values={values}
        onFinish={async (formValues) => {
          await onSubmit({
            ...values,
            ...formValues,
            imageUrl,
          });
        }}
        setImageUrl={setImageUrl}
      />
      <Form.Item name="_id" hidden>
        <input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;
