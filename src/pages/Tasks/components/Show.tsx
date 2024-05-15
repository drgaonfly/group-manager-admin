import {
  EditableProTable,
  ProColumns,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
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
  storeName: string;
  orderNumber: string;
  amount: number;
  buyerId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns: cols } = props;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>([]);
  const [position] = useState<'top' | 'bottom' | 'hidden'>('hidden');

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: <FormattedMessage id="store_name" defaultMessage="Store Name" />,
      dataIndex: 'storeName',
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage
                  id="store_name_required"
                  defaultMessage="Store Name is required"
                />
              ),
            },
          ],
        };
      },
      editable: () => true,
    },
    {
      title: <FormattedMessage id="order_number" defaultMessage="Order Number" />,
      dataIndex: 'orderNumber',
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage
                  id="order_number_required"
                  defaultMessage="Order Number is required"
                />
              ),
            },
          ],
        };
      },
      editable: () => true,
    },
    {
      title: <FormattedMessage id="amount" defaultMessage="Amount" />,
      dataIndex: 'amount',
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage id="amount_required" defaultMessage="Amount is required" />
              ),
            },
          ],
        };
      },
      editable: () => true,
    },
    {
      title: <FormattedMessage id="exchange_rate" defaultMessage="Exchange Rate" />,
      dataIndex: 'exchangeRate',
    },
    {
      title: <FormattedMessage id="service_fee" defaultMessage="Service Fee" />,
      dataIndex: 'serviceFee',
    },
    {
      title: <FormattedMessage id="payment_amount" defaultMessage="Payment Amount" />,
      dataIndex: 'paymentAmount',
    },
    {
      title: <FormattedMessage id="buyer_id" defaultMessage="Buyer ID" />,
      dataIndex: 'buyerId',
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage id="buyer_id_required" defaultMessage="Buyer ID is required" />
              ),
            },
          ],
        };
      },
      editable: () => true,
    },
    {
      title: <FormattedMessage id="task_id" defaultMessage="Task ID" />,
      dataIndex: 'task',
      hidden: true,
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage id="task_id_required" defaultMessage="Task ID is required" />
              ),
            },
          ],
        };
      },
      editable: () => true,
      render: (text) => text?.toString(),
    },
    {
      title: <FormattedMessage id="created_at" defaultMessage="Created At" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      editable: () => false,
    },
    // {
    //   title: '操作',
    //   valueType: 'option',
    //   render: (text, record, _, action) => [
    //     <a
    //       key="editable"
    //       onClick={() => {
    //         action?.startEditable?.(record._id);
    //       }}
    //     >
    //       编辑
    //     </a>,
    //     // Add your logic for deleting a bill here
    //     // You'll need to adapt this to fit your actual data handling
    //   ],
    // },
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
            headerTitle={<FormattedMessage id="bill" defaultMessage="Bill" />}
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
