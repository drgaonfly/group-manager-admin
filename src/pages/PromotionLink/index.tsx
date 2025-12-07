import { useIntl } from '@umijs/max';
import { addItem, simpleGet, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import BotUserListModal from '@/components/BotUserListModal';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import CopyToClipboard from '@/components/CopyToClipboard';
import ActionButton from '@/components/ActionButton';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading('添加中...');
  try {
    await addItem('/promotion-links', { ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '添加失败');
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
    await updateItem(`/promotion-links/${fields._id}`, fields);
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
    await removeItem('/promotion-links', { ids });
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
  const [userListVisible, setUserListVisible] = useState<boolean>(false);
  const [userListTitle, setUserListTitle] = useState<string>('');
  const [userListData, setUserListData] = useState<any[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'title', defaultMessage: '标题' }),
      dataIndex: 'title',
      width: 300,
      render: (text) => {
        if (!text) return '-';
        return (
          <Tooltip placement="topLeft" title={text}>
            <span>{text}</span>
          </Tooltip>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'user_count', defaultMessage: '用户数量' }),
      dataIndex: 'botUserConfigs',
      width: 120,
      hideInSearch: true,
      render: (_, record: any) => {
        const count = Array.isArray(record.botUserConfigs) ? record.botUserConfigs.length : 0;
        if (!count) {
          return 0;
        }
        return (
          <span>
            {count}{' '}
            <UserOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setUserListTitle(
                  `${intl.formatMessage({ id: 'user', defaultMessage: '用户' })} - ${
                    record.title || '-'
                  }`,
                );
                setUserListData(record.botUserConfigs || []);
                setUserListVisible(true);
              }}
            />
          </span>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'bot_link', defaultMessage: '机器人链接' }),
      dataIndex: 'botLink',
      width: 320,
      hideInSearch: true,
      ellipsis: true,
      render: (_, record: any) => {
        const bot = record.bot;
        const code = record.code;
        if (!bot || !bot.userName || !code) {
          return '-';
        }
        const botLink = `https://t.me/${bot.userName}?start=${code}`;
        return (
          <span>
            <a href={botLink} target="_blank" rel="noopener noreferrer">
              {botLink}
            </a>
            <CopyToClipboard text={botLink} />
          </span>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'promotion_content', defaultMessage: '推广内容' }),
      dataIndex: 'promotionContent',
      width: 120,
      hideInSearch: true,
      render: (_, record: any) => {
        const bot = record.bot;
        const message = bot?.message;
        if (!message) {
          return '-';
        }
        return <CopyToClipboard text={message} />;
      },
    },
    {
      title: intl.formatMessage({ id: 'link', defaultMessage: '链接' }),
      dataIndex: 'link',
      width: 300,
      ellipsis: true,
      render: (_, record: any) => {
        if (!record.link) {
          return '-';
        }

        const isValidUrl = record.link.startsWith('http://') || record.link.startsWith('https://');

        return (
          <span>
            {isValidUrl ? (
              <a href={record.link} target="_blank" rel="noopener noreferrer">
                {record.link}
              </a>
            ) : (
              <span>{record.link}</span>
            )}
            <CopyToClipboard text={record.link} />
          </span>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'invite_code', defaultMessage: '邀请码' }),
      dataIndex: 'code',
      width: 120,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      width: 200,
      hideInSearch: true,
      ellipsis: true,
      render: (_, record: any) => {
        const bot = record.bot;
        if (!bot) {
          return '-';
        }
        const botName = bot.botName || bot.userName || '-';
        const botUsername = bot.userName ? `(@${bot.userName})` : '';
        return `${botName} ${botUsername}`.trim();
      },
    },
    {
      title: intl.formatMessage({ id: 'remark', defaultMessage: '备注' }),
      dataIndex: 'remark',
      width: 200,
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.searchTable.titleOption',
        defaultMessage: 'Operating',
      }),
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <ActionButton
          key="detail"
          type="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="Detail" />
        </ActionButton>,
        access.canUpdatePromotionLink && (
          <ActionButton
            key="edit"
            type="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </ActionButton>
        ),
        access.canDeletePromotionLink && (
          <DeleteLink
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
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        toolBarRender={() => [
          access.canCreatePromotionLink && (
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
        request={async (params) => {
          const res = await simpleGet<{
            success: boolean;
            data: any[];
            total: number;
          }>('/promotion-links', {
            ...params,
          });
          return {
            data: Array.isArray(res.data) ? res.data : (res as any).data?.data ?? [],
            success: (res as any).success ?? true,
            total: (res as any).total ?? 0,
          } as any;
        }}
        columns={columns}
        rowSelection={
          access.canSuperAdmin && {
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }
        }
      />
      <BotUserListModal
        open={userListVisible}
        title={userListTitle}
        data={userListData}
        onClose={() => {
          setUserListVisible(false);
          setUserListData([]);
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
          {access.canDeletePromotionLink && (
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
      {access.canCreatePromotionLink && (
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
      )}
      {access.canUpdatePromotionLink && (
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
