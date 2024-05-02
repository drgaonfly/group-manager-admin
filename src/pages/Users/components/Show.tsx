import { convertToTextObject, locationMapping } from '@/utils/constants';
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

const columns: ProColumns<IPriceList>[] = [
  {
    title: '国家',
    dataIndex: 'country',
    key: 'country',
    formItemProps: {
      rules: [{ required: true, message: '国家是必填项' }],
    },
    editable: () => true,
    valueEnum: convertToTextObject(locationMapping),
  },
  // {
  //   title: '是否本币',
  //   dataIndex: 'isLocalCurrency',
  //   key: 'isLocalCurrency',
  //   valueType: 'select',
  //   valueEnum: {
  //     true: { text: '是', status: 'Success' },
  //     false: { text: '否', status: 'Error' },
  //   },
  //   formItemProps: {
  //     rules: [{ required: true, message: '是否本币是必填项' }],
  //   },
  //   editable: () => true,
  // },
  {
    title: '汇率',
    dataIndex: 'exchangeRate',
    key: 'exchangeRate',
    formItemProps: {
      rules: [{ required: true, message: '汇率是必填项' }],
    },
    editable: () => true,
  },
  {
    title: '服务费',
    dataIndex: 'serviceFee',
    key: 'serviceFee',
    formItemProps: {
      rules: [{ required: true, message: '服务费是必填项' }],
    },
    editable: () => true,
  },
];

export interface IPriceList {
  isLocalCurrency: boolean;
  exchangeRate: number;
  serviceFee: number;
  country: string;
  platform: string;
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns: cols } = props;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly IPriceList[]>([]);
  const [position] = useState<'top' | 'bottom' | 'hidden'>('hidden');
  return (
    <Drawer width="70%" open={open} onClose={onClose} closable={false}>
      {currentRow?.email && (
        <>
          <ProDescriptions<API.ItemData>
            column={2}
            title={currentRow?.email}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.email,
            }}
            columns={cols as ProDescriptionsItemProps<API.ItemData>[]}
          />

          <EditableProTable<IPriceList>
            rowKey="_id"
            headerTitle="价格表"
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
              data: currentRow.priceList,
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
