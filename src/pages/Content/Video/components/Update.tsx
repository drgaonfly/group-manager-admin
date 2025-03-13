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
    videoUrl?: string;
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;

  const [videoUrl, setVideoUrl] = useState<string | undefined>(values?.videoUrl || '');

  useEffect(() => {
    setVideoUrl(values?.videoUrl);
  }, [values]);

  const handleSubmit = async (formValues: any) => {
    // 判断formValues.avatar是否包含http或者是https，如果包含的化，就删除掉这个字段
    if (formValues.videoUrl?.includes('http') || formValues.videoUrl?.includes('https')) {
      delete formValues.videoUrl;
    }
    await onSubmit({
      ...formValues,
      videoUrl: videoUrl,
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
      <BasicForm values={values} onFinish={handleSubmit} setUrl={setVideoUrl} url={videoUrl} />
    </Modal>
  );
};

export default UpdateForm;
