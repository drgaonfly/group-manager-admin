import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Switch, Image } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/channel-posts/${fields._id}`, fields);
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

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/channel-posts', {
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

const TableList: React.FC = () => {
  const intl = useIntl();
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    // proxy
    {
      title: intl.formatMessage({ id: 'proxy', defaultMessage: '代理' }),
      dataIndex: 'proxy',
      hideInSearch: !access.canSuperAdmin,
      hideInTable: !access.canSuperAdmin,
      renderText: (_, record) => {
        return record?.proxy?.name;
      },
    },
    // bot
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      renderText: (_, record) => {
        return record?.bot?.botName;
      },
    },

    {
      title: intl.formatMessage({ id: 'channel', defaultMessage: '频道' }),
      dataIndex: 'channel',
      hideInSearch: true,
      ellipsis: true,
      width: 200,
      render: (_, record) => {
        return record?.channel?.title || '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'content', defaultMessage: '推广内容' }),
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
    // medias
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
    {
      title: intl.formatMessage({ id: 'interval', defaultMessage: '间隔(分钟)' }),
      dataIndex: 'interval',
      hideInSearch: true,
      width: 100,
      renderText: (_, record) => {
        return `${record?.interval || 0}`;
      },
    },
    // weight
    {
      title: intl.formatMessage({ id: 'weight' }),
      dataIndex: 'weight',
      hideInSearch: true,
      renderText: (_, record) => {
        return `${record?.weight}`;
      },
    },
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
    {
      title: intl.formatMessage({ id: 'clearLastPost', defaultMessage: '清除上条消息' }),
      dataIndex: 'isClearLastPost',
      hideInSearch: true,
      width: 120,
      render: (_, record: any) => (
        <Switch
          checked={record.isClearLastPost}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isClearLastPost: !record.isClearLastPost });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'created_at' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
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
        access.canUpdateChannelPost && (
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
        access.canDeleteChannelPost && (
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
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        request={(params, sort, filter) => queryList('/channel-posts', params, sort, filter)}
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
          {access.canDeleteChannelPost && (
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

      {access.canUpdateChannelPost && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            }
          }}
          onCancel={() => {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
          }}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
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
    </PageContainer>
  );
};

export default TableList;
