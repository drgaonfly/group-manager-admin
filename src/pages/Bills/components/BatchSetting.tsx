import { useIntl } from '@umijs/max';
import React from 'react';
import { ModalForm, ProForm, ProFormSwitch } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  batchSettingModalOpen: boolean;
  values: any;
};

const BatchSetting: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { batchSettingModalOpen, onCancel, onSubmit, values } = props;
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'batch_setting' })}
      width="50%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={batchSettingModalOpen}
      onOpenChange={onCancel}
      onFinish={onSubmit}
      initialValues={{ ...values, ids: values.map((item: any) => item._id) }}
    >
      <ProForm.Group>
        <ProFormSwitch name="isSigned" label={intl.formatMessage({ id: 'is_signed' })} />
        <ProFormSwitch name="isReviewed" label={intl.formatMessage({ id: 'is_reviewed' })} />
      </ProForm.Group>
      <Form.Item name="ids" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default BatchSetting;
