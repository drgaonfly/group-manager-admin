import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import PermissionGroupSelect from '@/components/PermissionGroupSelect';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  return (
    <ProForm
      initialValues={{
        ...values,
        permissionGroup: values?.permissionGroup?._id,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
        });
      }}
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_path' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'path' })}
          name="path"
        />

        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_action' }) }]}
          name="action"
          width="md"
          label={intl.formatMessage({ id: 'action' })}
        />

        <PermissionGroupSelect name="permissionGroup" />
      </ProForm.Group>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
