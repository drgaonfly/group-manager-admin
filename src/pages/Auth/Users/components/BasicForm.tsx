import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-components';
import { Form, Input, Spin } from 'antd';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles, loading } = useQueryList('/roles');

  return (
    <Spin spinning={loading}>
      <ProForm
        initialValues={{
          ...values,
          roles: values?.roles?.map((role: { _id: string }) => role._id),
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
            rules={[{ required: true, message: intl.formatMessage({ id: 'enter_email' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'email' })}
            name="email"
          />
          <ProFormText
            rules={[{ required: newRecord, message: intl.formatMessage({ id: 'enter_password' }) }]}
            width="md"
            label={intl.formatMessage({ id: 'password' })}
            name="password"
          />

          <ProFormCheckbox.Group
            name="roles"
            layout="horizontal"
            label={intl.formatMessage({ id: 'role_choose' })}
            options={roles?.map((role: { name: string; _id: string }) => ({
              label: role.name,
              value: role._id,
            }))}
          />
        </ProForm.Group>

        {!newRecord && (
          <Form.Item name="_id" label={false}>
            <Input type="hidden" />
          </Form.Item>
        )}
      </ProForm>
    </Spin>
  );
};

export default BasicForm;
