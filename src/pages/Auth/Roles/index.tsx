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

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ListItem) => {
  const hide = message.loading(
    <FormattedMessage id="pages.role.adding" defaultMessage="Adding..." />,
  );
  try {
    await addItem('/roles', { ...fields });
    hide();
    message.success(
      <FormattedMessage id="pages.role.addSuccess" defaultMessage="Added successfully" />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error.response.data.message ?? (
        <FormattedMessage
          id="pages.role.addFail"
          defaultMessage="Adding failed, please try again!"
        />
      ),
    );
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading(
    <FormattedMessage id="pages.role.updating" defaultMessage="Updating..." />,
  );
  try {
    await updateItem(`/roles/${fields.id}`, fields);
    hide();
    message.success(
      <FormattedMessage id="pages.role.updateSuccess" defaultMessage="Updated successfully" />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error.response.data.message ?? (
        <FormattedMessage
          id="pages.role.updateFail"
          defaultMessage="Update failed, please try again!"
        />
      ),
    );
    return false;
  }
};

/**
 * @en-US Delete node
 * @zh-CN 删除节点
 * @param selectedRows
 */
const handleRemove = async (ids: number[]) => {
  const hide = message.loading(
    <FormattedMessage id="pages.role.deleting" defaultMessage="Deleting..." />,
  );
  if (!ids) return true;
  try {
    await removeItem('/roles', { ids });
    hide();
    message.success(
      <FormattedMessage
        id="pages.role.deleteSuccess"
        defaultMessage="Deleted successfully and will refresh soon"
      />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error.response.data.message ?? (
        <FormattedMessage
          id="pages.role.deleteFail"
          defaultMessage="Delete failed, please try again!"
        />
      ),
    );
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.ListItem[]>([]);

  const access = useAccess();

  const columns: ProColumns<API.ListItem>[] = [
    {
      title: <FormattedMessage id="pages.role.name" defaultMessage="Name" />,
      width: 200,
      dataIndex: 'name',
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: <FormattedMessage id="pages.role.permissions" defaultMessage="Permissions List" />,
      dataIndex: 'permissions',
      renderText: (val: { name: string }[]) => val.map((item) => item.name).join(', '),
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.role.users" defaultMessage="Users List" />,
      dataIndex: 'employees',
      renderText: (val: { username: string }[]) => val.map((item) => item.username).join(', '),
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.role.createTime" defaultMessage="Creation Time" />,
      width: 250,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="pages.role.updateTime" defaultMessage="Update Time" />,
      width: 250,
      hideInSearch: true,
      hideInTable: true,
      dataIndex: 'updatedAt',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="pages.role.action" defaultMessage="Action" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        access.canUpdateRole && (
          <a
            key="update"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            <FormattedMessage id="pages.role.edit" defaultMessage="Edit" />
          </a>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ListItem, API.PageParams>
        headerTitle={
          <FormattedMessage id="pages.role.management" defaultMessage="Role Management" />
        }
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        pagination={{ defaultPageSize: 10 }}
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          access.canCreateRole && (
            <Button type="primary" key="primary" onClick={() => handleModalOpen(true)}>
              <PlusOutlined /> <FormattedMessage id="pages.role.new" defaultMessage="New" />
            </Button>
          ),
        ]}
        request={async (params, sort, filter) => queryList('/roles', params, sort, filter)}
        columns={columns}
        rowSelection={false}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.role.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.role.items" defaultMessage="items" />
            </div>
          }
        >
          <Button
            type="primary"
            danger
            onClick={() => {
              return Modal.confirm({
                title: (
                  <FormattedMessage
                    id="pages.role.confirmDelete"
                    defaultMessage="Confirm Delete?"
                  />
                ),
                onOk: async () => {
                  await handleRemove(selectedRowsState?.map((item) => item.id!));
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: (
                  <FormattedMessage
                    id="pages.role.deleteConfirm"
                    defaultMessage="Are you sure you want to delete?"
                  />
                ),
                okText: <FormattedMessage id="pages.role.confirm" defaultMessage="Confirm" />,
                cancelText: <FormattedMessage id="pages.role.cancel" defaultMessage="Cancel" />,
              });
            }}
          >
            <FormattedMessage id="pages.role.batchDeletion" defaultMessage="Batch Deletion" />
          </Button>
        </FooterToolbar>
      )}
      <Create
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.ListItem);
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
        currentRow={currentRow as API.ListItem}
        columns={columns as ProDescriptionsItemProps<API.ListItem>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
