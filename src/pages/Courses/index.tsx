import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import { convertToTextObject, locationMapping, platformNames } from '@/utils/constants';

import ShowTask from '@/pages/Tasks/components/Show';
import { PlusOutlined } from '@ant-design/icons';
import VideoPlayer from '@/components/VideoPlayer';

const taskColumns: ProColumns<API.ItemData>[] = [
  {
    title: <FormattedMessage id="code" defaultMessage="Code" />,
    dataIndex: 'code',
    width: 150,
    copyable: true,
  },
  {
    title: <FormattedMessage id="country" defaultMessage="Country" />,
    width: 100,
    dataIndex: 'country',
    valueEnum: convertToTextObject(locationMapping),
  },
  {
    title: <FormattedMessage id="platform" defaultMessage="Platform" />,
    width: 100,
    dataIndex: 'platform',
    valueEnum: convertToTextObject(platformNames),
  },
  {
    title: <FormattedMessage id="status" defaultMessage="Status" />,
    width: 100,
    dataIndex: 'status',
    valueEnum: {
      Active: {
        text: <FormattedMessage id="status_active" defaultMessage="Active" />,
        status: 'Success',
      },
      Cancelled: {
        text: <FormattedMessage id="status_cancelled" defaultMessage="Cancelled" />,
        status: 'Error',
      },
      Processing: {
        text: <FormattedMessage id="status_processing" defaultMessage="Processing" />,
        status: 'Processing',
      },
      Completed: {
        text: <FormattedMessage id="status_completed" defaultMessage="Completed" />,
        status: 'Default',
      },
      Issue: {
        text: <FormattedMessage id="status_issue" defaultMessage="Issue" />,
        status: 'Warning',
      },
    },
    hideInSearch: true,
  },
  {
    title: <FormattedMessage id="customer" defaultMessage="Customer" />,
    dataIndex: 'user',
    width: 200,
    hideInSearch: true,
    render: (_, record: any) => {
      return record.user && record.user.name ? (
        record.user.name
      ) : (
        <FormattedMessage id="unknown" defaultMessage="Unknown" />
      );
    },
  },
  {
    title: <FormattedMessage id="code" defaultMessage="Code" />,
    dataIndex: 'code',
    width: 150,
    copyable: true,
  },
  {
    title: <FormattedMessage id="country" defaultMessage="Country" />,
    width: 100,
    dataIndex: 'country',
    valueEnum: convertToTextObject(locationMapping),
  },
  {
    title: <FormattedMessage id="platform" defaultMessage="Platform" />,
    width: 100,
    dataIndex: 'platform',
    valueEnum: convertToTextObject(platformNames),
  },
  {
    title: <FormattedMessage id="status" defaultMessage="Status" />,
    width: 100,
    dataIndex: 'status',
    valueEnum: {
      Active: {
        text: <FormattedMessage id="status_active" defaultMessage="Active" />,
        status: 'Success',
      },
      Cancelled: {
        text: <FormattedMessage id="status_cancelled" defaultMessage="Cancelled" />,
        status: 'Error',
      },
      Processing: {
        text: <FormattedMessage id="status_processing" defaultMessage="Processing" />,
        status: 'Processing',
      },
      Completed: {
        text: <FormattedMessage id="status_completed" defaultMessage="Completed" />,
        status: 'Default',
      },
      Issue: {
        text: <FormattedMessage id="status_issue" defaultMessage="Issue" />,
        status: 'Warning',
      },
    },
    hideInSearch: true,
  },
  {
    title: <FormattedMessage id="customer" defaultMessage="Customer" />,
    dataIndex: 'user',
    width: 200,
    hideInSearch: true,
    render: (_, record: any) => {
      return record.user && record.user.name ? (
        record.user.name
      ) : (
        <FormattedMessage id="unknown" defaultMessage="Unknown" />
      );
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
    await addItem('/courses', { ...fields });
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
    await updateItem(`/courses/${fields._id}`, fields);
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
    await removeItem('/courses', {
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
  const [currentTask, setCurrentTask] = useState<API.ItemData>();
  const [showTaskDetail, setShowTaskDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'title' }),
      dataIndex: 'title',
      ellipsis: true,
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
      title: intl.formatMessage({ id: 'video_url' }),
      dataIndex: 'videoUrl',
      width: 200,
      // @ts-ignore
      render: (videoUrl: string, entity: any) => (
        <VideoPlayer entity={entity} videoUrl={videoUrl} />
      ),
    },
    {
      title: intl.formatMessage({ id: 'duration' }),
      dataIndex: 'duration',
      width: 200,
    },
    {
      title: intl.formatMessage({ id: 'weight' }),
      dataIndex: 'weight',
      width: 200,
    },
    {
      title: intl.formatMessage({ id: 'created_at' }),
      width: 150,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      width: 250,
      dataIndex: 'option',
      fixed: 'right',
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
          {intl.formatMessage({ id: 'edit' })}
        </a>,

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
        rowKey="_id"
        scroll={{ x: 1200 }}
        search={{
          labelWidth: 180,
          collapsed: false,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
          selectedRowsState?.length > 0 && (
            <>
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
            </>
          ),
        ]}
        request={async (params, sort, filter) => queryList('/courses', { ...params }, sort, filter)}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {/* {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
        </FooterToolbar>
      )} */}
      <Create
        selectedRowsState={selectedRowsState}
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

      <Show
        open={showDetail}
        currentRow={currentRow as API.ItemData}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />

      <ShowTask
        open={showTaskDetail}
        currentRow={currentTask as API.ItemData}
        columns={taskColumns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentTask(undefined);
          setShowTaskDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
