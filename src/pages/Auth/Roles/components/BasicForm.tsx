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
  const { items: permissionGroups, loading } = useQueryList('/permission-groups/list');

  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [checkedKeys, setCheckedKeys] = useState<Key[] | { checked: Key[]; halfChecked: Key[] }>(
    values.permissions?.map((permission: Permission) => `${permission._id}`) ?? [],
  );
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

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

  return (
    <ProForm
      initialValues={{
        ...values,
        permissions: values?.permissions?.map((permission: Permission) => permission._id),
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          permissions: checkedKeys,
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
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />

        <ProForm.Item name="permissions" label={intl.formatMessage({ id: 'permission_choose' })}>
          <Spin spinning={loading}>
            <Tree
              checkable
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={permissionGroups} // Use filtered top-level groups
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
