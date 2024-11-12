import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  setImageUrl: (url: string) => void;
  imageUrl?: string | undefined;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const { items: menus, loading: menusLoading } = useQueryList('/menus');
  const { items: permissionGroups, loading } = useQueryList('/permission-groups/list');

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

        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_icon' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'icon' })}
          name="icon"
        />

        <ProFormTreeSelect
          name="permission"
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'permission_choose' })}
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
            treeData: permissionGroups,
            loading: loading,
          }}
        />

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
