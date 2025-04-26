import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
// import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
// import DeleteLink from '@/components/DeleteLink';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading('Adding...');
  try {
    await addItem('/team-benefits', { ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Adding failed, please try again!');
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
  const hide = message.loading('Updating...');
  try {
    await updateItem(`/team-benefits/${fields._id}`, fields);
    hide();

    message.success('Updated successfully');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Update failed, please try again!');
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
  const hide = message.loading('Removing...');
  if (!ids) return true;
  try {
    await removeItem('/team-benefits', {
      ids,
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error: any) {
    console.error('Delete error:', error);
    hide();
    message.error(error.response.data.message ?? 'Delete failed, please try again');
    return false;
  }
};

const TableList: React.FC = () => {
  const intl = useIntl();
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**2024fc.xyz
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'id', defaultMessage: 'ID' }),
      dataIndex: ['parent', 'id'],
      hideInForm: false,
      hideInSearch: false,
    },
    {
      title: intl.formatMessage({ id: 'toAddress', defaultMessage: '地址' }),
      dataIndex: 'toAddress',
      hideInForm: false,
      hideInSearch: false,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'toNetwork', defaultMessage: '网络' }),
      dataIndex: 'toNetwork',
      hideInForm: false,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'fromAddress', defaultMessage: '邀请人地址' }),
      dataIndex: 'fromAddress',
      hideInForm: false,
      hideInSearch: false,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'fromNetwork', defaultMessage: '邀请人网络' }),
      dataIndex: 'fromNetwork',
      hideInForm: false,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'toDepth', defaultMessage: '深度' }),
      dataIndex: 'depth',
      hideInForm: false,
      hideInSearch: true,
      valueType: 'digit',
    },
    {
      title: intl.formatMessage({ id: 'incomeRate', defaultMessage: '收益率' }),
      dataIndex: 'incomeRate',
      hideInForm: false,
      hideInSearch: true,
      valueType: 'percent',
    },
    {
      title: intl.formatMessage({ id: 'ethIncome', defaultMessage: 'ETH收益' }),
      dataIndex: 'ethIncome',
      hideInForm: false,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'usdtIncome', defaultMessage: 'USDT收益' }),
      dataIndex: 'usdtIncome',
      hideInForm: false,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: ['createdAt'],
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
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
          <FormattedMessage id="detail" defaultMessage="detail" />
        </a>,
        access.canUpdateTeamBenefit && (
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
        access.canDeleteTeamBenefit && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
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
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
          collapsed: false, // 搜索区域是否默认折叠
        }}
        toolBarRender={() => [
          // access.canCreateTeamBenefit && (
          //   <Button
          //     type="primary"
          //     key="primary"
          //     onClick={() => {
          //       handleModalOpen(true);
          //     }}
          //   >
          //     <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          //   </Button>
          // ),
        ]}
        request={async (params, sort, filter) => queryList('/team-benefits', params, sort, filter)}
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
          {access.canDeleteTeamBenefit && (
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
      {access.canCreateTeamBenefit && (
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
      {access.canUpdateTeamBenefit && (
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

export default TableList;
