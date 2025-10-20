import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Image, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import Update from './components/Update';
import moment from 'moment';

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
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'agent' }),
      dataIndex: 'agent',
      copyable: true,
      hideInTable: !access.canSuperAdmin,
      hideInSearch: true,
      renderText: (_, record) => {
        return record?.proxy?.name;
      },
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      copyable: true,
      renderText: (bot) => bot?.botName,
    },
    {
      title: intl.formatMessage({ id: 'groups', defaultMessage: '所属群组' }),
      dataIndex: 'groups',
      copyable: true,
      renderText: (groups) => groups?.map((group: any) => group?.title).join(','),
    },
    // weight
    {
      title: intl.formatMessage({ id: 'weight', defaultMessage: '权重' }),
      dataIndex: 'weight',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'isOnline' }),
      dataIndex: 'isOnline',
      hideInSearch: false,
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
    // 每行菜单数
    {
      title: intl.formatMessage({ id: 'menus_per_row', defaultMessage: '每行菜单数' }),
      dataIndex: 'menus_per_row',
      hideInSearch: true,
    },
    // image
    {
      title: intl.formatMessage({ id: 'image', defaultMessage: '图片' }),
      dataIndex: 'images',
      hideInSearch: true,
      render: (_, record) => {
        if (!record.images || !Array.isArray(record.images) || record.images.length === 0) {
          return null;
        }
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {record.images.map((img: string, idx: number) => (
              <Image
                key={img || idx}
                src={img}
                alt={`message-${idx}`}
                style={{ maxWidth: '100px', maxHeight: '100px' }}
                preview
              />
            ))}
          </div>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'content' }),
      dataIndex: 'content',
      ellipsis: true,
      width: 200,
      hideInSearch: true,
    },
    // isRealtime
    {
      title: intl.formatMessage({ id: 'isRealtime' }),
      dataIndex: 'isRealtime',
      hideInSearch: true,
      renderText: (isRealtime) =>
        isRealtime ? intl.formatMessage({ id: 'yes' }) : intl.formatMessage({ id: 'no' }),
    },
    // intervalTime
    {
      title: intl.formatMessage({ id: 'interval_time_hour' }),
      dataIndex: 'intervalTime',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
      dataIndex: 'option',
      valueType: 'option',
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
        access.canDeleteGroupMessage && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
              actionRef.current?.reload();
            }}
          />
        ),
        access.canUpdateGroupMessage && (
          <a
            key="edit"
            onClick={() => {
              console.log();

              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </a>
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
    </PageContainer>
  );
};

export default TableList;
