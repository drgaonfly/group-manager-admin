import { useIntl } from '@umijs/max';
import {
  addItem,
  handleItem,
  queryList,
  removeItem,
  updateItem,
} from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, Checkbox, message, Modal, Select } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import UploadForm from './components/UploadForm';
import { convertToTextObject, locationMapping, platformNames } from '@/utils/constants';
import UserDetail from '@/pages/Users/components/Show';

const userColumns: ProColumns<API.ItemData>[] = [
  {
    title: '邮箱',
    dataIndex: 'email',
    copyable: true,
  },
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '角色',
    dataIndex: 'role',
    valueEnum: {
      SUPER_ADMIN: '超级管理员',
      CUSTOMER: '客户',
      ORDER_CLERK: '下单员',
      ADMIN: '客服',
      FINANCIAL_STAFF: '财务人员',
    },
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

const handleUploadBill = async (fields: API.ItemData) => {
  const hide = message.loading('正在上传');
  try {
    await addItem('/tasks/upload-bills', { ...fields });
    hide();
    message.success('上传成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Adding failed, please try again!');
    return false;
  }
};

const handleDownload = async (id: string) => {
  const hide = message.loading('正在准备下载');
  try {
    const response = await handleItem(`/tasks/download-task`, { taskId: id }); // Assuming handleItem can handle method and body
    hide();

    console.log('response', response);

    if (response?.data) {
      message.success('文件准备完成，下载即将开始');
      // Optionally handle the download URL from the response
      window.open(response.data.signedURL, '_blank');
      return true;
    } else {
      throw new Error('No download URL returned');
    }
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '下载失败，请重试!');
    return false;
  }
};

