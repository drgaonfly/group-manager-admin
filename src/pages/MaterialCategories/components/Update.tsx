import { useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import BasicForm from './BasicForm';
import { ModalForm } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import extractPathFromUrl from '@/utils/extractPathFromUrl';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    image?: string;
    parent?: any;
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [imageUrl, setImageUrl] = useState<string | undefined>('');

  useEffect(() => {
    setImageUrl(values.image);
  }, [values]);

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
      onFinish={async (values: any) => {
        onSubmit({
          ...values,
          image: extractPathFromUrl(imageUrl!),
        });
      }}
      initialValues={{ ...values, parent: values?.parent?._id }}
    >
      <BasicForm setImageUrl={setImageUrl} imageUrl={imageUrl} values={values} />
      <Form.Item name="_id" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;
