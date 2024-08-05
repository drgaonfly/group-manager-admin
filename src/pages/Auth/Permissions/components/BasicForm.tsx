import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: permissions } = useQueryList('/permissions');
  const { items: permissionGroups } = useQueryList('/permission-groups');

  return (
    <ProForm
      initialValues={{
        ...values,
        permissions: values?.permissions?.action,
        permissionGroups: values?.permissions?.parent?.name,
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

        <ProFormSelect
          name="action"
          width="md"
          label={intl.formatMessage({ id: 'enter_action' })}
          options={permissions?.map((permission: { action: string; _id: string }) => ({
            label: permission.action,
            value: permission._id,
          }))}
        />

        <ProFormSelect
          name="permission-groups"
          width="md"
          rules={[
            { required: true, message: intl.formatMessage({ id: 'enter_permission_group' }) },
          ]}
          label={intl.formatMessage({ id: 'permission_group' })}
          options={permissionGroups?.map((permissionGroup: { name: string; _id: string }) => ({
            label: permissionGroup.name,
            value: permissionGroup._id,
          }))}
        />
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
