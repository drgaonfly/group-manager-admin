import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { Form, Input, Spin } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import { Permission } from '@/apiDataStructures/ApiDataStructure';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const { items: menus, loading: menusLoading } = useQueryList('/menus');
  const { items: permissions, loading } = useQueryList('/permissions');
  console.log('parent', values);

  return (
    <ProForm
      initialValues={{
        ...values,
        permission: values?.permission?._id,
        parent: values?.parent?._id,
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

        <Spin spinning={loading}>
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
        </Spin>

        <ProFormTreeSelect
          name="parent"
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'parent' })}
          allowClear
          secondary
          fieldProps={{
            showArrow: false,
            treeDefaultExpandAll: true,
            filterTreeNode: true,
            showSearch: true,
            dropdownMatchSelectWidth: false,
            autoClearSearchValue: true,
            treeNodeFilterProp: 'name',
            fieldNames: {
              label: 'name',
              value: '_id',
              children: 'children',
            },
            treeData: menus,
            loading: menusLoading,
          }}
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
