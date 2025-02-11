import { useIntl } from '@umijs/max';
import React, { Key, useState } from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input, Spin, Tree } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import { FormInstance } from 'antd/es/form';
import { Permission } from '@/apiDataStructures/ApiDataStructure';

interface Props {
  form?: FormInstance<any>;
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const { items: permissionGroups, loading: permissionGroupsLoading } =
    useQueryList('/permission-groups/list');
  const { items: dataPermissionGroups, loading: dataPermissionLoading } =
    useQueryList('/data-permissions');

  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [checkedKeys, setCheckedKeys] = useState<Key[] | { checked: Key[]; halfChecked: Key[] }>(
    values.permissions?.map((permission: Permission) => `${permission._id}`) ?? [],
  );
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const [dataCheckedKeys, setDataCheckedKeys] = useState<
    Key[] | { checked: Key[]; halfChecked: Key[] }
  >(values.dataPermissions?.map((permission: any) => `${permission._id}`) ?? []);

  const onExpand = (expandedKeysValue: Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    setCheckedKeys(checkedKeysValue);
    console.log('checkedKeysValue', checkedKeysValue);
  };

  const onSelect = (selectedKeysValue: Key[]) => {
    setSelectedKeys(selectedKeysValue);
  };

  const onDataPermissionCheck = (
    checkedKeysValue: Key[] | { checked: Key[]; halfChecked: Key[] },
  ) => {
    setDataCheckedKeys(checkedKeysValue);
  };

  return (
    <ProForm
      initialValues={{
        ...values,
        permissions: values?.permissions?.map((permission: Permission) => permission._id),
        dataPermissions: values?.dataPermissions?.map((dp: any) => dp._id),
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          permissions: checkedKeys,
          dataPermissions: dataCheckedKeys,
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
      loading={dataPermissionLoading && permissionGroupsLoading}
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
          disabled={!newRecord}
        />

        <ProForm.Item name="permissions" label={intl.formatMessage({ id: 'permission_choose' })}>
          <Spin spinning={permissionGroupsLoading}>
            <Tree
              checkable
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={permissionGroups}
              fieldNames={{ title: 'name', key: '_id', children: 'children' }}
            />
          </Spin>
        </ProForm.Item>

        <ProForm.Item
          name="dataPermissions"
          label={intl.formatMessage({ id: 'data_permission_choose', defaultMessage: '数据权限' })}
        >
          <Spin spinning={dataPermissionLoading}>
            <Tree
              checkable
              onCheck={onDataPermissionCheck}
              checkedKeys={dataCheckedKeys}
              treeData={dataPermissionGroups}
              fieldNames={{ title: 'name', key: '_id', children: 'children' }}
            />
          </Spin>
        </ProForm.Item>
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
