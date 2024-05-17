import { FormattedMessage, useIntl } from '@umijs/max';
import { ModalForm } from '@ant-design/pro-components';
import BasicForm from './BasicForm';
import { useState } from 'react';
import { message } from 'antd';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
  selectedRowsState: any;
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish } = props;
  const [videoUrl, setVideoUrl] = useState<string | undefined>('');
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'batch_setting' })}
      width="50%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values) => {
        if (!videoUrl) {
          message.error(
            <FormattedMessage id="upload_file_error" defaultMessage="Please upload a file" />,
          );
          return;
        }
        await onFinish({
          ...values,
          videoUrl,
        });
      }}
    >
      <BasicForm setVideoUrl={setVideoUrl} newRecord />
    </ModalForm>
  );
};

export default Create;
