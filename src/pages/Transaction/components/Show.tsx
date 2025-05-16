import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';
import TransactionTable from './TransactionTable';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({
    current: 1,
    pageSize: 5,
  });
  const filteredColumns = columns
    .filter((col) => col.dataIndex !== 'option')
    .filter((_, index) => index !== 3);

  const query = async () => {
    setLoading(true);
    const response = (await queryList(`/transactions/all`, {}, {})) as any;

    if (response?.success) {
      const filtereds = response?.data?.filter(
        (item: any) => item.botUser._id.toString() === currentRow?._id?.toString(),
      );
      setTransactions(filtereds);
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
      width="80%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow && (
        <>
          <ProDescriptions<API.ItemData>
            column={1}
            title={`账单记录`}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?._id,
            }}
            columns={filteredColumns as ProDescriptionsItemProps<API.ItemData>[]}
            bordered
            size="middle"
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
