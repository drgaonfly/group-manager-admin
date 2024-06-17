import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import { convertToTextObject, locationMapping, platformNames } from '@/utils/constants';
import AfterSaleForm from './components/AfterSaleForm';

import ShowTask from '@/pages/Tasks/components/Show';
import { EditOutlined } from '@ant-design/icons';
import BatchSetting from './components/BatchSetting';

const taskColumns: ProColumns<API.ItemData>[] = [
  {
    title: <FormattedMessage id="code" defaultMessage="Code" />,
    dataIndex: 'code',
    width: 150,
    copyable: true,
  },
  {
    title: <FormattedMessage id="bill_file" />,
    width: 100,
    dataIndex: 'billFile',
    hideInSearch: true,
    render: (_, record: any) => {
      // Ensure file URL exists
      if (!record.billFile) return <FormattedMessage id="no_file" />;

      // Return a download button or link
      return (
        <a href={record.billFile} download target="_blank" rel="noopener noreferrer">
          <FormattedMessage id="download" />
        </a>
      );
    },
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
    await addItem('/bills', { ...fields });
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
    await updateItem(`/bills/${fields._id}`, fields);
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

const handleBatchSetting = async (fieldsArray: any) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/bills/bulk-setting`, { ...fieldsArray });
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
    await removeItem('/bills', {
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

const handleAfterSale = async (fieldsArray: any) => {
  const hide = message.loading(
    <FormattedMessage id="applying_after_sale" defaultMessage="Applying for after-sale" />,
  );
  try {
    await addItem('/bills/after-sales-order', { ...fieldsArray, id: fieldsArray._id });
    hide();
    message.success(
      <FormattedMessage
        id="apply_after_sale_success"
        defaultMessage="Apply for after-sale success"
      />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage
          id="apply_after_sale_failed"
          defaultMessage="Apply for after-sale failed, please try again!"
        />
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
  const [batchSettingModalOpen, setBatchSettingModalOpen] = useState<boolean>(false);
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
  const [afterSaleModalVisible, setAfterSaleModalVisible] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'related_task' }),
      dataIndex: 'task',
      width: 200,
      copyable: true,
      render: (dom, record: any) => {
        return record.task ? (
          <a
            onClick={() => {
              setCurrentTask(record.task);
              setShowTaskDetail(true);
            }}
          >
            {record.task.code}
          </a>
        ) : (
          intl.formatMessage({ id: 'none' })
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'customer' }),
      dataIndex: 'customer',
      width: 100,
      hideInSearch: true,
      render: (_, record: any) => {
        return record.customer && record.customer.name
          ? record.customer.name
          : intl.formatMessage({ id: 'unknown' });
      },
    },
    {
      title: intl.formatMessage({ id: 'country' }),
      width: 200,
      dataIndex: 'country',
      valueEnum: convertToTextObject(locationMapping),
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
      title: intl.formatMessage({ id: 'order_number' }),
      dataIndex: 'orderNumber',
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
      title: intl.formatMessage({ id: 'upload_time' }),
      dataIndex: 'uploadTime',
      width: 100,
      valueType: 'date',
    },
    {
      title: intl.formatMessage({ id: 'store_name' }),
      dataIndex: 'storeName',
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'amount' }),
      dataIndex: 'amount',
      width: 100,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'exchange_rate' }),
      dataIndex: 'exchangeRate',
      width: 150,
      hideInTable: access.isOrderPlacer || access.isReviewer,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'service_fee' }),
      dataIndex: 'serviceFee',
      hideInTable: access.isOrderPlacer || access.isReviewer,
      width: 150,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'payment_amount' }),
      dataIndex: 'paymentAmount',
      hideInTable: access.isOrderPlacer || access.isReviewer,
      width: 150,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'buyer_id' }),
      dataIndex: 'buyerId',
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'is_signed' }),
      dataIndex: 'isSigned',
      width: 150,
      key: 'isSigned',
      valueEnum: {
        '': { text: intl.formatMessage({ id: 'all' }), status: 'Default' },
        true: { text: intl.formatMessage({ id: 'signed' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'not_signed' }), status: 'Error' },
      },
      render: (_, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'yes' })}
          unCheckedChildren={intl.formatMessage({ id: 'no' })}
          checked={record.isSigned}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isSigned: !record.isSigned });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'is_reviewed' }),
      dataIndex: 'isReviewed',
      width: 150,
      key: 'isReviewed',
      valueEnum: {
        '': { text: intl.formatMessage({ id: 'all' }), status: 'Default' },
        true: { text: intl.formatMessage({ id: 'reviewed' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'not_reviewed' }), status: 'Error' },
      },
      render: (_, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'yes' })}
          unCheckedChildren={intl.formatMessage({ id: 'no' })}
          checked={record.isReviewed}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isReviewed: !record.isReviewed });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'created_at' }),
      width: 150,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      width: 250,
      dataIndex: 'option',
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => [
        (access.canCustomerService || access.canCustomer) && (
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

        access.canAdmin && (
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
        record.afterSales
          ? null
          : (access.canCustomer || access.canCustomerService) && (
              <a
                key="afterSale"
                onClick={() => {
                  setAfterSaleModalVisible(true);
                  setCurrentRow(record);
                }}
              >
                {intl.formatMessage({
                  id: 'apply_after_sale',
                  defaultMessage: 'Apply for After-sale',
                })}
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
          optionRender: (searchConfig, props, dom) => [
            access.canCustomer && (
              <Button
                key="export"
                type="dashed"
                onClick={async () => {
                  // Show a loading message
                  const hide = message.loading(
                    intl.formatMessage({ id: 'exporting', defaultMessage: 'Exporting...' }),
                    0,
                  );

                  try {
                    // Perform the export operation
                    console.log('Export button clicked', props.form?.getFieldsValue());
                    const response = await queryList('/bills/export', {
                      ...props.form?.getFieldsValue(),
                    });

                    hide();

                    if (response?.data) {
                      message.success(
                        intl.formatMessage({
                          id: 'file_ready',
                          defaultMessage: 'File is ready, download will start soon',
                        }),
                      );
                      // Open the download URL in a new tab
                      // @ts-ignore
                      window.open(response.data.signedURL, '_blank');
                    } else {
                      throw new Error('No download URL returned');
                    }
                  } catch (error) {
                    // Update the message
                    hide();
                    message.error(
                      intl.formatMessage({ id: 'export_failed', defaultMessage: 'Export failed' }),
                    );
                  }
                }}
              >
                {intl.formatMessage({ id: 'export', defaultMessage: 'Export' })}
              </Button>
            ),
            ...dom,
          ],
        }}
        toolBarRender={() => [
          selectedRowsState?.length > 0 && (
            <>
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  console.log('selectedRowsState', selectedRowsState);
                  setBatchSettingModalOpen(true);
                }}
              >
                <EditOutlined />{' '}
                <FormattedMessage id="batch_setting" defaultMessage="Batch Setting" />
              </Button>
              {access.canAdmin && (
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
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                label: <span>{intl.formatMessage({ id: 'all' })}</span>,
                key: '',
              },
              {
                label: <span>{intl.formatMessage({ id: 'normal' })}</span>,
                key: 'false',
              },
              {
                label: <span>{intl.formatMessage({ id: 'after_sales' })}</span>,
                key: 'true',
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
          queryList('/bills', { ...params, afterSales: activeKey }, sort, filter)
        }
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

      <BatchSetting
        onSubmit={async (values) => {
          const success = await handleBatchSetting(values);
          if (success) {
            setBatchSettingModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={setBatchSettingModalOpen}
        batchSettingModalOpen={batchSettingModalOpen}
        values={selectedRowsState || []}
      />

      <AfterSaleForm
        onSubmit={async (value) => {
          const success = await handleAfterSale(value); // 假设这是上传逻辑的函数
          if (success) {
            setAfterSaleModalVisible(false); // 控制上传模态窗口的可见性
            setCurrentRow(undefined); // 清空当前选中的行数据
            if (actionRef.current) {
              actionRef.current.reload(); // 如果有表格引用，重新加载表格数据
            }
          }
        }}
        onCancel={setAfterSaleModalVisible} // 关闭模态窗口
        updateModalOpen={afterSaleModalVisible} // 控制上传模态窗口的开关
        values={currentRow || {}} // 当前行数据，用作表单的初始值或为新上传提供参考数据
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
