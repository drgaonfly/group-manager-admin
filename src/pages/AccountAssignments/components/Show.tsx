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

const columns: ProColumns<DataSourceType>[] = [
  {
    title: <FormattedMessage id="account_number" defaultMessage="Account Number" />,
    dataIndex: 'accountNumber',
    key: 'accountNumber',
    formItemProps: {
      rules: [
        {
          required: true,
          message: (
            <FormattedMessage
              id="account_number_required"
              defaultMessage="Account number is required"
            />
          ),
        },
      ],
    },
    editable: () => true,
  },
  {
    title: <FormattedMessage id="login_account" defaultMessage="Login Account" />,
    dataIndex: 'loginAccount',
    key: 'loginAccount',
    formItemProps: {
      rules: [
        {
          required: true,
          message: (
            <FormattedMessage
              id="login_account_required"
              defaultMessage="Login account is required"
            />
          ),
        },
      ],
    },
    editable: () => true,
  },
  {
    title: <FormattedMessage id="login_password" defaultMessage="Login Password" />,
    dataIndex: 'loginPassword',
    key: 'loginPassword',
    formItemProps: {
      rules: [
        {
          required: true,
          message: (
            <FormattedMessage
              id="login_password_required"
              defaultMessage="Login password is required"
            />
          ),
        },
      ],
    },
    editable: () => true,
  },
  {
    title: <FormattedMessage id="is_assigned" defaultMessage="Is Assigned" />,
    dataIndex: 'isAssigned',
    key: 'isAssigned',
    valueType: 'select',
    valueEnum: {
      true: {
        text: <FormattedMessage id="assigned" defaultMessage="Assigned" />,
        status: 'Success',
      },
      false: {
        text: <FormattedMessage id="not_assigned" defaultMessage="Not Assigned" />,
        status: 'Error',
      },
    },
    formItemProps: () => ({
      rules: [
        {
          required: true,
          message: (
            <FormattedMessage
              id="assignment_status_required"
              defaultMessage="Assignment status is required"
            />
          ),
        },
      ],
    }),
    editable: () => false,
  },
  {
    title: <FormattedMessage id="last_assigned_time" defaultMessage="Last Assigned Time" />,
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
            hhheaderTitle={
              <FormattedMessage id="account_library_list" defaultMessage="Account Library List" />
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
              data: currentRow.accountLibraries,
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
