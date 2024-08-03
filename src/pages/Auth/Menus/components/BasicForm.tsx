import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

interface Menu {
  _id: string;
  name: string;
  path: string;
  parent: Menu;
  permission: Permission;
}

interface PermissionGroup {
  name: string;
  parent: PermissionGroup;
}

interface Permission {
  _id: string;
  name: string;
  path: string;
  action: string;
  permissionGroup: PermissionGroup;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish }) => {
  const intl = useIntl();
  const { items: menus } = useQueryList('/menus');
  const { items: permissions } = useQueryList('/permissions');

  return (
    <ProForm
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
          rules={[{ required: true, message: intl.formatMessage({ id: 'select_permission' }) }]}
          label={intl.formatMessage({ id: 'permission_choose' })}
          width="md"
          name="permission"
          placeholder={intl.formatMessage({ id: 'please_select_permission' })}
          options={permissions.map((permission: Permission) => ({
            label: permission.name,
            value: permission._id, // Store the ID for easy retrieval
          }))}
        />

        <ProFormSelect
          label={intl.formatMessage({ id: 'parent_choose' })}
          name="parentId"
          width="md"
          placeholder={intl.formatMessage({ id: 'please_select_parent' })}
          options={menus.map((menu: Menu) => ({
            label: menu.name,
            value: menu._id,
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
