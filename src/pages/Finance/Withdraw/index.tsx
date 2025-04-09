import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Switch, Button } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import Reject from './components/withdraw';
// import { Card, Row, Col, Button, Statistic } from 'antd';
import { NetworkEnum } from '@/enums/networkEnum';
import StatusEnum from '@/enums/statusEnum';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
  try {
    await addItem('/withdraws', { ...fields });
    hide();
    message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="upload_failed" defaultMessage="Upload failed, please try again!" />
      ),
    );
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/withdraws/${fields._id}`, fields);
    hide();

    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="update_failed" defaultMessage="Update failed, please try again!" />
      ),
    );
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/withdraws', {
      ids,
    });
    hide();
    message.success(
      <FormattedMessage
        id="delete_successful"
        defaultMessage="Deleted successfully and will refresh soon"
      />,
    );
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

const WithdrawPage: React.FC = () => {
  const intl = useIntl();
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: ['customer', 'network'],
      valueEnum: NetworkEnum,
    },
    {
      title: intl.formatMessage({ id: 'address' }),
      dataIndex: ['customer', 'address'],
      copyable: true,
      hideInSearch: false,
    },
    {
      title: intl.formatMessage({ id: 'amount(USDT)' }),
      dataIndex: 'finalAmount',
      valueType: 'money',
      hideInSearch: true,
      render: (_, record) => {
        return `${record.finalAmount}`;
      },
    },
    {
      title: intl.formatMessage({ id: 'fee(USDT)' }),
      dataIndex: 'fee',
      hideInSearch: true,
      render: (_, record) => {
        return `${record.fee}`;
      },
    },
    {
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: StatusEnum(),
    },
    {
      title: intl.formatMessage({ id: 'reason' }),
      dataIndex: 'reason',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'isFrozen', defaultMessage: '是否确认' }),
      dataIndex: 'isFrozen',
      hideInSearch: false,
      valueEnum: {
        '': {
          text: intl.formatMessage({ id: 'all', defaultMessage: '所有' }),
          status: 'Error',
        },
        true: {
          text: intl.formatMessage({ id: 'platform.frozen', defaultMessage: '已确认' }),
          status: 'Success',
        },
        false: {
          text: intl.formatMessage({ id: 'platform.unfrozen', defaultMessage: '未确认' }),
          status: 'Error',
        },
      },
      render: (_, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'platform.frozen', defaultMessage: '已确认' })}
          unCheckedChildren={intl.formatMessage({
            id: 'platform.unfrozen',
            defaultMessage: '未确认',
          })}
          checked={record.isFrozen}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isFrozen: !record.isFrozen });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        access.canUpdateWithdraw && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        ),
        access.canUpdateWithdraw && (
          <Button
            key="reject"
            type="link"
            danger
            onClick={() => {
              setCurrentRow(record);
              setRejectModalOpen(true);
            }}
          >
            <FormattedMessage id="pages.reject" defaultMessage="拒绝提现" />
          </Button>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'pages.withdraw.withdrawList' })}
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        request={async (params, sort, filter) => queryList('/withdraws', params, sort, filter)}
        columns={columns}
        rowSelection={
          access.canSuperAdmin && {
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }
        }
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          {access.canDeleteWithdraw && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState?.map((item: any) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          )}
        </FooterToolbar>
      )}
      {access.canCreateWithdraw && (
        <Create
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          onFinish={async (value) => {
            const success = await handleAdd(value as API.ItemData);
            if (success) {
              handleModalOpen(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      )}
      {access.canUpdateWithdraw && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={handleUpdateModalOpen}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
        />
      )}
      {access.canUpdateWithdraw && (
        <Reject
          open={rejectModalOpen}
          onCancel={setRejectModalOpen}
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              setRejectModalOpen(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          values={{ _id: currentRow?._id || '' }}
        />
      )}
      <Show
        open={showDetail}
        currentRow={currentRow as API.ItemData}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default WithdrawPage;
