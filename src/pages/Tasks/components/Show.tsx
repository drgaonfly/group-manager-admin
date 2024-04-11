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

type DataSourceType = {
  _id: string;
  storeName: string; // 店铺名字
  orderNumber: string; // 订单号
  amount: number; // 金额
  buyerId: string; // 买手号
  createdAt?: Date; // Time of document creation
  updatedAt?: Date; // Time the document was last updated
};

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns: cols } = props;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>([]);
  const [position] = useState<'top' | 'bottom' | 'hidden'>('hidden');

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: '店铺名字',
      dataIndex: 'storeName',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '店铺名字是必填项' }],
        };
      },
      editable: () => true,
    },
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '订单号是必填项' }],
        };
      },
      editable: () => true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '金额是必填项' }],
        };
      },
      editable: () => true,
    },
    {
      title: '买手号',
      dataIndex: 'buyerId',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '买手号是必填项' }],
        };
      },
      editable: () => true,
    },
    {
      title: '任务ID',
      dataIndex: 'task',
      hidden: true,
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '任务ID是必填项' }],
        };
      },
      editable: () => true,
      render: (text) => text?.toString(),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      editable: () => false,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          编辑
        </a>,
        // Add your logic for deleting a bill here
        // You'll need to adapt this to fit your actual data handling
      ],
    },
  ];

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
            headerTitle="账单"
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
              data: currentRow.bills,
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