const handleCancel = async (id: string) => {
  const hide = message.loading('正在取消');
  try {
    await handleItem(`/tasks/${id}/cancel`);
    hide();

    message.success('取消成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '取消 失败，请重试!');
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
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<API.ItemData>();
  const [showUserDetail, setShowUserDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();
  const [activeKey, setActiveKey] = useState<string | undefined>('');

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'code' }),
      dataIndex: 'code',
      width: 250,
      copyable: true,
      render: (dom, entity: any) => {
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
      title: intl.formatMessage({ id: 'bill_file' }),
      width: 100,
      dataIndex: 'billFile',
      hideInSearch: true,
      render: (_, record: any) => {
        // Ensure file URL exists
        if (!record.billFile) return intl.formatMessage({ id: 'no_file' });

        // Return a download button or link
        return (
          <a href={record.billFile} download target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({ id: 'download' })}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'country' }),
      width: 150,
      // filters: true,
      // onFilter: true,
      dataIndex: 'country',
      valueEnum: convertToTextObject(locationMapping),
    },
    {
      title: intl.formatMessage({ id: 'platform' }),
      // filters: true,
      // onFilter: true,
      width: 100,
      dataIndex: 'platform',
      valueEnum: convertToTextObject(platformNames),
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
      title: intl.formatMessage({ id: 'source_file' }),
      dataIndex: 'file',
      width: 150,
      hideInSearch: true,
      render: (_, record) => {
        if (!record.file) return intl.formatMessage({ id: 'no_file' });

        return (
          <Button type="link" onClick={() => handleDownload(record._id!)}>
            {intl.formatMessage({ id: 'download' })}
          </Button>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'status' }),
      width: 100,
      dataIndex: 'status',
      valueEnum: {
        Active: {
          text: intl.formatMessage({ id: 'active' }),
          status: 'Success',
        },
        Cancelled: {
          text: intl.formatMessage({ id: 'cancelled' }),
          status: 'Error',
        },
        Processing: {
          text: intl.formatMessage({ id: 'processing' }),
          status: 'Processing',
        },
        Completed: {
          text: intl.formatMessage({ id: 'completed' }),
          status: 'Default',
        },
        Issue: {
          text: intl.formatMessage({ id: 'issue' }),
          status: 'Warning',
        },
      },
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'customer' }),
      dataIndex: 'user',
      width: 200,
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentUser(entity.user);
              setShowUserDetail(true);
            }}
          >
            {entity.user ? entity.user.name : intl.formatMessage({ id: 'none' })}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'order_time_type' }),
      width: 180,
      dataIndex: 'orderTimeType',
      valueEnum: {
        NormalOrder: { text: intl.formatMessage({ id: 'normal_order' }) },
        SpecificTimeOrder: { text: intl.formatMessage({ id: 'specific_time_order' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'order_time' }),
      width: 150,
      hideInSearch: true,
      dataIndex: 'orderTime',
      valueType: 'dateTime',
    },
    {
      title: intl.formatMessage({ id: 'upload_time' }),
      width: 150,
      dataIndex: 'uploadTime',
      valueType: 'date',
    },
    {
      title: intl.formatMessage({ id: 'review_type' }),
      width: 120,
      dataIndex: 'reviewType',
      valueEnum: {
        NormalReview: { text: intl.formatMessage({ id: 'normal_review' }) },
        ReviewAfterModification: { text: intl.formatMessage({ id: 'review_after_modification' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'comment_after_file' }),
      width: 180,
      dataIndex: 'uploadedFile',
      hideInSearch: true,
      render: (_, record: any) => {
        if (!record.uploadedFile) return intl.formatMessage({ id: 'no_file' });

        return (
          <a href={record.uploadedFile} download target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({ id: 'download' })}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'quantity' }),
      width: 80,
      dataIndex: 'quantity',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'order_type' }),
      width: 150,
      dataIndex: 'orderType',
      valueEnum: {
        NormalOrder: { text: intl.formatMessage({ id: 'normal_order' }) },
        ContactForVolumeWeight: { text: intl.formatMessage({ id: 'contact_for_volume_weight' }) },
        ContactForInventory: { text: intl.formatMessage({ id: 'contact_for_inventory' }) },
        ContactForPrice: { text: intl.formatMessage({ id: 'contact_for_price' }) },
      },
      renderFormItem: (item, { defaultRender }) => {
        if (item && item.valueEnum) {
          return (
            <Select mode="multiple" placeholder={intl.formatMessage({ id: 'please_select' })}>
              {Object.entries(item.valueEnum).map(([value, { text }]) => (
                <Select.Option key={value} value={value}>
                  <Checkbox style={{ marginRight: 8 }} />
                  {text}
                </Select.Option>
              ))}
            </Select>
          );
        }
        return defaultRender(item);
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      width: 250,
      fixed: 'right',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        access.canCustomer && (
          <a
            key="edit"
            onClick={() => {
              // Replace `handleUpdateModalOpen` and `setCurrentRow` with your actual functions
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </a>
        ),
        access.canOrderClerk && (
          <a
            key="upload"
            onClick={() => {
              setUploadModalVisible(true);
              setCurrentRow(record);
            }}
          >
            上传
          </a>
        ),
        access.canCustomer && (
          <a
            key="cancel"
            onClick={() => {
              // Replace `handleRemove`, `setSelectedRows`, and `actionRef.current?.reloadAndRest?` as well
              return Modal.confirm({
                title: '确认取消?',
                onOk: async () => {
                  await handleCancel(record._id!);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: '确定取消吗？',
                okText: '确认',
                cancelText: '取消',
              });
            }}
          >
            取消
          </a>
        ),
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
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        scroll={{ x: 1200 }}
        rowKey="_id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
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
        request={async (params, sort, filter) =>
          queryList('/tasks', { ...params, status: activeKey }, sort, filter)
        }
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
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
                label: <span>正常</span>,
                key: 'Active', // 对应Active状态
              },
              // 下面添加新的状态
              {
                label: <span>处理中</span>,
                key: 'Processing', // 对应Processing状态
              },
              {
                label: <span>已取消</span>,
                key: 'Cancelled', // 对应Cancelled状态
              },
              {
                label: <span>已完成</span>,
                key: 'Completed', // 对应Completed状态
              },
              {
                label: <span>有问题</span>,
                key: 'Issue', // 对应Issue状态
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
                  title: intl.formatMessage({ id: 'confirm_delete' }),
                  onOk: async () => {
                    await handleRemove(selectedRowsState?.map((item) => item._id!));
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                  },
                  content: intl.formatMessage({ id: 'confirm_delete_content' }),
                  okText: intl.formatMessage({ id: 'confirm' }),
                  cancelText: intl.formatMessage({ id: 'cancel' }),
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
      <UploadForm
        onSubmit={async (value) => {
          const success = await handleUploadBill(value); // 假设这是上传逻辑的函数
          if (success) {
            setUploadModalVisible(false); // 控制上传模态窗口的可见性
            setCurrentRow(undefined); // 清空当前选中的行数据
            if (actionRef.current) {
              actionRef.current.reload(); // 如果有表格引用，重新加载表格数据
            }
          }
        }}
        onCancel={setUploadModalVisible} // 关闭模态窗口
        updateModalOpen={uploadModalVisible} // 控制上传模态窗口的开关
        values={currentRow || {}} // 当前行数据，用作表单的初始值或为新上传提供参考数据
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

      <Show
        open={showDetail}
        currentRow={currentRow as API.ItemData}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
      <UserDetail
        open={showUserDetail}
        currentRow={currentUser as API.ItemData}
        columns={userColumns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentUser(undefined);
          setShowUserDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
