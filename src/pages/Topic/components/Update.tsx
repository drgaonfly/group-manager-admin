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
    video?: string;
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
    <Modal
      maskClosable={false}
      width="50%"
      destroyOnClose
      title={intl.formatMessage({ id: 'modify' })}
      open={updateModalOpen}
      footer={false}
      onCancel={() => onCancel(false)}
    >
      <BasicForm
        values={values}
        onFinish={onSubmit}
        setVideoUrl={setVideoUrl}
        videoUrl={videoUrl}
      />
    </Modal>
  );
};

export default UpdateForm;
