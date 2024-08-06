import React from 'react';
import { ProFormTreeSelect } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Spin } from 'antd';
import useQueryList from '@/hooks/useQueryList';

const PermissionGroupSelect = ({ name }: { name: string }) => {
  const intl = useIntl();
  const { items: permissionGroups, loading } = useQueryList('/permission-groups/list');

  return (
    <Spin spinning={loading}>
      <ProFormTreeSelect
        name={name}
        rules={[{ required: false }]}
        width="md"
        label={intl.formatMessage({ id: 'parent_permissionGroup' })}
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
        }}
      />
    </Spin>
  );
};

export default PermissionGroupSelect;
