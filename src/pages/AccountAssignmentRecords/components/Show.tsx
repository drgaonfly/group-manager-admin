import {
  EditableProTable,
  ProColumns,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React, { useState } from 'react';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const columns: ProColumns<DataSourceType>[] = [
  {
    title: '下单账号序号',
    dataIndex: 'accountNumber',
    key: 'accountNumber',
    formItemProps: {
      rules: [{ required: true, message: '下单账号序号是必填项' }],
    },
    editable: () => true,
  },
  {
    title: '登录账号',
    dataIndex: 'loginAccount',
    key: 'loginAccount',
    formItemProps: {
      rules: [{ required: true, message: '登录账号是必填项' }],
    },
    editable: () => true,
  },
  {
    title: '登录密码',
    dataIndex: 'loginPassword',
    key: 'loginPassword',
    formItemProps: {
      rules: [{ required: true, message: '登录密码是必填项' }],
    },
    editable: () => true,
  },
  {
    title: '是否分配',
    dataIndex: 'isAssigned',
    key: 'isAssigned',
    valueType: 'select',
    valueEnum: {
      true: { text: '已分配', status: 'Success' },
      false: { text: '未分配', status: 'Error' },
    },
    formItemProps: () => ({
      rules: [{ required: true, message: '分配状态必须指定' }],
    }),
    editable: () => false,
  },
  {
    title: '最近分配时间',
    dataIndex: 'assignedTime',
    key: 'assignedTime',
    editable: () => false,
  },
];

interface DataSourceType {
  accountNumber: string;
  loginAccount: string;
  loginPassword: string;
  isAssigned: boolean;
  assignedTime: string;
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns: cols } = props;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>([]);
  const [position] = useState<'top' | 'bottom' | 'hidden'>('hidden');

  return (
    <Drawer width="70%" open={open} onClose={onClose} closable={false}>
      {currentRow?._id && (
        <>
          <ProDescriptions<API.ItemData>
            column={2}
            title={currentRow?._id}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?._id,
            }}
            columns={cols as ProDescriptionsItemProps<API.ItemData>[]}
          />
          <EditableProTable<DataSourceType>
            rowKey="_id"
            headerTitle="账号库列表"
            maxLength={5}
            scroll={{
              x: 960,
            }}
            // @ts-ignore
            recordCreatorProps={
              position !== 'hidden'
                ? {
                    position: position as 'top',
                    record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
                  }
                : false
            }
            loading={false}
            columns={columns}
            request={async () => ({
              data: currentRow.accountLibraries,
              total: 3,
              success: true,
            })}
            value={dataSource}
            onChange={setDataSource}
            editable={{
              type: 'multiple',
              editableKeys,
              onSave: async (rowKey, data, row) => {
                console.log(rowKey, data, row);
              },
              onChange: setEditableRowKeys,
            }}
          />
        </>
      )}
    </Drawer>
  );
};

export default Show;
