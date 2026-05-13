import { useIntl } from '@umijs/max';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/recharges', {
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
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      width: 150,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'agent' }),
      dataIndex: 'proxy',
      width: 150,
      copyable: true,
      hideInSearch: true,
      hideInTable: !access.canSuperAdmin,
      renderText: (_, record) => {
        return record?.proxy?.name;
      },
    },
    {
      title: intl.formatMessage({ id: 'user' }),
      dataIndex: 'botUser',
      copyable: true,
      width: 150,
      renderText: (botUser) => botUser?.userName || botUser?.displayName,
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: 'Bot' }),
      dataIndex: 'bot',
      copyable: true,
      renderText: (bot) => bot?.botName,
    },
    {
      title: intl.formatMessage({ id: 'amount', defaultMessage: 'Amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      width: 80,
      renderText: (amount) => (amount ? `$ ${amount}` : '-'),
    },
    {
      title: intl.formatMessage({
        id: 'usdt_balance_before',
        defaultMessage: 'usdt_balance Before Recharge',
      }),
      dataIndex: 'usdt_balance_before',
      hideInSearch: true,
      width: 120,
      renderText: (usdt_balance_before) =>
        usdt_balance_before !== undefined && usdt_balance_before !== null
          ? `$ ${usdt_balance_before}`
          : '-',
    },
    {
      title: intl.formatMessage({
        id: 'usdt_balance_after',
        defaultMessage: 'usdt_balance After Recharge',
      }),
      dataIndex: 'usdt_balance_after',
      hideInSearch: true,
      width: 120,
      renderText: (usdt_balance_after) =>
        usdt_balance_after !== undefined && usdt_balance_after !== null
          ? `$ ${usdt_balance_after}`
          : '-',
    },
    {
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'status',
      hideInSearch: true,
      width: 100,
      render: (_, record) => {
        return <Tag color="blue">{intl.formatMessage({ id: `${record.status || ''}` })}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'fromAddress', defaultMessage: '发送地址' }),
      dataIndex: 'from',
      ellipsis: true,
      hideInSearch: true,
      copyable: true,
      width: 250,
      render: (_, record) =>
        record?.from ? (
          <a
            href={`https://tronscan.org/#/address/${record.from}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.from}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: intl.formatMessage({ id: 'toAddress', defaultMessage: '接收地址' }),
      dataIndex: 'to',
      ellipsis: true,
      hideInSearch: true,
      copyable: true,
      width: 250,
      render: (_, record) =>
        record?.to ? (
          <a
            href={`https://tronscan.org/#/address/${record.to}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.to}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: intl.formatMessage({ id: 'txHash' }),
      dataIndex: 'txHash',
      hideInSearch: true,
      ellipsis: true,
      copyable: true,
      width: 250,
      render: (_, record) =>
        record?.txHash ? (
          <a
            href={`https://tronscan.org/#/transaction/${record.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.txHash}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'transactionAt' }),
      dataIndex: 'transactionAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'expiredAt' }),
      dataIndex: 'expiredAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 150,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        <a
          key="detail"
          style={{ color: '#1890ff' }}
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <EyeOutlined /> <FormattedMessage id="detail" defaultMessage="Detail" />
        </a>,
        access.canDeleteRecharge && (
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
        headerTitle={intl.formatMessage({ id: 'recharge_list', defaultMessage: 'Recharge List' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        size="small"
        search={{
          collapsed: false,
          labelWidth: 180,
        }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                label: <FormattedMessage id="platform.all" defaultMessage="all" />,
                key: '',
              },
              {
                label: <FormattedMessage id="pending" defaultMessage="pending" />,
                key: 'pending',
              },
              {
                label: <FormattedMessage id="paid" defaultMessage="paid" />,
                key: 'paid',
              },
              {
                label: <FormattedMessage id="expired" defaultMessage="expired" />,
                key: 'expired',
              },
              {
                label: <FormattedMessage id="canceled" defaultMessage="cancelled" />,
                key: 'cancelled',
              },
            ],
            onChange: (key: any) => {
              setActiveKey(key);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            },
          },
        }}
        request={(params, sort, filter) =>
          queryList('/recharges', { ...params, status: activeKey }, sort, filter)
        }
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
          {access.canDeleteRecharge && (
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
