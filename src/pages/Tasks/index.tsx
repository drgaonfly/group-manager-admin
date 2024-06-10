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
import CopyToClipboard from '@/components/CopyToClipboard';

const userColumns: ProColumns<API.ItemData>[] = [
  {
    title: <FormattedMessage id="email" defaultMessage="Email" />,
    dataIndex: 'email',
    copyable: true,
  },
  {
    title: <FormattedMessage id="name" defaultMessage="Name" />,
    dataIndex: 'name',
  },
  {
    title: <FormattedMessage id="role" defaultMessage="Role" />,
    dataIndex: 'role',
    valueEnum: {
      SUPER_ADMIN: { text: <FormattedMessage id="super_admin" defaultMessage="Super Admin" /> },
      CUSTOMER: { text: <FormattedMessage id="customer" defaultMessage="Customer" /> },
      ORDER_CLERK: { text: <FormattedMessage id="order_clerk" defaultMessage="Order Clerk" /> },
      ADMIN: { text: <FormattedMessage id="admin" defaultMessage="Admin" /> },
      FINANCIAL_STAFF: {
        text: <FormattedMessage id="financial_staff" defaultMessage="Financial Staff" />,
      },
    },
  },
];

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
  try {
    await addItem('/tasks', { ...fields });
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
    await updateItem(`/tasks/${fields._id}`, fields);
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
    await removeItem('/tasks', {
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

const handleUploadBill = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="uploading" defaultMessage="Uploading..." />);
  try {
    await addItem('/tasks/upload-bills', { ...fields });
    hide();
    message.success(<FormattedMessage id="upload_successful" defaultMessage="Upload successful" />);
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

// const handleDownload = async (id: string) => {
//   const hide = message.loading(
//     <FormattedMessage id="preparing_download" defaultMessage="Preparing download" />,
//   );
//   try {
//     const response = await handleItem(`/tasks/download-task`, { taskId: id }); // Assuming handleItem can handle method and body
//     hide();

//     console.log('response', response);

//     if (response?.data) {
//       message.success(
//         <FormattedMessage
//           id="file_ready"
//           defaultMessage="File is ready, download will start soon"
//         />,
//       );
//       // Optionally handle the download URL from the response
//       window.open(response.data.signedURL, '_blank');
//       return true;
//     } else {
//       throw new Error('No download URL returned');
//     }
//   } catch (error: any) {
//     hide();
//     message.error(
//       error?.response?.data?.message ?? (
//         <FormattedMessage
//           id="download_failed"
//           defaultMessage="Download failed, please try again!"
//         />
//       ),
//     );
//     return false;
//   }
// };

const handleCancel = async (id: string) => {
  const hide = message.loading(<FormattedMessage id="canceling" defaultMessage="Canceling" />);
  try {
    await handleItem(`/tasks/${id}/cancel`);
    hide();

    message.success(<FormattedMessage id="cancel_success" defaultMessage="Cancel successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="cancel_failed" defaultMessage="Cancel failed, please try again!" />
      ),
    );
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
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: '_id',
      width: 250,
      copyable: true,
      hideInTable: true,
      hideInSearch: true,
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
      title: intl.formatMessage({ id: 'billUploader' }),
      dataIndex: 'billUploader',
      width: 200,
      copyable: true,
      renderText: (_, record: any) => {
        return record.billUploader && record.billUploader.name
          ? record.billUploader.name
          : intl.formatMessage({ id: 'unknown' });
      },
    },
    {
      title: intl.formatMessage({ id: 'lastBillUploadTime' }),
      dataIndex: 'lastBillUploadTime',
      width: 200,
      hideInSearch: true,
      valueType: 'dateTime',
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
    {
      title: intl.formatMessage({ id: 'orderNote' }),
      width: 150,
      dataIndex: 'orderNote',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'source_file' }),
      dataIndex: 'file',
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        if (!record.file) return intl.formatMessage({ id: 'no_file' });

        return (
          <a href={record.file} download target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({ id: 'download' })}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'created_at' }),
      width: 200,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
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
      render: (dom, entity) => {
        const name = entity.user ? entity.user.name : intl.formatMessage({ id: 'none' });
        return (
          <>
            <a
              onClick={() => {
                setCurrentUser(entity.user);
                setShowUserDetail(true);
              }}
            >
              {name}
            </a>
            <span> </span>
            <CopyToClipboard text={name} />
          </>
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
        access.canCustomer && record.status !== 'Processing' && (
          <a
            key="claim"
            onClick={async (e) => {
              e.preventDefault(); // 阻止默认的链接点击行为
              const response: any = await handleItem(`tasks/${record._id}/claim`);
              if (response.success) {
                // Use the downloadUrl here
                window.open(response.downloadUrl);
                actionRef.current?.reloadAndRest?.();
              } else {
                // Handle the error here
                console.error('Claim failed');
              }
            }}
          >
            {intl.formatMessage({ id: 'claim' })}
          </a>
        ),
        access.canOrderPlacer && (
          <a
            key="upload"
            onClick={() => {
              setUploadModalVisible(true);
              setCurrentRow(record);
            }}
          >
            <FormattedMessage id="upload" defaultMessage="上传" />
          </a>
        ),
        access.canCustomer && (
          <a
            key="cancel"
            onClick={() => {
              return Modal.confirm({
                title: intl.formatMessage({ id: 'confirm_cancel' }),
                onOk: async () => {
                  await handleCancel(record._id!);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: intl.formatMessage({ id: 'confirm_cancel_content' }),
                okText: intl.formatMessage({ id: 'confirm' }),
                cancelText: intl.formatMessage({ id: 'cancel' }),
              });
            }}
          >
            {intl.formatMessage({ id: 'cancel' })}
          </a>
        ),
        access.canSuperAdmin && (
          <a
            key="delete"
            onClick={() => {
              return Modal.confirm({
                title: intl.formatMessage({ id: 'confirm_delete' }),
                onOk: async () => {
                  await handleRemove([record._id!]);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: intl.formatMessage({ id: 'confirm_delete_content' }),
                okText: intl.formatMessage({ id: 'confirm' }),
                cancelText: intl.formatMessage({ id: 'cancel' }),
              });
            }}
          >
            {intl.formatMessage({ id: 'delete' })}
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
          labelWidth: 180,
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
                label: <FormattedMessage id="all" defaultMessage="All" />,
                key: '',
              },
              {
                label: <FormattedMessage id="active" defaultMessage="Active" />,
                key: 'Active',
              },
              // 下面添加新的状态
              {
                label: <FormattedMessage id="processing" defaultMessage="Processing" />,
                key: 'Processing',
              },
              {
                label: <FormattedMessage id="cancelled" defaultMessage="Cancelled" />,
                key: 'Cancelled',
              },
              {
                label: <FormattedMessage id="completed" defaultMessage="Completed" />,
                key: 'Completed',
              },
              {
                label: <FormattedMessage id="issue" defaultMessage="Issue" />,
                key: 'Issue',
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
