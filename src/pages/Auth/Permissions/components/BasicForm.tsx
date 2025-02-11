import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import PermissionGroupSelect from '@/components/PermissionGroupSelect';
import useQueryList from '@/hooks/useQueryList'; // Assuming this hook is available for loading

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const { loading: permissionGroupsLoading } = useQueryList('/permission-groups'); // Fetching permissions

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
      submitter={{
        render: (props, dom) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {dom.map((button, index) => (
                <span key={index} style={{ marginLeft: 8 }}>
                  {button}
                </span>
              ))}
            </div>
          );
        },
      }}
      loading={permissionGroupsLoading} // Added loading prop
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
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_action' }) }]}
          name="action"
          width="md"
          label={intl.formatMessage({ id: 'action' })}
          options={[
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'DELETE', value: 'DELETE' },
            { label: 'PUT', value: 'PUT' },
          ]}
        />

        <PermissionGroupSelect name="permissionGroup" label="permission_group" />
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
