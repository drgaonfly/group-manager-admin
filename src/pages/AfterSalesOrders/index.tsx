import { useIntl } from '@umijs/max';
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
import { convertToTextObject, locationMapping } from '@/utils/constants';
import ShowBill from '@/pages/Bills/components/Show';

const billColumns: ProColumns<API.ItemData>[] = [
  {
    title: '客户',
    dataIndex: 'customer',
    width: 200,
    hideInSearch: true,
    render: (_, record: any) => {
      return record.customer && record.customer.name ? record.customer.name : '未知';
    },
  },
  {
    title: '国家',
    dataIndex: 'country',
    valueEnum: convertToTextObject(locationMapping),
  },
  {
    title: '订单号',
    dataIndex: 'orderNumber',
  },
  {
    title: '下单时间',
    dataIndex: 'uploadTime',
    valueType: 'date',
  },
  {
    title: '店铺名',
    dataIndex: 'storeName',
  },
  {
    title: '金额',
    dataIndex: 'amount',
    hideInSearch: true,
  },
  {
    title: '汇率',
    dataIndex: 'exchangeRate',
    hideInSearch: true,
  },
  {
    title: '服务费',
    dataIndex: 'serviceFee',
    hideInSearch: true,
  },
  {
    title: '支付金额',
    dataIndex: 'paymentAmount',
    hideInSearch: true,
  },
  {
    title: '买手号',
    dataIndex: 'buyerId',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    hideInSearch: true,
    sorter: true,
  },
];

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

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentBill, setCurrentBill] = useState<API.ItemData>();

  const [showBillDetail, setShowBillDetail] = useState(false);

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
      title: intl.formatMessage({ id: 'associated_bill' }),
      copyable: true,
      width: 250,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentBill(entity.bill);
              setShowBillDetail(true);
            }}
          >
            {entity.bill ? entity.bill._id : intl.formatMessage({ id: 'none' })}
          </a>
        );
      },
      dataIndex: 'bill',
    },
    {
      title: intl.formatMessage({ id: 'order_number' }),
      dataIndex: 'orderNumber',
      width: 180,
      copyable: true,
      key: 'orderNumber',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'applicant' }),
      dataIndex: 'user',
      width: 200,
      hideInSearch: true,
      render: (_, record: any) => {
        return record.user && record.user.name
          ? record.user.name
          : intl.formatMessage({ id: 'unknown' });
      },
    },
    {
      title: intl.formatMessage({ id: 'reason' }),
      ellipsis: true,
      width: 170,
      dataIndex: 'reason',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'refund_amount' }),
      width: 170,
      dataIndex: 'refundAmount',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'image' }),
      dataIndex: 'image',
      width: 170,
      hideInSearch: true,
      valueType: 'image',
    },
    {
      title: intl.formatMessage({ id: 'rejection_reason' }),
      ellipsis: true,
      width: 170,
      dataIndex: 'rejectionReason',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'status',
      hideInSearch: true,
      width: 170,
      valueEnum: {
        Pending: { text: intl.formatMessage({ id: 'pending' }), status: 'Warning' },
        Processing: { text: intl.formatMessage({ id: 'processing' }), status: 'Processing' },
        Approved: { text: intl.formatMessage({ id: 'approved' }), status: 'Success' },
        Rejected: { text: intl.formatMessage({ id: 'rejected' }), status: 'Error' },
      },
    },
    {
      title: intl.formatMessage({ id: 'creation_time' }),
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
            key="requestApprove"
            onClick={async () => {
              await handleUpdate({ _id: record._id, status: 'Processing' });
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
        scroll={{ x: 1200 }}
        search={{
          labelWidth: 120,
          collapsed: false,
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

      <ShowBill
        open={showBillDetail}
        currentRow={currentBill as API.ItemData}
        columns={billColumns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentBill(undefined);
          setShowBillDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
