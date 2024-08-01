import { useIntl } from '@umijs/max';
import { ModalForm } from '@ant-design/pro-components';
import BasicForm from './BasicForm';
import { useState } from 'react';
import { message } from 'antd';
import extractPathFromUrl from '@/utils/extractPathFromUrl';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { open, onOpenChange, onFinish } = props;
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'pages.searchTable.new' })}
      width="50%"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values) => {
        // 确保在提交前已经上传了图片和资源
        if (!imageUrl) {
          message.error(intl.formatMessage({ id: 'message.error.imageUpload' }));
          return;
        }
        // 将图片和资源URL添加到表单数据中
        await onFinish({
          ...values,
          image: extractPathFromUrl(imageUrl),
        });
      }}
    >
      <BasicForm setImageUrl={setImageUrl} newRecord />
    </ModalForm>
  );
};

export default Create;
