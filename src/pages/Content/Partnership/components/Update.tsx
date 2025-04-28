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

  const [imageUrl, setImageUrl] = useState<string | undefined>(values.logoUrl || '');

  const defaultFileList: UploadFile[] = values.logoUrl
    ? [
        {
          uid: '-1',
          name: 'logo.png',
          status: 'done' as const,
          url: values.logoUrl,
          type: 'image/png',
          thumbUrl: values.logoUrl,
        },
      ]
    : [];

  useEffect(() => {
    setImageUrl(values.logoUrl);
  }, [values]);

  const handleSubmit = async (formValues: any) => {
    // 判断formValues.avatar是否包含http或者是https，如果包含的化，就删除掉这个字段
    if (formValues.logoUrl?.includes('http') || formValues.logoUrl?.includes('https')) {
      delete formValues.logoUrl;
    }
    await onSubmit({
      ...formValues,
      logoUrl: imageUrl,
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
        defaultFileList={defaultFileList}
      />
    </Modal>
  );
};

export default UpdateForm;
