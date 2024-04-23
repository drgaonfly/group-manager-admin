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
import UploadForm from './components/UploadForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading('正在添加');
  try {
    await addItem('/accounts', { ...fields });
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
    await updateItem(`/accounts/${fields._id}`, fields);
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
    await removeItem('/accounts', {
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
    await addItem('/accounts/upload-bills', { ...fields });
    hide();
    message.success('上传成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Adding failed, please try again!');
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
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

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
      title: '编号',
      dataIndex: '_id',
      width: 250,
      copyable: true,
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
      title: '国家',
      width: 150,
      dataIndex: 'country',
      valueEnum: {
        Vietnam: { text: '越南' },
        Thailand: { text: '泰国' },
        Malaysia: { text: '马来西亚' },
        Philippines: { text: '菲律宾' },
        Indonesia: { text: '印尼' },
      },
    },
    {
      title: '平台',
      width: 150,
      dataIndex: 'platform',
      valueEnum: {
        Shopee: { text: 'Shopee' },
        Lazada: { text: 'Lazada' },
        TikTok: { text: 'TikTok' },
      },
    },
    {
      title: '账号',
      dataIndex: 'accountNumber',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '窗口序号',
      dataIndex: 'serialNumber',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '平台账号',
      dataIndex: 'storeAccount',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '分配时间',
      dataIndex: 'assignedTime',
      valueType: 'date',
    },
    {
      title: '操作',
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
            编辑
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
        headerTitle="列表"
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
          queryList('/accounts', { ...params }, sort, filter)
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
    </PageContainer>
  );
};

export default TableList;
