import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import BotUserTable from './BotUserTable';
import TransactionTable from './TransactionTable';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns: cols } = props;
  const filteredColumns = cols.filter((col) => col.dataIndex !== 'option');
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({
    current: 1,
    pageSize: 5,
  });

  const query = async () => {
    setLoading(true);
    const { data, success } = (await queryList(`/groups/${currentRow._id}`, {}, {})) as any;

    if (success) {
      setTransactions(data.transactions);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (currentRow?._id) {
      query().catch(console.error);
    }
  }, [currentRow]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="60%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow?._id && (
        <>
          <ProDescriptions<API.ItemData>
            column={2}
            title={currentRow?.phoneNumber}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?._id,
            }}
            columns={filteredColumns as ProDescriptionsItemProps<API.ItemData>[]}
            style={{ marginTop: '20px' }}
            bordered
            labelStyle={{
              width: '10%',
              justifyContent: 'flex-end',
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
            }}
            contentStyle={{
              width: '50%',
              padding: '8px 16px',
            }}
            size="small"
            className="custom-descriptions"
          />
          <BotUserTable
            botUsers={currentRow?.botUsers || []}
            pagination={pagination}
            setPagination={setPagination}
          />
          <TransactionTable
            transactions={transactions}
            loading={loading}
            pagination={pagination}
            setPagination={setPagination}
          />
        </>
      )}
    </Modal>
  );
};

export default Show;
