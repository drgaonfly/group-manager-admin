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
import { MessageType } from '@/enums/message';
import moment from 'moment';

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/messages', {
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
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<any[]>([]);
  const access = useAccess();

  const columns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'messageType' }),
      dataIndex: 'messageType',
      hideInSearch: true,
      valueEnum: {
        text: { text: intl.formatMessage({ id: 'text' }) },
        photo: { text: intl.formatMessage({ id: 'image' }) },
        command: { text: intl.formatMessage({ id: 'command' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'content' }),
      dataIndex: 'content',
      hideInSearch: true,
      ellipsis: true,
      copyable: true,
      render: (_, record) => {
        if (record.messageType === 'photo') {
          return <Image src={record.content} alt="message" style={{ maxWidth: '100px' }} preview />;
        }
        return record.content;
      },
    },
    // username
    {
      title: intl.formatMessage({ id: 'user' }),
      dataIndex: 'username',
      render: (_, record) => {
        return record.username || record.first_name + '' + record.last_name;
      },
    },
    // from
    // {
    //   title: intl.formatMessage({ id: 'from' }),
    //   hideInSearch: true,
    //   render: (_, record) => {
    //     return `
    //     ${intl.formatMessage({ id: 'id' })}: ${record.from.id}
    //     ${intl.formatMessage({ id: 'is_bot' })}: ${record.is_bot}
    //     ${intl.formatMessage({ id: 'username' })}: ${record.username || record.first_name + record.last_name}
    //     ${intl.formatMessage({ id: 'language_code' })}: ${record.language_code}
    //     `;
    //   },
    // },
    // chat_type
    {
      title: intl.formatMessage({ id: 'group' }),
      dataIndex: 'chat_title',
    },
    // chat
    // {
    //   title: intl.formatMessage({ id: 'chat' }),
    //   hideInSearch: true,
    //   render: (_, record) => {
    //     return `
    //     ${intl.formatMessage({ id: 'id' })}: ${record.chat_id}
    //     ${intl.formatMessage({ id: 'title' })}: ${record.chat_title}
    //     ${intl.formatMessage({ id: 'type' })}: ${record.chat_type}
    //     `;
    //   }
    // },
    {
      title: intl.formatMessage({ id: 'date' }),
      dataIndex: 'date',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => moment(record.date * 1000).format('YYYY-MM-DD HH:mm:ss'),
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
        access.canDeleteMessage && (
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
      <ProTable<any, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'message_list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{
          labelWidth: 120,
          collapsed: true,
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
              {
                label: intl.formatMessage({ id: 'text' }),
                key: MessageType.TEXT,
              },
              {
                label: intl.formatMessage({ id: 'image' }),
                key: MessageType.PHOTO,
              },
              {
                label: intl.formatMessage({ id: 'video' }),
                key: MessageType.VIDEO,
              },
              {
                label: intl.formatMessage({ id: 'voice' }),
                key: MessageType.VOICE,
              },
              {
                label: intl.formatMessage({ id: 'document' }),
                key: MessageType.DOCUMENT,
              },
              {
                label: intl.formatMessage({ id: 'sticker' }),
                key: MessageType.STICKER,
              },
              {
                label: intl.formatMessage({ id: 'location' }),
                key: MessageType.LOCATION,
              },
              {
                label: intl.formatMessage({ id: 'command' }),
                key: MessageType.COMMAND,
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
          queryList('/messages', { ...params, messageType: activeKey }, sort, filter)
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
          {access.canDeleteMessage && (
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
        currentRow={currentRow}
        columns={columns as ProDescriptionsItemProps<any>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
