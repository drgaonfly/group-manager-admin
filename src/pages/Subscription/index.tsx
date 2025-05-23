import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import Update from './components/Update';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import SubscriptionPlan from '@/enums/subscriptionPlan';

const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/subscriptions/${fields._id}`, fields);
    hide();
    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to update subscription');
    return false;
  }
};

const handleRemove = async (ids: any) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  try {
    await removeItem('/subscriptions', { ids });
    hide();
    message.success(
      <FormattedMessage id="delete_successful" defaultMessage="Deleted successfully" />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to delete subscription');
    return false;
  }
};

const SubscriptionTableList: React.FC = () => {
  const intl = useIntl();
  const [updateModalOpen, handleUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'id', defaultMessage: 'ID' }),
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'user', defaultMessage: 'Bot User' }),
      dataIndex: 'botUser',
      render: (_, record) => {
        return record.botUser.firstName + ' ' + record.botUser.lastName;
      },
    },
    {
      title: intl.formatMessage({ id: 'plan', defaultMessage: 'Plan' }),
      dataIndex: 'plan',
      hideInSearch: true,
      valueEnum: SubscriptionPlan,
    },
    {
      title: intl.formatMessage({ id: 'status', defaultMessage: 'Status' }),
      dataIndex: 'status',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'isAuto', defaultMessage: 'Auto Renewal' }),
      dataIndex: 'isAuto',
      hideInSearch: true,
      render: (isAuto) => (
        <Tag color={isAuto ? 'green' : 'default'}>
          {intl.formatMessage({
            id: isAuto ? 'subscription_autoRenewal' : 'subscription_manualRenewal',
            defaultMessage: isAuto ? 'Auto Renewal' : 'Manual Renewal',
          })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'isTrial', defaultMessage: 'Trial' }),
      dataIndex: 'isTrial',
      hideInSearch: true,
      render: (isTrial) => (
        <Tag color={isTrial ? 'blue' : 'default'}>
          {intl.formatMessage({
            id: isTrial ? 'subscription_trial' : 'subscription_regular',
            defaultMessage: isTrial ? 'Trial' : 'Regular',
          })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: 'CreatedAt' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: intl.formatMessage({ id: 'expiredAt', defaultMessage: 'ExpiredAt' }),
      dataIndex: 'expiredAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Actions" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="Detail" />
        </a>,
        access.canUpdateSubscription && (
          <a
            key="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </a>
        ),
        access.canDeleteSubscription && (
          <DeleteLink
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'subscription_list',
          defaultMessage: 'Subscription List',
        })}
        actionRef={actionRef}
        rowKey="_id"
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
                label: <FormattedMessage id="active" defaultMessage="active" />,
                key: 'active',
              },
              {
                label: <FormattedMessage id="expired" defaultMessage="expired" />,
                key: 'expired',
              },
              {
                label: <FormattedMessage id="canceled" defaultMessage="canceled" />,
                key: 'canceled',
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
          queryList('/subscriptions', { ...params, status: activeKey }, sort, filter)
        }
        columns={columns}
        rowSelection={
          access.canUpdateSubscription && {
            onChange: (_, selectedRows) => setSelectedRows(selectedRows),
          }
        }
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="items" />
            </div>
          }
        >
          <DeleteButton
            onOk={async () => {
              await handleRemove(selectedRowsState.map((item) => item._id!));
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </FooterToolbar>
      )}
      {access.canUpdateSubscription && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            }
          }}
          onCancel={handleUpdateModalOpen}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
        />
      )}
      <Show
        open={showDetail}
        currentRow={currentRow}
        columns={columns as ProDescriptionsItemProps<any>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default SubscriptionTableList;
