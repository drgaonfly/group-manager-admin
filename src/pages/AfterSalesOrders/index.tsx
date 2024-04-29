import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
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
import ReviewForm from './components/ReviewForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading('正在添加');
  try {
    await addItem('/after-sales-orders', { ...fields });
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
    await updateItem(`/after-sales-orders/${fields._id}`, fields);
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
    await addItem(`/after-sales-orders/${fields._id}/recharge`, fields);
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
    await removeItem('/after-sales-orders', {
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

const handleReview = async (fields: API.ItemData) => {
  const hide = message.loading('正在审核');
  try {
    await updateItem(`/after-sales-orders/${fields._id}/review`, { ...fields });
    hide();
    message.success('审核成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '审核失败，请重试！');
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
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: '关联账单',
      copyable: true,
      width: 250,
      renderText: (_, record: any) => (record.bill ? record.bill._id : '无'), // Assuming task has a 'title' field
      dataIndex: 'bill',
    },
    {
      title: '申请人',
      dataIndex: 'user',
      width: 200,
      hideInSearch: true,
      render: (_, record: any) => {
        // Assuming the user field is populated and includes an email field
        // Check if the user object exists and has an email property
        return record.user && record.user.email ? record.user.email : '未知';
      },
    },
    {
      title: '原因',
      ellipsis: true,
      dataIndex: 'reason',
      hideInSearch: true,
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      hideInSearch: true,
    },
    {
      title: '图片',
      dataIndex: 'image',
      hideInSearch: true,
      valueType: 'image',
    },
    {
      title: '拒绝原因',
      ellipsis: true,
      dataIndex: 'rejectionReason',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      valueEnum: {
        Pending: { text: '待处理', status: 'Warning' },
        Processing: { text: '处理中', status: 'Processing' },
        Approved: { text: '已批准', status: 'Success' },
        Rejected: { text: '已拒绝', status: 'Error' }, // 新增的状态
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 200,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        // <a
        //   key="update"
        //   onClick={() => {
        //     handleUpdateModalOpen(true);
        //     setCurrentRow(record);
        //   }}
        // >
        //   编辑
        // </a>,
        record.status === 'Pending' && (
          <a
            key="afterSale"
            onClick={async () => {
              await handleUpdate({ ...record, status: 'Processing' });
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }}
          >
            处理
          </a>
        ),
        record.status === 'Processing' && (
          <a
            key="review"
            onClick={() => {
              setReviewModalVisible(true);
              setCurrentRow(record);
            }}
          >
            审核
          </a>
        ),
        access.canSuperAdmin && (
          <a
            key="delete"
            onClick={() => {
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
          collapsed: false,
          optionRender: (searchConfig, props, dom) => [
            <Button
              key="export"
              type="dashed"
              onClick={async () => {
                // Show a loading message
                const hide = message.loading('正在导出中...', 0);

                try {
                  // Perform the export operation
                  console.log('Export button clicked', props.form?.getFieldsValue());
                  const response = await queryList('/after-sales-orders/export', {
                    ...props.form?.getFieldsValue(),
                  });

                  hide();

                  if (response?.data) {
                    message.success('文件准备完成，下载即将开始');
                    // Open the download URL in a new tab
                    // @ts-ignore
                    window.open(response.data.signedURL, '_blank');
                  } else {
                    throw new Error('No download URL returned');
                  }
                } catch (error) {
                  // Update the message
                  hide();
                  message.error('导出失败');
                }
              }}
            >
              导出
            </Button>,
            ...dom,
          ],
        }}
        toolBarRender={() => [
          // <Button
          //   type="primary"
          //   key="primary"
          //   onClick={() => {
          //     handleModalOpen(true);
          //   }}
          // >
          //   <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          // </Button>,
        ]}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                label: <span>所有</span>,
                key: '', // 不设置key或设置为空字符串，表示不过滤此项
              },
              {
                label: <span>待处理</span>,
                key: 'Pending', // 对应Pending状态
              },
              {
                label: <span>处理中</span>,
                key: 'Processing', // 对应Processing状态
              },
              {
                label: <span>已批准</span>,
                key: 'Approved', // 对应Approved状态
              },
              {
                label: <span>已拒绝</span>,
                key: 'Rejected', // 对应Rejected状态
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
        request={async (params, sort, filter) =>
          queryList('/after-sales-orders', { ...params, status: activeKey }, sort, filter)
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

      <ReviewForm
        onSubmit={async (value) => {
          const success = await handleReview(value); // 假设这是上传逻辑的函数
          if (success) {
            setReviewModalVisible(false); // 控制上传模态窗口的可见性
            setCurrentRow(undefined); // 清空当前选中的行数据
            if (actionRef.current) {
              actionRef.current.reload(); // 如果有表格引用，重新加载表格数据
            }
          }
        }}
        onCancel={setReviewModalVisible} // 关闭模态窗口
        updateModalOpen={reviewModalVisible} // 控制上传模态窗口的开关
        values={currentRow || {}} // 当前行数据，用作表单的初始值或为新上传提供参考数据
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
