import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import { convertToTextObject, locationMapping, platformNames } from '@/utils/constants';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
  try {
    await addItem('/empty-packages', { ...fields });
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
    await updateItem(`/empty-packages/${fields._id}`, fields);
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
    await removeItem('/empty-packages', {
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
      title: intl.formatMessage({ id: 'id' }),
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
      title: intl.formatMessage({ id: 'file' }),
      width: 100,
      dataIndex: 'file',
      hideInSearch: true,
      render: (_, record: any) => {
        if (!record.file) return intl.formatMessage({ id: 'no_file' });

        return (
          <a href={record.file} download target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({ id: 'download' })}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'upload_user' }),
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
      title: intl.formatMessage({ id: 'quantity' }),
      width: 80,
      dataIndex: 'quantity',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'is_processed' }),
      width: 100,
      dataIndex: 'isProcessed',
      hideInSearch: true,
      render: (_, record) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'yes' })}
          unCheckedChildren={intl.formatMessage({ id: 'no' })}
          checked={record.isProcessed}
          onChange={() => {
            handleUpdate({ _id: record._id, isProcessed: !record.isProcessed });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
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
          optionRender: (searchConfig, props, dom) => [
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
                  const response = await queryList('/empty-packages/export', {
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
            </Button>,
            ...dom,
          ],
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
          selectedRowsState?.length > 0 && (
            <Button
              key="download"
              onClick={() => {
                selectedRowsState.forEach((row) => {
                  const link = document.createElement('a');
                  link.href = row.file ?? '';
                  link.download = '';
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  link.click();
                });
              }}
            >
              <DownloadOutlined /> 批量下载
            </Button>
          ),
        ]}
        request={async (params, sort, filter) =>
          queryList('/empty-packages', { ...params, isProcessed: activeKey }, sort, filter)
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
                label: <FormattedMessage id="unprocessed" defaultMessage="Unprocessed" />,
                key: 'false',
              },
              {
                label: <FormattedMessage id="processed" defaultMessage="Processed" />,
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
