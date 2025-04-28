import { useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import BasicForm from './BasicForm';
import { Modal } from 'antd';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    url?: string;
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;

  const [url, setVideoUrl] = useState<string | undefined>(values?.url || '');

  useEffect(() => {
    setVideoUrl(values?.url);
  }, [values]);

  const handleSubmit = async (formValues: any) => {
    // 判断formValues.avatar是否包含http或者是https，如果包含的化，就删除掉这个字段
    if (formValues.url?.includes('http') || formValues.url?.includes('https')) {
      delete formValues.url;
    }
    await onSubmit({
      ...formValues,
      url: url,
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
      <BasicForm values={values} onFinish={handleSubmit} setUrl={setVideoUrl} url={url} />
    </Modal>
  );
};

export default UpdateForm;
