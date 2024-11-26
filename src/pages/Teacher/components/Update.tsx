import React, { useEffect, useState } from 'react';
import BasicForm from './BasicForm';
import { ModalForm } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import extractPathFromUrl from '@/utils/extractPathFromUrl';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    avatar?: {
      url?: string;
    };
  } & Partial<API.ItemData>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [imageUrl, setImageUrl] = useState<string | undefined>('');

  useEffect(() => {
    // 初始化图片URL
    setImageUrl(values.avatar?.url);
  }, [values]);

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'modify' })}
      width="70%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (formValues: any) => {
        // 处理表单提交
        await onSubmit({
          ...formValues,
          avatar: imageUrl
            ? {
                url: extractPathFromUrl(imageUrl),
                name: 'avatar',
                type: 'image',
              }
            : values.avatar,
        });
      }}
      initialValues={values}
    >
      <BasicForm
        values={values}
        setImageUrl={setImageUrl}
        imageUrl={imageUrl}
        onFinish={async (values) => {
          // 这个 onFinish 可能不会被调用，因为我们使用的是 ModalForm 的 onFinish
          console.log('BasicForm onFinish:', values);
        }}
      />
    </ModalForm>
  );
};

export default UpdateForm;
