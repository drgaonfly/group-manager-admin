import { useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import BasicForm from './BasicForm';
import { Modal } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    packageImageUrl?: string;
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;

  console.log('Initial values:', values);

  const [packageImageUrl, setImageUrl] = useState<string | undefined>(values.packageImageUrl || '');

  const defaultFileList = values.packageImageUrl
    ? [
        {
          uid: '1',
          name: 'packageImage',
          status: 'done' as UploadFile['status'],
          url: values.packageImageUrl,
        },
      ]
    : [];

  useEffect(() => {
    console.log('Values changed:', values);
    setImageUrl(values.packageImageUrl);
  }, [values]);

  const handleSubmit = async (formValues: any) => {
    console.log('Submitting form with values:', formValues);
    console.log('Current imageUrl:', packageImageUrl);
    console.log(values);
    await onSubmit({
      ...formValues,
      packageImageUrl: packageImageUrl,
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
        packgeImageUrl={packageImageUrl}
        defaultFileList={defaultFileList}
      />
    </Modal>
  );
};

export default UpdateForm;
