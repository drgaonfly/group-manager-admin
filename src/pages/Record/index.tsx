import { useIntl } from '@umijs/max';
import { queryList } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import Show from './components/Show';
import { NetworkEnum } from '@/enums/networkEnum';

const TableList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
    },
    {
      title: intl.formatMessage({ id: 'wallet' }),
      dataIndex: 'address',
      renderText: (text, record) => record.address || record.customer?.address,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: 'network',
      valueEnum: NetworkEnum,
      renderText: (text, record) => record.network || record.customer?.network,
    },
    {
      title: intl.formatMessage({ id: 'type' }),
      dataIndex: 'type',
      valueEnum: {
        'usdt to eth': { text: 'USDT to ETH' },
        'eth to usdt': { text: 'ETH to USDT' },
      },
    },
    {
      title: intl.formatMessage({ id: 'amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        search={{ labelWidth: 100 }}
        request={async (params, sort, filter) => queryList('/records', params, sort, filter)}
        columns={columns}
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
