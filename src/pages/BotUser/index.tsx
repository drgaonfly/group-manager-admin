import { useIntl, useModel } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import CopyToClipboard from '@/components/CopyToClipboard';
// import { Input } from 'antd';
import ActionButton from '@/components/ActionButton';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    await addItem('/bot-users', { ...fields });
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
    await updateItem(`/bot-users/${fields._id}`, fields);
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
    await removeItem('/bot-users', {
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
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  // Define roles object with index signature

  const columns: ProColumns<any>[] = [
    // proxy
    {
      title: intl.formatMessage({ id: 'agent' }),
      dataIndex: 'agent',
      copyable: true,
      hideInTable: !currentUser?.isAdmin,
      hideInSearch: true,
      renderText: (_, record) => {
        return record?.proxy?.name;
      },
    },
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
      copyable: true,
    },
    //userName
    {
      title: intl.formatMessage({ id: 'userName' }),
      dataIndex: 'userName',
      render: (_, record) => {
        const link = `@${record.userName}`;
        if (record.userName) {
          return (
            <span>
              @{record.userName}
              <CopyToClipboard text={link} />
            </span>
          );
        }
      },
    },
    // frist_name
    {
      title: intl.formatMessage({ id: 'first_name_user_telegram' }),
      dataIndex: 'firstName',
      hideInSearch: true,
      copyable: true,
    },
    // last_name
    {
      title: intl.formatMessage({ id: 'last_name_user_telegram' }),
      dataIndex: 'lastName',
      hideInSearch: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'promotion_link', defaultMessage: '推广链接' }),
      dataIndex: 'promotionLink',
      hideInSearch: true,
      render: (_, record: any) => {
        const promotionLink = record.promotionLink;
        if (!promotionLink) {
          return '-';
        }
        return (
          <div>
            <div>
              <strong>{promotionLink.title || '-'}</strong>
            </div>
            {promotionLink.link && (
              <div>
                <a href={promotionLink.link} target="_blank" rel="noopener noreferrer">
                  {promotionLink.link}
                </a>
                <CopyToClipboard text={promotionLink.link} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <ActionButton
          key="detail"
          type="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="platforms.detail" defaultMessage="platforms.detail" />
        </ActionButton>,
        access.canDeleteBotUser && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<any, any>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{
          collapsed: false,
        }}
        request={(params, sort, filter) => queryList('/bot-users', params, sort, filter)}
        columns={columns}
        rowSelection={
          access.canSuperAdmin && {
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }
        }
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
          {(access.canSuperAdmin || access.canDeleteBotUser) && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState?.map((item: any) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          )}
        </FooterToolbar>
      )}
      {(access.canSuperAdmin || access.canCreateBotUser) && (
        <Create
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          onFinish={async (value) => {
            const success = await handleAdd({
              ...value,
            });
            if (success) {
              handleModalOpen(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      )}
      {(access.canSuperAdmin || access.canUpdateBotUser) && (
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
      )}
      <Show
        open={showDetail}
        currentRow={currentRow}
        columns={columns as ProDescriptionsItemProps<any>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
      <Modal
        title={intl.formatMessage({ id: 'video_player', defaultMessage: '视频播放' })}
        open={videoModalOpen}
        onCancel={() => setVideoModalOpen(false)}
        footer={null}
        width={800}
      ></Modal>
    </PageContainer>
  );
};

export default TableList;
