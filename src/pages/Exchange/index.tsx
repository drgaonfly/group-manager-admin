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
import StatusEnum from '@/enums/exchangeStatus';

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/exchanges', {
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
      title: intl.formatMessage({ id: 'user' }),
      dataIndex: 'botUser',
      copyable: true,
      renderText: (botUser) =>
        botUser?.userName ||
        botUser?.displayName ||
        `${botUser.firstName} ${botUser.lastName}`.trim(),
    },
    {
      title: intl.formatMessage({ id: 'bot' }),
      dataIndex: 'bot',
      copyable: true,
      renderText: (text, record) => {
        return record.bot?.botName;
      },
    },
    {
      title: intl.formatMessage({ id: 'from_address' }),
      dataIndex: 'from_address',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'to_address' }),
      dataIndex: 'to_address',
      copyable: true,
    },
    // receive_address
    {
      title: intl.formatMessage({ id: 'receive_address' }),
      dataIndex: 'receive_address',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'from_amount' }),
      dataIndex: 'from_amount',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'to_amount' }),
      dataIndex: 'to_amount',
      hideInSearch: true,
    },
    // isTransferIntoOther
    {
      title: intl.formatMessage({ id: 'isTransferIntoOther' }),
      dataIndex: 'isTransferIntoOther',
      hideInSearch: true,
      renderText: (text, record) => {
        return record.isTransferIntoOther ? '是' : '否';
      },
    },
    {
      title: intl.formatMessage({ id: 'hash' }),
      dataIndex: 'hash',
      hideInSearch: true,
      ellipsis: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'txid' }),
      dataIndex: 'txid',
      hideInSearch: true,
      ellipsis: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'rate' }),
      dataIndex: 'rate',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'fee' }),
      dataIndex: 'fee',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'status',
      hideInSearch: true,
      valueEnum: StatusEnum,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    // expiredAt
    {
      title: intl.formatMessage({ id: 'expiredAt' }),
      dataIndex: 'expiredAt',
      valueType: 'dateTime',
      hideInSearch: true,
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
        access.canDeleteExchange && (
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
                label: <FormattedMessage id="completed" defaultMessage="completed" />,
                key: 'completed',
              },
              {
                label: <FormattedMessage id="failed" defaultMessage="failed" />,
                key: 'failed',
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
          queryList('/exchanges', { ...params, status: activeKey }, sort, filter)
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
          {access.canDeleteExchange && (
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
