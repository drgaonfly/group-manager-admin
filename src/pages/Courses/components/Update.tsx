import { useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import BasicForm from './BasicForm';
import { ModalForm } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    videoUrl?: string;
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [videoUrl, setVideoUrl] = useState<string | undefined>('');
  useEffect(() => {
    setVideoUrl(values.videoUrl);
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
          videoUrl,
        });
      }}
      initialValues={{ ...values }}
    >
      <BasicForm videoUrl={videoUrl} setVideoUrl={setVideoUrl} values={values} />
      <Form.Item name="_id" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;
