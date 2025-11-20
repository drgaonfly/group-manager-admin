import { useIntl } from '@umijs/max';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Image } from 'antd';
import React, { useRef, useState } from 'react';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ActionButton from '@/components/ActionButton';
import MessageType from '@/enums/message';
import moment from 'moment';

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/bot-messages', {
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
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();

  const messageTypeEnum = MessageType();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'messageType' }),
      dataIndex: 'messageType',
      hideInSearch: true,
      renderText: (_, record) => {
        return intl.formatMessage({ id: `${record.messageType}` });
      },
    },
    {
      title: intl.formatMessage({ id: 'content' }),
      dataIndex: 'content',
      ellipsis: true,
      hideInSearch: true,
      renderText: (_, record) => {
        if (record.messageType === 'photo') {
          return <Image src={record.content} alt="message" style={{ maxWidth: '100px' }} preview />;
        }
        return (
          <div
            style={{
              maxWidth: '200px',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            {record.content}
          </div>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'user' }),
      dataIndex: 'botUser',
      copyable: true,
      renderText: (botUser) => botUser?.userName || botUser?.displayName,
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      copyable: true,
      renderText: (bot) => bot?.botName,
    },
    {
      title: intl.formatMessage({ id: 'group', defaultMessage: '所属群组' }),
      dataIndex: 'group',
      copyable: true,
      renderText: (group) => group?.title,
    },
    {
      title: intl.formatMessage({ id: 'telegramMessageId', defaultMessage: '电报消息ID' }),
      dataIndex: 'telegramMessageId',
      hideInSearch: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'proxyUser', defaultMessage: '代理用户' }),
      dataIndex: 'proxyUser',
      hideInSearch: true,
      renderText: (proxyUser) => proxyUser?.userName || proxyUser?.name || '-',
    },
    {
      title: intl.formatMessage({ id: 'isOwnerReply', defaultMessage: '是否拥有者回复' }),
      dataIndex: 'isOwnerReply',
      hideInSearch: true,
      valueType: 'select',
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'yes', defaultMessage: '是' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'no', defaultMessage: '否' }), status: 'Default' },
      },
      renderText: (_, record) =>
        record.isOwnerReply
          ? intl.formatMessage({ id: 'yes', defaultMessage: '是' })
          : intl.formatMessage({ id: 'no', defaultMessage: '否' }),
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
        <ActionButton
          key="detail"
          type="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="详情" />
        </ActionButton>,
        access.canDeleteBotMessage && (
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
        headerTitle={intl.formatMessage({ id: 'botMessage_list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
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
                label: <FormattedMessage id="platform.all" defaultMessage="all" />,
                key: '',
              },
              ...Object.keys(messageTypeEnum).map((key) => ({
                label: intl.formatMessage({
                  id: messageTypeEnum[key as keyof typeof messageTypeEnum].text,
                }),
                key: messageTypeEnum[key as keyof typeof messageTypeEnum].value,
              })),
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
          queryList('/bot-messages', { ...params, messageType: activeKey }, sort, filter)
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
          {access.canDeleteBotMessage && (
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
