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
import UploadForm from './components/UploadForm';
import BatchUploadModal from './components/BatchUploadModal';
import { convertToTextObject, locationMapping, platformNames } from '@/utils/constants';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading('正在搜索');
  try {
    await addItem('/assignment-records', { ...fields });
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
    await updateItem(`/assignment-records/${fields._id}`, fields);
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
    await removeItem('/assignment-records', {
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
    await addItem('/assignment-records/upload-bills', { ...fields });
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

const handleBatchAdd = async (fields: API.ItemData) => {
  const hide = message.loading(
    <FormattedMessage id="bulk_uploading" defaultMessage="Bulk uploading..." />,
  );
  try {
    await addItem('/assignment-records/upload', { ...fields });
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

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();
  const [batchUploadModalOpen, setBatchUploadModalOpen] = useState<boolean>(false);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'country' }),
      width: 150,
      dataIndex: 'country',
      valueEnum: convertToTextObject(locationMapping),
    },
    {
      title: intl.formatMessage({ id: 'platform' }),
      width: 150,
      dataIndex: 'platform',
      valueEnum: convertToTextObject(platformNames),
    },
    {
      title: intl.formatMessage({ id: 'store_account' }),
      dataIndex: 'storeAccount',
      copyable: true,
      width: 200,
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
      title: intl.formatMessage({ id: 'account_library' }),
      dataIndex: 'accountLibrary',
      hideInSearch: true,
      width: 200,
      renderText: (accountLibrary: {
        accountNumber: string;
        loginAccount: string;
        loginPassword: string;
      }) => (
        <>
          <div>
            {intl.formatMessage({ id: 'order_account_number' })}: {accountLibrary?.accountNumber}
          </div>
          <div>
            {intl.formatMessage({ id: 'login_account' })}: {accountLibrary?.loginAccount}
          </div>
          <div>
            {intl.formatMessage({ id: 'login_password' })}: {accountLibrary?.loginPassword}
          </div>
        </>
      ),
    },
    {
      title: intl.formatMessage({ id: 'assigned_time' }),
      dataIndex: 'assignedTime',
      width: 170,
      valueType: 'date',
    },
    {
      title: intl.formatMessage({ id: 'operator' }),
      dataIndex: 'user',
      width: 200,
      hideInSearch: true,
      render: (_, record) => {
        return record.user && record.user.name
          ? record.user.name
          : intl.formatMessage({ id: 'unknown' });
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      width: 250,
      fixed: 'right',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        // access.canCustomer && (
        //   <a
        //     key="edit"
        //     onClick={() => {
        //       // Replace `handleUpdateModalOpen` and `setCurrentRow` with your actual functions
        //       handleUpdateModalOpen(true);
        //       setCurrentRow(record);
        //     }}
        //   >
        //     编辑
        //   </a>
        // ),
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
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          // access.canCustomer && (
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
          // access.canCustomer && (
          //   <Button
          //     danger
          //     key="batchUpload"
          //     onClick={() => {
          //       setBatchUploadModalOpen(true);
          //     }}
          //   >
          //     <UploadOutlined /> 批量上传
          //   </Button>
          // ),
        ]}
        request={async (params, sort, filter) =>
          queryList('/assignment-records', { ...params }, sort, filter)
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
      <BatchUploadModal
        open={batchUploadModalOpen}
        onOpenChange={setBatchUploadModalOpen}
        onFinish={async (values) => {
          const success = await handleBatchAdd(values as API.ItemData);
          if (success) {
            setBatchUploadModalOpen(false);
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
