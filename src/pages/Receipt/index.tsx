import { useIntl } from '@umijs/max';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message } from 'antd';
import React, { useRef, useState } from 'react';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import moment from 'moment';

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/receipts', {
      ids,
    });
    hide();
    message.success(<FormattedMessage id="delete_successful" defaultMessage="Delete successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error.response.data.message ?? (
        <FormattedMessage id="delete_failed" defaultMessage="Delete failed, please try again" />
      ),
    );
    return false;
  }
};

const TableList: React.FC = () => {
  const intl = useIntl();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    // wallet
    {
      title: intl.formatMessage({ id: 'wallet' }),
      dataIndex: 'wallet',
      copyable: true,
      renderText: (wallet) => wallet?.address,
    },
    // crypto_type
    {
      title: intl.formatMessage({ id: 'crypto_type', defaultMessage: '金额类型' }),
      dataIndex: 'crypto_type',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'amount', defaultMessage: '金额' }),
      dataIndex: 'amount',
      hideInSearch: true,
    },
    // type
    {
      title: intl.formatMessage({ id: 'type' }),
      dataIndex: 'type',
      hideInSearch: true,
      renderText: (type) => (type === 'transferIn' ? '收入' : '支出'),
    },
    // from_address
    {
      title: intl.formatMessage({ id: 'from_address' }),
      dataIndex: 'from_address',
      hideInSearch: true,
    },
    // to_address
    {
      title: intl.formatMessage({ id: 'to_address' }),
      dataIndex: 'to_address',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'user' }),
      dataIndex: 'botUser',
      copyable: true,
      renderText: (botUser) => botUser?.userName || botUser?.displayName,
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      copyable: true,
      renderText: (bot) => bot?.botName,
    },
    {
      title: intl.formatMessage({ id: 'time' }),
      dataIndex: 'time',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => moment(record.time * 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: intl.formatMessage({ id: 'hash' }),
      dataIndex: 'hash',
      width: 150,
      hideInSearch: true,
      ellipsis: true,
      copyable: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="详情" />
        </a>,
        access.canDeleteReceipt && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
              actionRef.current?.reload();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        request={(params, sort, filter) => queryList('/receipts', { ...params }, sort, filter)}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" />
            </div>
          }
        >
          {access.canDeleteReceipt && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState.map((item) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          )}
        </FooterToolbar>
      )}

      <Show
        open={showDetail}
        currentRow={currentRow || ({} as API.ItemData)}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
