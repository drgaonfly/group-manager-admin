import React from 'react';
import { ProFormTreeSelect } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const PermissionGroupSelect = ({ name, label }: { name: string; label: string }) => {
  const intl = useIntl();
  const { items: permissionGroups, loading } = useQueryList('/permission-groups');

  return (
    <ProFormTreeSelect
      name={name}
      rules={[{ required: false }]}
      width="md"
      label={intl.formatMessage({ id: label })}
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
        loading,
      }}
    />
  );
};

export default PermissionGroupSelect;
