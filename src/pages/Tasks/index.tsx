import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import Recharge from './components/Recharge';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading('正在添加');
  try {
    await addItem('/tasks', { ...fields });
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
  const hide = message.loading('正在更新');
  try {
    await updateItem(`/tasks/${fields._id}`, fields);
    hide();

    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '更新失败，请重试!');
    return false;
  }
};

const handleRecharge = async (fields: FormValueType) => {
  const hide = message.loading('正在充值');
  try {
    await addItem(`/tasks/${fields._id}/recharge`, fields);
    hide();

    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '更新充值，请重试!');
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
  const hide = message.loading('正在删除');
  if (!ids) return true;
  try {
    await removeItem('/tasks', {
      ids,
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    message.error(error.response.data.message ?? 'Delete failed, please try again');
    return false;
  }
};

const TableList: React.FC = () => {
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

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const access = useAccess();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: '国家',
      dataIndex: 'country',
      valueEnum: {
        Vietnam: { text: '越南' },
        Thailand: { text: '泰国' },
        Malaysia: { text: '马来西亚' },
        Philippines: { text: '菲律宾' },
        Indonesia: { text: '印尼' },
      },
    },
    // {
    //   title: '平台',
    //   dataIndex: 'platform',
    //   valueEnum: {
    //     TikTok: { text: 'TikTok' },
    //     Shopify: { text: 'Shopify' },
    //   },
    // },
    {
      title: '源文件',
      dataIndex: 'file',
      hideInSearch: true,
      render: (_, record) => {
        // 确保文件URL存在
        if (!record.file) return '无文件';

        // 返回一个下载按钮或链接
        return (
          <a href={record.file} download target="_blank" rel="noopener noreferrer">
            下载
          </a>
        );
      },
    },
    {
      title: '上传用户',
      dataIndex: 'user',
      hideInSearch: true,
      render: (_, record) => {
        // Assuming the user field is populated and includes an email field
        // Check if the user object exists and has an email property
        return record.user && record.user.email ? record.user.email : '未知';
      },
    },
    {
      title: '下单时间类型',
      dataIndex: 'orderTimeType',
      valueEnum: {
        NormalOrder: { text: '正常下单' },
        SpecificTimeOrder: { text: '指定时间下单' },
      },
    },
    {
      title: '下单时间类型',
      dataIndex: 'orderTime',
      valueType: 'dateTime',
    },
    {
      title: '评价类型',
      dataIndex: 'reviewType',
      valueEnum: {
        NormalReview: { text: '正常评价' },
        ReviewAfterModification: { text: '评价后补' },
      },
    },
    {
      title: '评论后补文件',
      dataIndex: 'uploadedFile',
      hideInSearch: true,
      render: (_, record: any) => {
        // 确保文件URL存在
        if (!record.uploadedFile) return '无文件';

        // 返回一个下载按钮或链接
        return (
          <a href={record.uploadedFile} download target="_blank" rel="noopener noreferrer">
            下载
          </a>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            // Replace `handleUpdateModalOpen` and `setCurrentRow` with your actual functions
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>,
        access.canSuperAdmin && (
          <a
            key="delete"
            onClick={() => {
              // Replace `handleRemove`, `setSelectedRows`, and `actionRef.current?.reloadAndRest?` as well
              return Modal.confirm({
                title: '确认删除?',
                onOk: async () => {
                  await handleRemove([record._id!]);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: '确定删除吗？',
                okText: '确认',
                cancelText: '取消',
              });
            }}
          >
            删除
          </a>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle="列表"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          access.canCustomer && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
              }}
            >
              <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
            </Button>
          ),
        ]}
        request={async (params, sort, filter) => queryList('/tasks', params, sort, filter)}
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
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          {access.canSuperAdmin && (
            <Button
              danger
              onClick={() => {
                return Modal.confirm({
                  title: '确认删除?',
                  onOk: async () => {
                    await handleRemove(selectedRowsState?.map((item) => item._id!));
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                  },
                  content: '确定删除吗？',
                  okText: '确认',
                  cancelText: '取消',
                });
              }}
            >
              <FormattedMessage
                id="pages.searchTable.batchDeletion"
                defaultMessage="Batch deletion"
              />
            </Button>
          )}
        </FooterToolbar>
      )}
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

      <Recharge
        onSubmit={async (value) => {
          const success = await handleRecharge(value);
          if (success) {
            setRechargeModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={setRechargeModalVisible}
        updateModalOpen={rechargeModalVisible}
        values={currentRow || {}}
      />

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
