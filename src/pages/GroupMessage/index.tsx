import { useIntl, useModel } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Image, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import Show from './components/Show';
import HistoryModal from './components/HistoryModal';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import Update from './components/Update';

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/group-messages', {
      ids,
    });
    hide();
    message.success(<FormattedMessage id="delete_successful" defaultMessage="Delete successful" />);
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

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/group-messages/${fields._id}`, fields);
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

// const handleUpdate = async (fields: any) => {
//   const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
//   try {
//     await updateItem(`/group-messages/${fields._id}`, fields);
//     hide();

//     message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
//     return true;
//   } catch (error: any) {
//     hide();
//     message.error(
//       error?.response?.data?.message ?? (
//         <FormattedMessage id="update_failed" defaultMessage="Update failed, please try again!" />
//       ),
//     );
//     return false;
//   }
// };

const TableList: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  const columns: ProColumns<API.ItemData>[] = [
    // 代理
    {
      title: intl.formatMessage({ id: 'agent' }),
      dataIndex: 'agent',
      hideInTable: !currentUser?.isAdmin,
      hideInSearch: !currentUser?.isAdmin,
      renderText: (_, record) => record?.proxy?.name,
    },
    // 机器人
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      renderText: (bot) => bot?.botName,
    },
    // 群组
    {
      title: intl.formatMessage({ id: 'groups', defaultMessage: '所属群组' }),
      dataIndex: 'groups',
      hideInSearch: true,
      ellipsis: true,
      width: 200,
      renderText: (groups) => groups?.map((group: any) => group?.title).join(', '),
    },
    // 内容
    {
      title: intl.formatMessage({ id: 'content' }),
      dataIndex: 'content',
      hideInSearch: true,
      ellipsis: true,
      width: 200,
      render: (_, record) => (
        <div
          style={{ maxWidth: 200 }}
          dangerouslySetInnerHTML={{ __html: record.content || '-' }}
        />
      ),
    },
    // 媒体
    {
      title: intl.formatMessage({ id: 'media', defaultMessage: '媒体' }),
      dataIndex: 'medias',
      hideInSearch: true,
      width: 150,
      render: (_, record) => {
        if (!record.medias || !Array.isArray(record.medias) || record.medias.length === 0) {
          return '-';
        }

        const getMediaType = (filename: string): 'photo' | 'video' => {
          const ext = filename.toLowerCase().split('.').pop();
          const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'];
          return videoExtensions.includes(ext || '') ? 'video' : 'photo';
        };

        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {record.medias.slice(0, 3).map((media: string, idx: number) => {
              const mediaUrl = media.startsWith('http') ? media : `/api/static/${media}`;
              const mediaType = getMediaType(media);

              if (mediaType === 'video') {
                return (
                  <video
                    key={media || idx}
                    src={mediaUrl}
                    style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'cover' }}
                    muted
                  />
                );
              }
              return (
                <Image
                  key={media || idx}
                  src={mediaUrl}
                  alt={`media-${idx}`}
                  style={{ maxWidth: '40px', maxHeight: '40px' }}
                  preview
                />
              );
            })}
            {record.medias.length > 3 && (
              <span style={{ fontSize: 12, color: '#999' }}>+{record.medias.length - 3}</span>
            )}
          </div>
        );
      },
    },
    // 间隔时间
    {
      title: intl.formatMessage({ id: 'interval_time_hour' }),
      dataIndex: 'intervalTime',
      hideInSearch: true,
      width: 100,
      renderText: (intervalTime) =>
        intervalTime > 1 ? `${intervalTime} 小时` : `${intervalTime * 60} 分钟`,
    },
    // 状态
    {
      title: intl.formatMessage({ id: 'isOnline' }),
      dataIndex: 'isOnline',
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.isOnline}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isOnline: !record.isOnline });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    // 创建时间
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    // 操作
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
      dataIndex: 'option',
      valueType: 'option',
      width: 300,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="详情" />
        </a>,
        <a
          key="history"
          onClick={() => {
            setCurrentRow(record);
            setHistoryModalOpen(true);
          }}
        >
          <FormattedMessage id="send_history" defaultMessage="发送历史" />
        </a>,
        access.canUpdateGroupMessage && (
          <a
            key="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            <FormattedMessage id="edit" defaultMessage="编辑" />
          </a>
        ),
        access.canDeleteGroupMessage && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
              actionRef.current?.reload();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'groupMessage_list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 2000 }}
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                label: <FormattedMessage id="platform.all" defaultMessage="所有" />,
                key: '',
              },
              {
                label: <FormattedMessage id="platform.online" defaultMessage="Online" />,
                key: 'true',
              },
              {
                label: <FormattedMessage id="platform.offline" defaultMessage="Offline" />,
                key: 'false',
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
        request={(params, sort, filter) =>
          queryList(
            '/group-messages',
            {
              ...params,
              isOnline: activeKey, // 添加这个行
            },
            sort,
            filter,
          )
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
              <FormattedMessage id="pages.searchTable.chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" />
            </div>
          }
        >
          {access.canDeleteGroupMessage && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState.map((item) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          )}
        </FooterToolbar>
      )}

      {(access.canSuperAdmin || access.canUpdateBot) && (
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
          values={currentRow || ({} as any)}
        />
      )}

      <Show
        open={showDetail}
        currentRow={currentRow || ({} as API.ItemData)}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />

      <HistoryModal
        open={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setCurrentRow(undefined);
        }}
        groupMessageId={currentRow?._id}
        currentRow={currentRow}
      />
    </PageContainer>
  );
};

export default TableList;
