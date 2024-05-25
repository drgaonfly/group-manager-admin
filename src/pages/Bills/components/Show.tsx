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
      title: <FormattedMessage id="operator" defaultMessage="Store Name" />,
      dataIndex: 'user',
      editable: () => true,
      render: (_, record: any) => {
        return record.user && record.user.name ? (
          record.user.name
        ) : (
          <FormattedMessage id="unknown" defaultMessage="Unknown" />
        );
      },
    },
    {
      title: <FormattedMessage id="operation" defaultMessage="Operation" />,
      dataIndex: 'operation',
      editable: () => false,
      render: (text: React.ReactNode) => (
        <FormattedMessage id={`operation.${text}`} defaultMessage={text as string} />
      ),
    },
    {
      title: <FormattedMessage id="operation_time" defaultMessage="Operation Time" />,
      dataIndex: 'operationTime',
      valueType: 'dateTime',
      editable: () => false,
    },
  ];
  return (
    <Drawer width="70%" open={open} onClose={onClose} closable={false}>
      {currentRow?.orderNumber && (
        <>
          <ProDescriptions<API.ItemData>
            column={2}
            title={currentRow?.orderNumber}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.orderNumber,
            }}
            columns={cols as ProDescriptionsItemProps<API.ItemData>[]}
          />

          <EditableProTable<DataSourceType>
            rowKey="_id"
            headerTitle={
              <FormattedMessage id="operation_record" defaultMessage="Operation Record" />
            }
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
              data: currentRow.operations,
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
