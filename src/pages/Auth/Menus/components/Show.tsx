import { convertToTextObject, locationMapping } from '@/utils/constants';
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

const columns: ProColumns<IPriceList>[] = [
  {
    title: <FormattedMessage id="country" defaultMessage="Country" />,
    dataIndex: 'country',
    key: 'country',
    formItemProps: {
      rules: [
        {
          required: true,
          message: <FormattedMessage id="country_required" defaultMessage="Country is required" />,
        },
      ],
    },
    editable: () => true,
    valueEnum: convertToTextObject(locationMapping),
  },
  {
    title: <FormattedMessage id="exchange_rate" defaultMessage="Exchange Rate" />,
    dataIndex: 'exchangeRate',
    key: 'exchangeRate',
    formItemProps: {
      rules: [
        {
          required: true,
          message: (
            <FormattedMessage
              id="exchange_rate_required"
              defaultMessage="Exchange rate is required"
            />
          ),
        },
      ],
    },
    editable: () => true,
  },
  {
    title: <FormattedMessage id="service_fee" defaultMessage="Service Fee" />,
    dataIndex: 'serviceFee',
    key: 'serviceFee',
    formItemProps: {
      rules: [
        {
          required: true,
          message: (
            <FormattedMessage id="service_fee_required" defaultMessage="Service fee is required" />
          ),
        },
      ],
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
            headerTitle={<FormattedMessage id="price_list" defaultMessage="Price List" />}
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
