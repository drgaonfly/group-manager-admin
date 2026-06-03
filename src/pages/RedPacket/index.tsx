import React, { useRef, useState } from 'react';
import { useIntl, FormattedMessage, useAccess } from '@umijs/max';
import { PageContainer, ProTable, FooterToolbar } from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { message, Tag } from 'antd';
import { EyeOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { queryList, removeItem } from '@/services/ant-design-pro/api';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import Show from './components/Show';
import ClaimsDrawer from './components/ClaimsDrawer';

const STATUS_COLOR: Record<string, string> = {
  active: 'processing',
  completed: 'success',
  expired: 'default',
  cancelled: 'error',
};

const STATUS_LABEL: Record<string, string> = {
  active: '进行中',
  completed: '已领完',
  expired: '已过期',
  cancelled: '已取消',
};

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="删除中..." />);
  try {
    await removeItem('/red-packets', { ids });
    hide();
    message.success(<FormattedMessage id="delete_successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '删除失败，请重试');
    return false;
  }
};

const RedPacketList: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [activeKey, setActiveKey] = useState<string>('');
  const [currentRow, setCurrentRow] = useState<API.ItemData | undefined>();
  const [showDetail, setShowDetail] = useState(false);
  const [claimsRow, setClaimsRow] = useState<API.ItemData | null>(null);
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: 'ID',
      dataIndex: '_id',
      width: 90,
      copyable: true,
      hideInSearch: true,
      render: (_, r) => <span style={{ fontSize: 12 }}>{String(r._id).slice(-6)}</span>,
    },
    {
      title: intl.formatMessage({ id: 'agent', defaultMessage: '代理' }),
      dataIndex: 'proxy',
      hideInSearch: true,
      hideInTable: !access.canSuperAdmin,
      renderText: (_: any, r: any) => r?.proxy?.name,
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: 'Bot' }),
      dataIndex: 'bot',
      renderText: (bot: any) => bot?.botName,
    },
    {
      title: intl.formatMessage({ id: 'group', defaultMessage: '群组' }),
      dataIndex: 'group',
      hideInSearch: true,
      renderText: (g: any) => g?.title || g?.name || '-',
    },
    {
      title: intl.formatMessage({ id: 'creator', defaultMessage: '发起人' }),
      dataIndex: 'creator',
      renderText: (u: any) => u?.userName || u?.firstName || '-',
    },
    {
      title: intl.formatMessage({ id: 'totalPoints', defaultMessage: '总积分' }),
      dataIndex: 'totalPoints',
      hideInSearch: true,
      width: 90,
    },
    {
      title: intl.formatMessage({ id: 'totalSlots', defaultMessage: '总份数' }),
      dataIndex: 'totalSlots',
      hideInSearch: true,
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'pointsPerSlot', defaultMessage: '每份' }),
      dataIndex: 'pointsPerSlot',
      hideInSearch: true,
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'bombNumbers', defaultMessage: '炸弹数字' }),
      dataIndex: 'bombNumbers',
      hideInSearch: true,
      width: 120,
      render: (_: any, r: any) =>
        r.bombNumbers?.length > 0
          ? r.bombNumbers.map((n: number) => (
              <Tag key={n} color="red" style={{ marginBottom: 2 }}>
                {n}
              </Tag>
            ))
          : '-',
    },
    {
      title: intl.formatMessage({ id: 'bombMultiplier', defaultMessage: '惩罚倍率' }),
      dataIndex: 'bombMultiplier',
      hideInSearch: true,
      width: 90,
      renderText: (v: number) => `×${v}`,
    },
    {
      title: intl.formatMessage({ id: 'claimed', defaultMessage: '已领' }),
      dataIndex: 'claims',
      hideInSearch: true,
      width: 80,
      render: (_: any, r: any) => `${r.claims?.length ?? 0} / ${r.totalSlots}`,
    },
    {
      title: intl.formatMessage({ id: 'allBombed', defaultMessage: '全炸' }),
      dataIndex: 'allBombed',
      hideInSearch: true,
      width: 70,
      render: (_: any, r: any) =>
        r.allBombed ? <Tag color="volcano">💥 是</Tag> : <Tag color="default">否</Tag>,
    },
    {
      title: intl.formatMessage({ id: 'status', defaultMessage: '状态' }),
      dataIndex: 'status',
      hideInSearch: true,
      width: 90,
      render: (_: any, r: any) => (
        <Tag color={STATUS_COLOR[r.status] ?? 'default'}>{STATUS_LABEL[r.status] ?? r.status}</Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'expiredAt', defaultMessage: '过期时间' }),
      dataIndex: 'expiredAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 150,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 130,
      render: (_: any, record: any) => [
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <EyeOutlined /> <FormattedMessage id="detail" defaultMessage="详情" />
        </a>,
        <a key="claims" style={{ marginLeft: 8 }} onClick={() => setClaimsRow(record)}>
          <UnorderedListOutlined /> <FormattedMessage id="claims" defaultMessage="领取记录" />
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
        headerTitle={intl.formatMessage({ id: 'redPacket_list', defaultMessage: '红包列表' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        size="small"
        search={{ collapsed: false, labelWidth: 120 }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey,
            items: [
              { label: '全部', key: '' },
              { label: '进行中', key: 'active' },
              { label: '已领完', key: 'completed' },
              { label: '已过期', key: 'expired' },
              { label: '已取消', key: 'cancelled' },
            ],
            onChange: (key: any) => {
              setActiveKey(key);
              actionRef.current?.reload();
            },
          },
        }}
        request={(params, sort, filter) =>
          queryList('/red-packets', { ...params, status: activeKey || undefined }, sort, filter)
        }
        columns={columns}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
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
          <DeleteButton
            onOk={async () => {
              await handleRemove(selectedRowsState.map((r) => r._id!));
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

      <ClaimsDrawer open={!!claimsRow} redPacket={claimsRow} onClose={() => setClaimsRow(null)} />
    </PageContainer>
  );
};

export default RedPacketList;
