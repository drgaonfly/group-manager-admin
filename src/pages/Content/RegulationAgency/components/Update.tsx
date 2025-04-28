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
    logoUrl?: string;
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;

  const [logoUrl, setlogoUrl] = useState<string | undefined>(values.logoUrl || '');

  const defaultFileList: UploadFile[] = values.logoUrl
    ? [
        {
          uid: '-1',
          name: 'logo.png',
          status: 'done' as const,
          url: values.logoUrl,
        },
      ]
    : [];

  useEffect(() => {
    setlogoUrl(values.logoUrl);
  }, [values]);

  const handleSubmit = async (formValues: any) => {
    await onSubmit({
      ...formValues,
      logoUrl: logoUrl,
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
        setlogoUrl={setlogoUrl}
        logoUrl={logoUrl}
        defaultFileList={defaultFileList}
      />
    </Modal>
  );
};

export default UpdateForm;
