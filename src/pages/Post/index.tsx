import { useIntl } from '@umijs/max';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/posts', { ids });
    hide();
    message.success(<FormattedMessage id="delete_successful" defaultMessage="Delete successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="delete_failed" defaultMessage="Delete failed, please try again" />
      ),
    );
    return false;
  }
};

const TableList: React.FC = () => {
  const intl = useIntl();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'agent', defaultMessage: '代理' }),
      dataIndex: 'proxy',
      hideInSearch: true,
      hideInTable: !access.canSuperAdmin,
      renderText: (proxy) => proxy?.name || '-',
    },
    {
      title: intl.formatMessage({ id: 'title', defaultMessage: '标题' }),
      dataIndex: 'title',
      ellipsis: true,
      render: (_, record) => (
        <a href={record.link} target="_blank" rel="noopener noreferrer">
          <LinkOutlined style={{ marginRight: 4 }} />
          {record.title}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: 'Bot' }),
      dataIndex: 'bot',
      hideInSearch: true,
      renderText: (bot) => bot?.botName || '-',
    },
    {
      title: intl.formatMessage({ id: 'source', defaultMessage: '来源频道' }),
      dataIndex: 'source',
      hideInSearch: true,
      renderText: (source) => source?.title || source?.username || '-',
    },
    {
      title: intl.formatMessage({ id: 'messageId', defaultMessage: '消息 ID' }),
      dataIndex: 'messageId',
      hideInSearch: true,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'link', defaultMessage: '链接' }),
      dataIndex: 'link',
      hideInTable: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 160,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        <a
          key="detail"
          style={{ color: '#1890ff' }}
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="详情" />
        </a>,
        <DeleteLink
          key="delete"
          onOk={async () => {
            await handleRemove([record._id!]);
            actionRef.current?.reload();
          }}
        />,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'post_list', defaultMessage: '帖子列表' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        size="small"
        search={{
          collapsed: false,
          labelWidth: 120,
        }}
        request={(params, sort, filter) => queryList('/posts', params, sort, filter)}
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
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="已选" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          <DeleteButton
            onOk={async () => {
              await handleRemove(selectedRowsState.map((item) => item._id!));
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
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
